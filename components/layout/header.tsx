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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, User } from 'lucide-react'
import { TeamSwitcher } from './team-switcher'
import { brandFont } from '@/lib/fonts'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Prevent hydration mismatch by only rendering dropdowns after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className={`text-xl ${brandFont.className}`}>
          Peanut Manager
        </Link>

        {teams.length > 0 && (
          <div className="ml-4 hidden md:block">
            <TeamSwitcher teams={teams} currentTeamId={effectiveTeamId} />
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="ml-auto flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary hidden md:inline-block ${
                pathname === link.href
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* User Menu - Desktop */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
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
            <Button variant="ghost" size="icon" disabled className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Hamburger Menu */}
          {mounted && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className={brandFont.className}>Peanut Manager</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {/* Team Switcher in Mobile Menu */}
                  {teams.length > 0 && (
                    <div className="pb-4 border-b">
                      <p className="text-xs text-muted-foreground mb-2">Current Team</p>
                      <TeamSwitcher teams={teams} currentTeamId={effectiveTeamId} />
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-accent ${
                          pathname === link.href
                            ? 'bg-accent text-primary font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Settings & Sign Out */}
                  <div className="pt-4 border-t border-border flex flex-col gap-2">
                    <Link
                      href="/dashboard/settings"
                      className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-accent text-muted-foreground"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-destructive/10 text-left text-destructive"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
