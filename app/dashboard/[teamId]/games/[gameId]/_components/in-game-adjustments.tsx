'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings, UserMinus, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row']

interface InGameAdjustmentsProps {
  currentInnings: number
  players: Player[]
  availablePlayers: string[]
  onInningsChange: (innings: number) => void
  onMarkUnavailable: (playerIds: string[]) => void
  onRegenerateFrom: (inning: number) => void
  isGenerating?: boolean
}

export function InGameAdjustments({
  currentInnings,
  players,
  availablePlayers,
  onInningsChange,
  onMarkUnavailable,
  onRegenerateFrom,
  isGenerating = false,
}: InGameAdjustmentsProps) {
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false)
  const [selectedUnavailable, setSelectedUnavailable] = useState<string[]>([])
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [regenerateFromInning, setRegenerateFromInning] = useState<string>('1')

  const inningOptions = Array.from({ length: 9 }, (_, i) => i + 1)
  const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))

  const handleMarkUnavailable = () => {
    if (selectedUnavailable.length > 0) {
      onMarkUnavailable(selectedUnavailable)
      setSelectedUnavailable([])
      setShowUnavailableDialog(false)
    }
  }

  const handleRegenerate = () => {
    const inning = parseInt(regenerateFromInning, 10)
    if (inning >= 1 && inning <= currentInnings) {
      onRegenerateFrom(inning)
      setShowRegenerateDialog(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Adjust Innings */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Innings:</span>
        <Select
          value={currentInnings.toString()}
          onValueChange={(value) => onInningsChange(parseInt(value, 10))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {inningOptions.map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mark Player Unavailable */}
      <Dialog open={showUnavailableDialog} onOpenChange={setShowUnavailableDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <UserMinus className="h-4 w-4" />
            <span className="hidden sm:inline">Mark Unavailable</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Players Unavailable</DialogTitle>
            <DialogDescription>
              Select players who can no longer play. This will regenerate the lineup.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {availablePlayersList.map((player) => (
              <label
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-accent',
                  selectedUnavailable.includes(player.id) && 'bg-accent'
                )}
              >
                <Checkbox
                  checked={selectedUnavailable.includes(player.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUnavailable([...selectedUnavailable, player.id])
                    } else {
                      setSelectedUnavailable(selectedUnavailable.filter(id => id !== player.id))
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  {player.jersey_number && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      #{player.jersey_number}
                    </span>
                  )}
                  <span className="font-medium">{player.name}</span>
                </div>
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnavailableDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkUnavailable}
              disabled={selectedUnavailable.length === 0}
            >
              Mark Unavailable ({selectedUnavailable.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate from Inning */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isGenerating}
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Defensive Positions</DialogTitle>
            <DialogDescription>
              Keep positions from earlier innings and regenerate from a specific point.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">Regenerate starting from inning:</label>
            <Select
              value={regenerateFromInning}
              onValueChange={setRegenerateFromInning}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: currentInnings }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    Inning {n}
                    {n === 1 && ' (regenerate all)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Positions in innings 1-{Math.max(1, parseInt(regenerateFromInning, 10) - 1)} will be kept.
              Positions from inning {regenerateFromInning} onward will be regenerated.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isGenerating}>
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
