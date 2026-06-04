'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, ClipboardList, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: TrendingUp },
  { label: 'Test Creation', href: '/tests', icon: ClipboardList },
  { label: 'Test Tracking', href: '/tracking', icon: BarChart2 },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <span className="font-bold text-lg tracking-tight">
          <span className="inline-block border-2 border-green-500 text-green-600 px-1 mr-0.5 rounded-sm text-base">P</span>
          <span className="text-blue-600">rep</span>
          <span className="text-gray-800">Route</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href === '/tests' ? '/tests/create' : href}
              className={cn(
                'relative flex items-center gap-3 py-2.5 pr-4 pl-5 text-sm font-medium transition-colors',
                active
                  ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-blue-600 before:rounded-r'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
