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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from './star-rating'
import { PositionToggles } from './position-toggles'
import { PositionStrengthEditor } from './position-strength-editor'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row'] & {
  player_ratings: Database['public']['Tables']['player_ratings']['Row'][] | null
  position_eligibility: Database['public']['Tables']['position_eligibility']['Row'] | null
}

export type PlayerRatings = {
  plate_discipline: number
  contact_ability: number
  run_speed: number
  batting_power: number
  fielding_hands: number
  fielding_throw_accuracy: number
  fielding_arm_strength: number
  baseball_iq: number
  attention: number
  fly_ball_ability: number
  pitch_control: number
  pitch_velocity: number
  pitch_composure: number
  catcher_ability: number
}

const defaultRatings: PlayerRatings = {
  plate_discipline: 0,
  contact_ability: 0,
  run_speed: 0,
  batting_power: 0,
  fielding_hands: 0,
  fielding_throw_accuracy: 0,
  fielding_arm_strength: 0,
  baseball_iq: 0,
  attention: 0,
  fly_ball_ability: 0,
  pitch_control: 0,
  pitch_velocity: 0,
  pitch_composure: 0,
  catcher_ability: 0,
}

interface PlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  onSave: (data: {
    name: string
    jersey_number: number | null
    active: boolean
    ratings: PlayerRatings
    eligibility: {
      can_pitch: boolean
      can_catch: boolean
      can_play_ss: boolean
      can_play_1b: boolean
    }
    position_strengths: string[]
    notes: string | null
  }) => Promise<void>
}

