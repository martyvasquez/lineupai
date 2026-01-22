'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']

interface GameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: Game | null
  onSave: (gameData: {
    opponent: string
    game_date: string
    game_time: string | null
    location: string | null
    innings: number
    scouting_report: string | null
  }) => Promise<void>
}

export function GameDialog({ open, onOpenChange, game, onSave }: GameDialogProps) {
  const [opponent, setOpponent] = useState('')
  const [gameDate, setGameDate] = useState('')
  const [gameTime, setGameTime] = useState('')
  const [location, setLocation] = useState('')
  const [innings, setInnings] = useState('6')
  const [scoutingReport, setScoutingReport] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (game) {
      setOpponent(game.opponent || '')
      setGameDate(game.game_date)
      setGameTime(game.game_time || '')
      setLocation(game.location || '')
      setInnings(String(game.innings || 6))
      setScoutingReport(game.scouting_report || '')
    } else {
      // Default to tomorrow's date for new games
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setOpponent('')
      setGameDate(tomorrow.toISOString().split('T')[0])
      setGameTime('')
      setLocation('')
      setInnings('6')
      setScoutingReport('')
    }
  }, [game, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!opponent.trim() || !gameDate) return

    setIsLoading(true)
    try {
      await onSave({
        opponent: opponent.trim(),
        game_date: gameDate,
        game_time: gameTime || null,
        location: location.trim() || null,
        innings: parseInt(innings, 10),
        scouting_report: scoutingReport.trim() || null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Add Game'}</DialogTitle>
          <DialogDescription>
            {game ? 'Update the game details.' : 'Schedule a new game for your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opponent">Opponent *</Label>
            <Input
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g., Tigers, Blue Jays"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Field, Diamond 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="innings">Number of Innings</Label>
            <Select value={innings} onValueChange={setInnings}>
              <SelectTrigger>
                <SelectValue placeholder="Select innings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 innings</SelectItem>
                <SelectItem value="5">5 innings</SelectItem>
                <SelectItem value="6">6 innings</SelectItem>
                <SelectItem value="7">7 innings</SelectItem>
                <SelectItem value="9">9 innings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scouting">Scouting Report</Label>
            <Textarea
              id="scouting"
              value={scoutingReport}
              onChange={(e) => setScoutingReport(e.target.value)}
              placeholder="Notes about the opposing team (e.g., strong pitching, weak outfield, key players to watch)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This info helps the AI optimize your lineup for this opponent.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !opponent.trim() || !gameDate}>
              {isLoading ? 'Saving...' : game ? 'Save Changes' : 'Add Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
