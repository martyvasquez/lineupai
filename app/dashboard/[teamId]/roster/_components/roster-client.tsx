'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'
import { Plus, Search, Pencil, Trash2, Upload } from 'lucide-react'
import { PlayerDialog, type PlayerRatings } from './player-dialog'
import { RosterImportInline } from './roster-import-inline'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row'] & {
  player_ratings: Database['public']['Tables']['player_ratings']['Row'][] | null
  position_eligibility: Database['public']['Tables']['position_eligibility']['Row'] | null
}

interface RosterClientProps {
  initialPlayers: Player[]
  teamId: string
}

export function RosterClient({ initialPlayers, teamId }: RosterClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.jersey_number?.toString().includes(searchQuery)
  )

  const handleAddPlayer = () => {
    setEditingPlayer(null)
    setDialogOpen(true)
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setDialogOpen(true)
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete player.',
        variant: 'destructive',
      })
      return
    }

    setPlayers(players.filter(p => p.id !== playerId))
    toast({
      title: 'Player deleted',
      description: 'The player has been removed from your roster.',
    })
  }

  const handleSavePlayer = async (playerData: {
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
  }) => {
    if (editingPlayer) {
      // Update existing player
      const { error: playerError } = await supabase
        .from('players')
        .update({
          name: playerData.name,
          jersey_number: playerData.jersey_number,
          active: playerData.active,
          position_strengths: playerData.position_strengths,
          notes: playerData.notes,
        })
        .eq('id', editingPlayer.id)

      if (playerError) {
        toast({
          title: 'Error',
          description: 'Failed to update player.',
          variant: 'destructive',
        })
        return
      }

      // Upsert ratings - convert 0 to null (DB constraint requires 1-5 or null)
      const ratingsToSave = Object.fromEntries(
        Object.entries(playerData.ratings).map(([key, value]) => [key, value === 0 ? null : value])
      )
      const { error: ratingsError } = await supabase
        .from('player_ratings')
        .upsert({
          player_id: editingPlayer.id,
          ...ratingsToSave,
          season: new Date().getFullYear().toString(),
        }, { onConflict: 'player_id,season' })

      if (ratingsError) {
        console.error('Ratings save error:', ratingsError)
        toast({
          title: 'Warning',
          description: 'Player saved but ratings failed to save.',
          variant: 'destructive',
        })
      }

      // Upsert eligibility
      const { error: eligibilityError } = await supabase
        .from('position_eligibility')
        .upsert({
          player_id: editingPlayer.id,
          ...playerData.eligibility,
        }, { onConflict: 'player_id' })

      if (eligibilityError) {
        console.error('Eligibility save error:', eligibilityError)
        toast({
          title: 'Warning',
          description: 'Player saved but eligibility failed to save.',
          variant: 'destructive',
        })
      }

      if (!ratingsError && !eligibilityError) {
        toast({
          title: 'Player updated',
          description: 'The player has been updated.',
        })
      }
    } else {
      // Create new player
      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert({
          name: playerData.name,
          jersey_number: playerData.jersey_number,
          active: playerData.active,
          team_id: teamId,
          position_strengths: playerData.position_strengths,
          notes: playerData.notes,
        })
        .select()
        .single()

      if (playerError || !newPlayer) {
        toast({
          title: 'Error',
          description: 'Failed to create player.',
          variant: 'destructive',
        })
        return
      }

      // Create ratings - convert 0 to null (DB constraint requires 1-5 or null)
      const newRatingsToSave = Object.fromEntries(
        Object.entries(playerData.ratings).map(([key, value]) => [key, value === 0 ? null : value])
      )
      const { error: ratingsError } = await supabase
        .from('player_ratings')
        .insert({
          player_id: newPlayer.id,
          ...newRatingsToSave,
          season: new Date().getFullYear().toString(),
        })

      if (ratingsError) {
        console.error('Ratings save error:', ratingsError)
      }

      // Create eligibility
      const { error: eligibilityError } = await supabase
        .from('position_eligibility')
        .insert({
          player_id: newPlayer.id,
          ...playerData.eligibility,
        })

      if (eligibilityError) {
        console.error('Eligibility save error:', eligibilityError)
      }

      toast({
        title: 'Player added',
        description: 'The player has been added to your roster.',
      })
    }

    setDialogOpen(false)
    router.refresh()
  }

  const getRatingsCount = (player: Player) => {
    // Find ratings for current season, or fall back to most recent
    const currentSeason = new Date().getFullYear().toString()
    const ratings = player.player_ratings?.find(r => r.season === currentSeason)
      || player.player_ratings?.[0]
    if (!ratings) return 0

    const ratingFields = [
      'plate_discipline', 'contact_ability', 'run_speed', 'batting_power',
      'fielding_hands', 'fielding_throw_accuracy', 'fielding_arm_strength',
      'baseball_iq', 'attention', 'fly_ball_ability',
      'pitch_control', 'pitch_velocity', 'pitch_composure', 'catcher_ability'
    ] as const

    return ratingFields.filter(field => (ratings[field] ?? 0) > 0).length
  }

  const getPositionDisplay = (player: Player) => {
    // Show position strengths if available, otherwise fall back to eligibility
    if (player.position_strengths && player.position_strengths.length > 0) {
      return player.position_strengths
    }

    const eligibility = player.position_eligibility
    if (!eligibility) return []

    const badges = []
    if (eligibility.can_pitch) badges.push('P')
    if (eligibility.can_catch) badges.push('C')
    if (eligibility.can_play_ss) badges.push('SS')
    if (eligibility.can_play_1b) badges.push('1B')
    return badges
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleAddPlayer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            {players.length === 0
              ? 'No players yet. Add your first player to get started!'
              : 'No players match your search.'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Positions</TableHead>
                <TableHead className="hidden lg:table-cell">Ratings</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => {
                const ratingsCount = getRatingsCount(player)
                return (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      {player.jersey_number ?? '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{player.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {getPositionDisplay(player).map((pos, index) => (
                          <Badge key={pos} variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                            {pos}
                          </Badge>
                        ))}
                        {getPositionDisplay(player).length === 0 && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={ratingsCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                        {ratingsCount}/14 rated
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={player.active ? 'default' : 'secondary'}>
                        {player.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPlayer(player)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlayer(player.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PlayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        player={editingPlayer}
        onSave={handleSavePlayer}
      />

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Import Roster from CSV</DialogTitle>
            <DialogDescription>
              Upload a GameChanger CSV file to import players. You can choose to import just the roster or include stats.
            </DialogDescription>
          </DialogHeader>
          <RosterImportInline
            teamId={teamId}
            onImportComplete={() => {
              setImportDialogOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
