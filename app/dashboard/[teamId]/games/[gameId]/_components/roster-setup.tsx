'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row']
type GameRoster = Database['public']['Tables']['game_roster']['Row']

interface RosterSetupProps {
  players: Player[]
  gameRoster: GameRoster[]
  onUpdate: (
    playerId: string,
    updates: { available?: boolean; restrictions?: string | null }
  ) => Promise<void>
}

export function RosterSetup({ players, gameRoster, onUpdate }: RosterSetupProps) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  const getPlayerRoster = (playerId: string): GameRoster | undefined => {
    return gameRoster.find(r => r.player_id === playerId)
  }

  const isAvailable = (playerId: string): boolean => {
    const roster = getPlayerRoster(playerId)
    return roster?.available ?? true
  }

  const getRestrictions = (playerId: string): string => {
    const roster = getPlayerRoster(playerId)
    return roster?.restrictions ?? ''
  }

  const handleAvailabilityChange = async (playerId: string, available: boolean) => {
    await onUpdate(playerId, { available })
  }

  const handleNotesChange = async (playerId: string, notes: string) => {
    await onUpdate(playerId, { restrictions: notes || null })
  }

  const handleMarkAllAvailable = async () => {
    for (const player of players) {
      if (!isAvailable(player.id)) {
        await onUpdate(player.id, { available: true })
      }
    }
  }

  const handleMarkAllUnavailable = async () => {
    for (const player of players) {
      if (isAvailable(player.id)) {
        await onUpdate(player.id, { available: false })
      }
    }
  }

  const availableCount = players.filter(p => isAvailable(p.id)).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {availableCount} of {players.length} available
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllUnavailable}>
            Clear All
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllAvailable}>
            Mark All Available
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {players.map((player) => {
          const available = isAvailable(player.id)
          const notes = getRestrictions(player.id)
          const isEditing = editingNotes === player.id

          return (
            <div
              key={player.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                !available && 'bg-muted/50 opacity-75'
              )}
            >
              <Checkbox
                id={`available-${player.id}`}
                checked={available}
                onCheckedChange={(checked) =>
                  handleAvailabilityChange(player.id, checked === true)
                }
              />

              <div className="flex-1 min-w-0 flex items-center gap-2">
                {player.jersey_number && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    #{player.jersey_number}
                  </span>
                )}
                <span className={cn(
                  'font-medium truncate',
                  !available && 'line-through text-muted-foreground'
                )}>
                  {player.name}
                </span>
              </div>

              <div className="w-48 sm:w-64">
                {isEditing ? (
                  <Input
                    value={notes}
                    onChange={(e) => handleNotesChange(player.id, e.target.value)}
                    onBlur={() => setEditingNotes(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingNotes(null)
                    }}
                    placeholder="Notes..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setEditingNotes(player.id)}
                    className={cn(
                      'w-full h-8 px-2 text-left text-sm rounded border border-transparent hover:border-border truncate',
                      notes ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {notes || 'Add notes...'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            No players on roster. Add players first.
          </p>
        </div>
      )}
    </div>
  )
}
