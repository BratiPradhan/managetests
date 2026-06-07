"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUIStore } from "@/store/ui.store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { label: "Test Creation", href: "/tests", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useUIStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        // Mobile: fixed drawer, slides in/out
        "fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 transition-transform duration-200",
        // Desktop: static, always visible
        "lg:static lg:translate-x-0 lg:z-auto lg:transition-none",
        // Mobile open/close
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 lg:border-none">
        <Image
          src="/assets/svgs/brand.svg"
          alt="Company Logo"
          width={120}
          height={40}
          className="h-10 object-contain"
          loading="eager"
        />
        {/* Close button — mobile only */}
        <button
          onClick={closeSidebar}
          className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href === "/tests" ? "/tests/create" : href}
              onClick={closeSidebar}
              className={cn(
                "relative flex items-center gap-3 py-2.5 pr-4 pl-5 text-sm font-medium transition-colors",
                active
                  ? "text-blue-600 bg-blue-50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-blue-600 before:rounded-r"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
