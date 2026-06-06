"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { getUser, removeToken } from "@/lib/auth";
import { useState } from "react";
import { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/store/ui.store";

const BREADCRUMB_MAP: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/tests/create": ["Test Creation", "Create Test"],
  "/tests/[id]/edit": ["Test Creation", "Edit Test"],
  "/tests/[id]/questions": ["Test Creation", "Create Test", "Add Questions"],
  "/tests/[id]/preview": ["Test Creation", "Create Test", "Preview"],
};

function getBreadcrumbs(pathname: string): string[] {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];

  const testMatch = pathname.match(/^\/tests\/[^/]+\/(.+)$/);
  if (testMatch) {
    const segment = testMatch[1];
    if (segment === "edit") return ["Test Creation", "Edit Test"];
    if (segment === "questions")
      return ["Test Creation", "Create Test", "Add Questions"];
    if (segment === "preview")
      return ["Test Creation", "Create Test", "Preview"];
  }

  return ["Dashboard"];
}

function getInitials(name?: string): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbs(pathname);
  const [user] = useState<User | null>(() => getUser());
  const { toggleSidebar } = useUIStore();

  const displayName = user?.name ?? "Admin";

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 min-w-0 overflow-hidden">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="shrink-0">/</span>}
              <span
                className={cn(
                  i === crumbs.length - 1
                    ? "text-gray-700 font-medium truncate"
                    : "hidden sm:inline shrink-0"
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer select-none shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="leading-tight text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 focus:text-red-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