export function PlayerDialog({ open, onOpenChange, player, onSave }: PlayerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState<string>('')
  const [active, setActive] = useState(true)
  const [ratings, setRatings] = useState<PlayerRatings>(defaultRatings)
  const [eligibility, setEligibility] = useState({
    can_pitch: false,
    can_catch: false,
    can_play_ss: false,
    can_play_1b: false,
  })
  const [positionStrengths, setPositionStrengths] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (player) {
      setName(player.name)
      setJerseyNumber(player.jersey_number?.toString() ?? '')
      setActive(player.active ?? true)
      setPositionStrengths(player.position_strengths ?? [])
      setNotes(player.notes ?? '')

      // Find ratings for current season, or fall back to most recent
      const currentSeason = new Date().getFullYear().toString()
      const playerRatings = player.player_ratings?.find(r => r.season === currentSeason)
        || player.player_ratings?.[0]
      if (playerRatings) {
        setRatings({
          plate_discipline: playerRatings.plate_discipline ?? 0,
          contact_ability: playerRatings.contact_ability ?? 0,
          run_speed: playerRatings.run_speed ?? 0,
          batting_power: playerRatings.batting_power ?? 0,
          fielding_hands: playerRatings.fielding_hands ?? 0,
          fielding_throw_accuracy: playerRatings.fielding_throw_accuracy ?? 0,
          fielding_arm_strength: playerRatings.fielding_arm_strength ?? 0,
          baseball_iq: playerRatings.baseball_iq ?? 0,
          attention: playerRatings.attention ?? 0,
          fly_ball_ability: playerRatings.fly_ball_ability ?? 0,
          pitch_control: playerRatings.pitch_control ?? 0,
          pitch_velocity: playerRatings.pitch_velocity ?? 0,
          pitch_composure: playerRatings.pitch_composure ?? 0,
          catcher_ability: playerRatings.catcher_ability ?? 0,
        })
      } else {
        setRatings(defaultRatings)
      }

      const playerEligibility = player.position_eligibility
      if (playerEligibility) {
        setEligibility({
          can_pitch: playerEligibility.can_pitch ?? false,
          can_catch: playerEligibility.can_catch ?? false,
          can_play_ss: playerEligibility.can_play_ss ?? false,
          can_play_1b: playerEligibility.can_play_1b ?? false,
        })
      } else {
        setEligibility({ can_pitch: false, can_catch: false, can_play_ss: false, can_play_1b: false })
      }
    } else {
      // Reset form for new player
      setName('')
      setJerseyNumber('')
      setActive(true)
      setRatings(defaultRatings)
      setEligibility({ can_pitch: false, can_catch: false, can_play_ss: false, can_play_1b: false })
      setPositionStrengths([])
      setNotes('')
    }
  }, [player, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await onSave({
        name: name.trim(),
        jersey_number: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
        active,
        ratings,
        eligibility,
        position_strengths: positionStrengths,
        notes: notes.trim() || null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateRating = (key: keyof PlayerRatings, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{player ? 'Edit Player' : 'Add Player'}</DialogTitle>
          <DialogDescription>
            {player
              ? 'Update player information, ratings, and position eligibility.'
              : 'Add a new player to your roster.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Player name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jersey">Jersey Number</Label>
                <Input
                  id="jersey"
                  type="number"
                  min="0"
                  max="99"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="00"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active Player</Label>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6 mt-4">
              <p className="text-sm text-muted-foreground">
                Rate each skill from 1-5 stars based on your observation.
              </p>

              {/* Batting Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Batting</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Plate Discipline</Label>
                    <StarRating
                      value={ratings.plate_discipline}
                      onChange={(v) => updateRating('plate_discipline', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Contact Ability</Label>
                    <StarRating
                      value={ratings.contact_ability}
                      onChange={(v) => updateRating('contact_ability', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Batting Power</Label>
                    <StarRating
                      value={ratings.batting_power}
                      onChange={(v) => updateRating('batting_power', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Athletic Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Athletic</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Run Speed</Label>
                    <StarRating
                      value={ratings.run_speed}
                      onChange={(v) => updateRating('run_speed', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Baseball IQ</Label>
                    <StarRating
                      value={ratings.baseball_iq}
                      onChange={(v) => updateRating('baseball_iq', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Attention</Label>
                    <StarRating
                      value={ratings.attention}
                      onChange={(v) => updateRating('attention', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Fielding Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Fielding</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Fielding Hands</Label>
                    <StarRating
                      value={ratings.fielding_hands}
                      onChange={(v) => updateRating('fielding_hands', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Throw Accuracy</Label>
                    <StarRating
                      value={ratings.fielding_throw_accuracy}
                      onChange={(v) => updateRating('fielding_throw_accuracy', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Arm Strength</Label>
                    <StarRating
                      value={ratings.fielding_arm_strength}
                      onChange={(v) => updateRating('fielding_arm_strength', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Fly Ball Ability</Label>
                    <StarRating
                      value={ratings.fly_ball_ability}
                      onChange={(v) => updateRating('fly_ball_ability', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Pitching Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Pitching</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Pitch Control</Label>
                    <StarRating
                      value={ratings.pitch_control}
                      onChange={(v) => updateRating('pitch_control', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Pitch Velocity</Label>
                    <StarRating
                      value={ratings.pitch_velocity}
                      onChange={(v) => updateRating('pitch_velocity', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Pitch Composure</Label>
                    <StarRating
                      value={ratings.pitch_composure}
                      onChange={(v) => updateRating('pitch_composure', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Catching */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Catching</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Catcher Ability</Label>
                    <StarRating
                      value={ratings.catcher_ability}
                      onChange={(v) => updateRating('catcher_ability', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Coach Notes */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Coach Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this player (strengths, areas to improve, game day observations, etc.)"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Position Strengths</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add positions this player can play, ordered by strength.
                    The AI will try to place them at their strongest position.
                  </p>
                  <PositionStrengthEditor
                    positions={positionStrengths}
                    onChange={setPositionStrengths}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">Premium Position Eligibility</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    These restricted positions require specific skills.
                    Check the positions this player is qualified for.
                  </p>
                  <PositionToggles
                    eligibility={eligibility}
                    onChange={setEligibility}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Saving...' : player ? 'Save Changes' : 'Add Player'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
