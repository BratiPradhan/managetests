# Architecture Writeup

This document explains the *why* behind the main architectural choices in this app, not the
*what* (the README and code cover that). It's aimed at whoever picks this up next.

## The core split: server state vs. client/flow state

The app draws a hard line between two kinds of state, and uses a different tool for each:

- **Server state** (tests, questions, subjects/topics/sub-topics — anything that lives in the
  backend) → **TanStack Query**
- **Client/UI and in-progress-flow state** (sidebar open/closed, the questions being drafted
  before they're saved) → **Zustand**

This isn't "two state libraries because we could" — they solve genuinely different problems, and
mixing them up is exactly what causes the class of bugs this codebase had (see *Lessons learned*
below).

### Why TanStack Query for server state

Server data is *cached, asynchronous, and shared* — the same test can be viewed from the
dashboard, the edit page, and the preview page. Hand-rolling that with `useEffect` + `useState`
means re-solving caching, de-duping concurrent requests, retries, background refetching, and
loading/error states on every page. TanStack Query gives us all of that for free, plus:

- **A single cache keyed by `lib/query-keys.ts`** (`['tests']`, `['test', id]`,
  `['questions', ...ids]`, …). Any page that asks for the same key gets the same cached data —
  no redundant fetches, no drift between pages.
- **Explicit invalidation as the sync mechanism.** When a mutation changes server data
  (`createTest`, `updateTest`, `bulkCreateQuestions`, `publishTest`, `deleteTest`), its
  `onSuccess` calls `queryClient.invalidateQueries({ queryKey: QUERY_KEYS.xxx })` for every key
  that could now be stale. This is the *one rule* that keeps the UI consistent: a mutation that
  writes to the server but doesn't invalidate the keys that read that data will show stale
  results until a hard refresh remounts the query. (`TestForm.tsx`, `useQuestionsPage.ts`,
  `usePreviewPage.ts`, and `DeleteTestDialog.tsx` are the reference implementations.)
- **DevTools for free** (`@tanstack/react-query-devtools`), which makes it trivial to see exactly
  which queries are stale/fetching/cached while debugging — much faster than stepping through
  custom fetch/cache code.
- **A sane default `staleTime` (5 minutes)** in `lib/query-client.ts` — data is treated as fresh
  for 5 minutes (no network chatter on every navigation), and mutations force a refetch via
  invalidation when something actually changes. This balances "don't hit the API on every click"
  against "don't show stale data after I just edited something."

### Why Zustand for client/flow state

Two things genuinely don't belong in the server cache:

1. **`ui.store.ts`** — purely presentational state (is the mobile sidebar open?). It has no
   server representation, doesn't need persistence, and would be awkward to thread through
   context just for one boolean. Zustand's `create` + selector hooks (`useUIStore((s) =>
   s.toggleSidebar)`) give us global access with minimal boilerplate and no provider wrapping.

2. **`testFlow.store.ts`** — the *in-progress* test-creation flow (the test being built, the
   questions being drafted across the create → add-questions → preview steps). This data is
   **not yet server state** — it's a multi-step form's working set that spans three routes. It
   needs to survive client-side navigation between those steps, but it isn't something we want
   TanStack Query to cache, retry, or background-refetch (it's local, mutable, and has no stable
   server identity until it's actually submitted). Zustand is a natural fit: a small, typed store
   (`questions`, `addQuestion`/`updateQuestion`/`removeQuestion`/`reset`) that the
   `useQuestionsPage` hook reads and writes as the user works, and that gets `reset()` once the
   flow completes (on publish).

Using Context/`useState` here would mean lifting state up through layouts and re-deriving it on
every navigation; using TanStack Query would mean inventing a fake "query" for data that isn't
actually being fetched. Zustand sits in the gap between the two — global, framework-agnostic,
no provider — which is exactly the shape this problem has.

## Why shadcn/ui (on Radix / `@base-ui`) for the component layer

`src/components/ui/*` (button, select, dialog, dropdown-menu, table, multi-select, …) are
generated via shadcn/ui (`components.json`, `style: "base-nova"`, base color `neutral`, icons
from `lucide-react`). A few reasons this fit better than a traditional component *library*:

- **You own the code, not a dependency.** shadcn/ui isn't an npm package you import — it's a CLI
  that copies styled, accessible component source straight into `components/ui/`. That means no
  black-box styling overrides, no fighting a library's theming API, and no version-lock risk; if
  a component needs a project-specific tweak (see the `correct_option`/`difficulty` controlled
  `Select` fix in `QuestionForm.tsx`), you just edit the file.
- **Accessibility and behavior come from Radix / `@base-ui/react`** underneath (focus trapping,
  keyboard nav, ARIA wiring for `Select`, `Dialog`, `DropdownMenu`, etc.) — exactly the kind of
  low-level correctness that's tedious and easy to get subtly wrong if hand-rolled, but that a
  small admin-panel team shouldn't need to maintain itself.
- **Tailwind-native styling** (via `class-variance-authority` + `tailwind-merge`/`cn`) means the
  same utility-class vocabulary is used everywhere — in generated `ui/` primitives and in
  hand-written page/feature components — so there's one styling mental model for the whole app,
  not "Tailwind for our code, a CSS-in-JS theme object for the library's."
- **Consistency without a heavy design-system investment.** For a focused 5-page admin tool, a
  full custom design system would be over-engineering; shadcn/ui's defaults (neutral base color,
  consistent spacing/radius scale) give a coherent look out of the box that can be incrementally
  customized as needs grow.

## Business logic vs. view layer

Per the project conventions (see `AGENTS.md`/`README.md`), each route's logic lives in a
`hooks/pages/use*` hook (data fetching, mutations, derived state, handlers), and the `page.tsx`
+ components are purely presentational. This keeps:

- Components testable/renderable without a network or store (pass props in, assert output).
- Business rules (what gets invalidated, what counts as "valid", how pagination/search interact)
  in one place per page, instead of smeared across JSX.
- The view free to be restyled/restructured without touching data logic, and vice versa.

## Lessons learned (and fixed)

Two real bugs in this codebase were direct consequences of *not* following the invalidation rule
above: `saveQuestions` (in `useQuestionsPage`) updated the test's question list on the server but
never invalidated `['test', id]` / `['questions', …]`, so the preview page rendered the cache from
before the save; and `publishTest` changed the test's status server-side but never invalidated
`['tests']`, so the dashboard kept showing it as "draft" until a manual refresh. Both were fixed
by adding the missing `queryClient.invalidateQueries(...)` calls in each mutation's `onSuccess` —
the same pattern already used correctly in `TestForm.tsx` and `DeleteTestDialog.tsx`. The
takeaway: **every mutation that writes server data must invalidate every query key that reads
that data**, and that's worth a lint rule or code-review checklist item going forward.

## Future improvements

- **Automated tests.** There are currently none. Highest-leverage additions, in order:
  - *Unit tests* for `hooks/pages/*` (the business layer) using React Testing Library +
    Vitest/Jest with `@tanstack/react-query`'s test utilities and MSW to mock the API — this is
    where the invalidation rule above could actually be enforced/regression-tested (e.g. "after
    `saveQuestions` succeeds, `['test', id]` and `['questions', …]` are invalidated").
  - *Component tests* for forms (`QuestionForm`, `TestForm`) covering validation messages and
    controlled-input edge cases (the `correct_option`/`difficulty` Select controlled-value fix is
    exactly the kind of regression a render test would catch).
  - *E2E tests* with Playwright for the golden path (login → create test → add questions →
    preview → publish → see it live on the dashboard) and the search/pagination flow.
- **Server-side search & pagination.** `useDashboard` currently fetches all tests and
  filters/paginates client-side (`getTests()` takes no params). That's fine at small scale but
  won't hold up as the test list grows — move `query`/`page`/`pageSize` into the API request.
- **Optimistic updates** for fast, low-risk mutations (e.g. delete-test, publish) using
  `onMutate`/`setQueryData` so the UI reflects the change immediately instead of waiting on the
  invalidated refetch — with rollback in `onError`.
- **Shared/generated types** from the backend's API schema (OpenAPI/tRPC-style) instead of the
  hand-maintained `types/index.ts`, to remove an entire class of "field renamed on the backend,
  frontend silently drifts" bugs (we already hit one of these — `QuestionEditor` referencing
  `topic`/`sub_topic` fields the schema no longer has).
- **Error boundaries & richer error states** — most pages currently show a flat "failed to load"
  string; a shared error boundary + retry affordance would be more resilient and consistent.
- **Accessibility pass** — forms/menus/dialogs are built on Radix/`@base-ui`, which is a good
  foundation, but a focused audit (focus management across the multi-step flow, keyboard nav on
  the table/pagination, color-contrast on status badges) is still worth doing.
