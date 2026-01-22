'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Menu, User } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className="font-bold text-xl">
          LineupAI
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/dashboard/roster"
            className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
          >
            Roster
          </Link>
          <Link
            href="/dashboard/rules"
            className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
          >
            Rules
          </Link>
          <Link
            href="/dashboard/games"
            className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
          >
            Games
          </Link>
          <Link
            href="/dashboard/stats"
            className="text-sm font-medium transition-colors hover:text-primary hidden md:inline-block"
          >
            Stats
          </Link>

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
        </nav>
      </div>
    </header>
  )
}
