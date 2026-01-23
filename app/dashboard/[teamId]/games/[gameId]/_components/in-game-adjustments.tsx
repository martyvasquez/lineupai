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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  onRegenerateInnings: (innings: number[], feedback: string) => void
  isGenerating?: boolean
}

export function InGameAdjustments({
  currentInnings,
  players,
  availablePlayers,
  onInningsChange,
  onMarkUnavailable,
  onRegenerateInnings,
  isGenerating = false,
}: InGameAdjustmentsProps) {
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false)
  const [selectedUnavailable, setSelectedUnavailable] = useState<string[]>([])
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [selectedInnings, setSelectedInnings] = useState<number[]>([])
  const [regenerateFeedback, setRegenerateFeedback] = useState('')

  const inningOptions = Array.from({ length: 9 }, (_, i) => i + 1)
  const availablePlayersList = players.filter(p => availablePlayers.includes(p.id))
  const allInnings = Array.from({ length: currentInnings }, (_, i) => i + 1)
  const allSelected = selectedInnings.length === currentInnings

  const handleMarkUnavailable = () => {
    if (selectedUnavailable.length > 0) {
      onMarkUnavailable(selectedUnavailable)
      setSelectedUnavailable([])
      setShowUnavailableDialog(false)
    }
  }

  const handleToggleInning = (inning: number, checked: boolean) => {
    if (checked) {
      setSelectedInnings([...selectedInnings, inning].sort((a, b) => a - b))
    } else {
      setSelectedInnings(selectedInnings.filter(i => i !== inning))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInnings(allInnings)
    } else {
      setSelectedInnings([])
    }
  }

  const handleRegenerate = () => {
    if (selectedInnings.length > 0) {
      onRegenerateInnings(selectedInnings, regenerateFeedback.trim())
      setShowRegenerateDialog(false)
      setSelectedInnings([])
      setRegenerateFeedback('')
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
              Select which innings to regenerate. Unselected innings will keep their current positions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Innings to regenerate</Label>

              {/* Select All */}
              <label className={cn(
                'flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-accent',
                allSelected && 'bg-accent'
              )}>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">Select All</span>
              </label>

              {/* Individual innings */}
              <div className="grid grid-cols-3 gap-2">
                {allInnings.map((inning) => (
                  <label
                    key={inning}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-accent',
                      selectedInnings.includes(inning) && 'bg-accent'
                    )}
                  >
                    <Checkbox
                      checked={selectedInnings.includes(inning)}
                      onCheckedChange={(checked) => handleToggleInning(inning, !!checked)}
                    />
                    <span className="text-sm">Inning {inning}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regenerate-feedback">Feedback for AI</Label>
              <Textarea
                id="regenerate-feedback"
                placeholder="e.g., 'Move Jake to outfield', 'Cole should pitch inning 3', 'More rotation in infield'..."
                value={regenerateFeedback}
                onChange={(e) => setRegenerateFeedback(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tell the AI what changes you want. It will see the current lineup and your feedback.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isGenerating || selectedInnings.length === 0}>
              {isGenerating ? 'Regenerating...' : `Regenerate${selectedInnings.length > 0 ? ` (${selectedInnings.length})` : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
