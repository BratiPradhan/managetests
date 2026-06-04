'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { removeToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-lg tracking-tight">
          ManageTests
        </Link>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
