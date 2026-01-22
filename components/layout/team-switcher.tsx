'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Team {
  id: string
  name: string
  age_group: string | null
}

interface TeamSwitcherProps {
  teams: Team[]
  currentTeamId?: string
}

export function TeamSwitcher({ teams, currentTeamId }: TeamSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTeam = teams.find(t => t.id === currentTeamId)

  function handleTeamSwitch(teamId: string) {
    if (teamId === currentTeamId) return

    // Extract the path after /dashboard/[teamId]/ and preserve it
    const pathParts = pathname.split('/')
    // pathname is like /dashboard/abc123/roster or /dashboard/abc123
    // We want to replace abc123 with the new teamId

    // Check if we're on a non-team page (like /dashboard/settings/...)
    // These pages don't have a teamId in the path, so just go to the team's main page
    if (pathParts[2] === 'settings') {
      router.push(`/dashboard/${teamId}`)
      return
    }

    if (pathParts.length > 3) {
      // Has sub-path like /roster, /rules, etc.
      const subPath = pathParts.slice(3).join('/')
      router.push(`/dashboard/${teamId}/${subPath}`)
    } else {
      // Just /dashboard/[teamId]
      router.push(`/dashboard/${teamId}`)
    }
  }

  if (teams.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/dashboard/settings/teams">
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </a>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="max-w-[150px] truncate">
            {currentTeam?.name || 'Select Team'}
          </span>
          {currentTeam?.age_group && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({currentTeam.age_group})
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your Teams</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSwitch(team.id)}
            className={team.id === currentTeamId ? 'bg-accent' : ''}
          >
            <div className="flex flex-col">
              <span>{team.name}</span>
              {team.age_group && (
                <span className="text-xs text-muted-foreground">{team.age_group}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/settings/teams" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Manage Teams
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
