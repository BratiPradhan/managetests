# Manage Tests

A test management admin panel — create tests, add questions, preview, and publish them. Built with Next.js (App Router), TypeScript, TanStack Query, and Zustand on top of a REST backend.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Server state:** TanStack Query (`@tanstack/react-query`) + Axios
- **Client/UI state:** Zustand
- **Forms & validation:** react-hook-form + Zod
- **Styling/UI:** Tailwind CSS 4, shadcn/ui (Radix / `@base-ui/react`)
- **Tooling:** pnpm

## Prerequisites

- Node.js 20+
- pnpm 9+

## Getting started

```bash
pnpm install

# create .env.local with the API base URL
echo "NEXT_PUBLIC_API_URL=https://your-backend.example.com/api" > .env.local

pnpm dev   # http://localhost:3000
```

You'll need a valid login (`userId` / `password`) issued by the backend — there's no local seed/mock data.

## Scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `pnpm dev`    | Run the dev server (Turbopack)       |
| `pnpm build`  | Production build + type check        |
| `pnpm start`  | Run the production build             |
| `pnpm lint`   | Run ESLint                           |

## Project structure

```
src/
  app/                  Routes (App Router)
    (auth)/login/       Public login page
    (protected)/        Authenticated app shell (layout does the auth gate)
      dashboard/        Test list
      tests/create/     New test wizard — step 1
      tests/[id]/edit/        Edit an existing test
      tests/[id]/questions/   Add/edit questions — step 2
      tests/[id]/preview/     Review & publish — step 3
  components/
    common/             App chrome: Sidebar, TopHeader, Pagination, QueryProvider
    dashboard/          Dashboard-only UI (TestTable, DeleteTestDialog)
    tests/              Test/question forms, editors, previews
    auth/               LoginForm
    ui/                 Generic shadcn/ui primitives (button, select, dialog, …)
  hooks/
    pages/              One hook per route — owns that page's data + interactions
                        (useDashboard, useQuestionsPage, usePreviewPage, …)
    use*.ts             Shared data hooks (subjects/topics/sub-topics)
  services/             Thin API wrappers around Axios (test, question, subject, auth)
  store/                Zustand stores (testFlow, ui)
  lib/                  axios client, auth/token helpers, query client + keys,
                        Zod schemas, misc utils/constants
  types/                Shared TypeScript types (mirrors API shapes)
```

## Conventions

- **Pages stay thin.** A route's `page.tsx` wires together a `hooks/pages/use*` hook (all the
  data fetching, mutations, and handlers) and presentational components — see
  `app/(protected)/dashboard/page.tsx` + `hooks/pages/useDashboard.ts` as the reference pair.
  This keeps the business layer (hooks/services/stores) separate from the view layer (components).
- **Server data → TanStack Query, transient UI/flow state → Zustand.** See `WRITEUP.md` for the
  reasoning. Query keys live in `lib/query-keys.ts`; always invalidate the relevant key(s) in a
  mutation's `onSuccess` (look at `TestForm.tsx` or `useQuestionsPage.ts` for the pattern) so
  dependent pages don't show stale data.
- **Validation lives in `lib/validations/*.schema.ts`** as Zod schemas, wired into
  react-hook-form via `zodResolver`. Forms infer their types from the schema
  (`z.infer<typeof schema>`).
- **API access goes through `services/*.ts`**, which call the shared `apiClient` in `lib/axios.ts`
  (handles the auth header and 401 redirect-to-login). Components/hooks should not call Axios
  directly.
- Minimise `"use client"` — keep it at the leaves (forms, interactive widgets) where hooks/state
  are actually needed.

## Auth

Login posts `{ userId, password }` to `/auth/login`, stores the returned token via
`lib/auth.ts` (`localStorage`), and the Axios instance attaches it as a `Bearer` header on every
request. A 401 response clears the token and redirects to `/login`. The `(protected)` layout
gates all authenticated routes client-side with `isAuthenticated()`.
