'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { TeamSwitcher } from './team-switcher'

interface Team {
  id: string
  name: string
  age_group: string | null
}

interface HeaderProps {
  teams?: Team[]
  currentTeamId?: string
}

export function Header({ teams = [], currentTeamId }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Prevent hydration mismatch by only rendering dropdowns after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Extract currentTeamId from pathname if not provided
  const effectiveTeamId = currentTeamId || extractTeamIdFromPath(pathname)

  // Build nav links based on whether we have a current team
  const navLinks = effectiveTeamId
    ? [
        { href: `/dashboard/${effectiveTeamId}`, label: 'Dashboard' },
        { href: `/dashboard/${effectiveTeamId}/roster`, label: 'Roster' },
        { href: `/dashboard/${effectiveTeamId}/rules`, label: 'Rules' },
        { href: `/dashboard/${effectiveTeamId}/games`, label: 'Games' },
        { href: `/dashboard/${effectiveTeamId}/stats`, label: 'Stats' },
      ]
    : []

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className="font-bold text-xl">
          LineupAI
        </Link>

        {teams.length > 0 && (
          <div className="ml-4">
            <TeamSwitcher teams={teams} currentTeamId={effectiveTeamId} />
          </div>
        )}

        <nav className="ml-auto flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary hidden md:inline-block ${
                pathname === link.href ? 'text-primary' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" disabled>
              <User className="h-5 w-5" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

function extractTeamIdFromPath(pathname: string): string | undefined {
  // pathname is like /dashboard/abc123/roster or /dashboard/abc123
  const parts = pathname.split('/')
  if (parts.length >= 3 && parts[1] === 'dashboard') {
    const potentialTeamId = parts[2]
    // Check if it looks like a UUID (or at least not a known static route)
    if (potentialTeamId && potentialTeamId !== 'settings') {
      return potentialTeamId
    }
  }
  return undefined
}
