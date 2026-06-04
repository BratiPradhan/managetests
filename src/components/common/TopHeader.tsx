'use client'

import { usePathname } from 'next/navigation'
import { Bell, ChevronDown } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { User } from '@/types'

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/tests/create': ['Test Creation', 'Create Test'],
  '/tests/[id]/edit': ['Test Creation', 'Edit Test'],
  '/tests/[id]/questions': ['Test Creation', 'Create Test', 'Add Questions'],
  '/tests/[id]/preview': ['Test Creation', 'Create Test', 'Preview'],
}

function getBreadcrumbs(pathname: string): string[] {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname]

  // Dynamic routes: /tests/[id]/...
  const testMatch = pathname.match(/^\/tests\/[^/]+\/(.+)$/)
  if (testMatch) {
    const segment = testMatch[1]
    if (segment === 'edit') return ['Test Creation', 'Edit Test']
    if (segment === 'questions') return ['Test Creation', 'Create Test', 'Add Questions']
    if (segment === 'preview') return ['Test Creation', 'Create Test', 'Preview']
  }

  return ['Dashboard']
}

function getInitials(name?: string): string {
  if (!name) return 'A'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function TopHeader() {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const displayName = user?.name ?? 'Admin'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            <span className={i === crumbs.length - 1 ? 'text-gray-700 font-medium' : ''}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}
