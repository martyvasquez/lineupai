'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/hooks/use-toast'
import { Plus, AlertTriangle, Users, BarChart3 } from 'lucide-react'
import { GameCard } from './game-card'
import { GameDialog } from './game-dialog'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']

interface GamesClientProps {
  initialGames: Game[]
  teamId: string
  canCreateGames: boolean
  hasGameChangerData: boolean
  playersRatedCount: number
  totalPlayers: number
}

export function GamesClient({
  initialGames,
  teamId,
  canCreateGames,
  hasGameChangerData,
  playersRatedCount,
  totalPlayers,
}: GamesClientProps) {
  const [games, setGames] = useState<Game[]>(initialGames)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  const upcomingGames = games.filter(g =>
    g.game_date >= today && g.status !== 'completed'
  )
  const pastGames = games.filter(g =>
    g.game_date < today || g.status === 'completed'
  )

  const handleAddGame = () => {
    setEditingGame(null)
    setDialogOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setDialogOpen(true)
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete game.',
        variant: 'destructive',
      })
      return
    }

    setGames(games.filter(g => g.id !== gameId))
    toast({
      title: 'Game deleted',
      description: 'The game has been removed.',
    })
  }

  const handleSaveGame = async (gameData: {
    opponent: string
    game_date: string
    game_time: string | null
    location: string | null
    innings: number
    scouting_report: string | null
  }) => {
    if (editingGame) {
      // Update existing game
      const { error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', editingGame.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update game.',
          variant: 'destructive',
        })
        return
      }

      setGames(games.map(g => g.id === editingGame.id ? { ...g, ...gameData } : g))
      toast({
        title: 'Game updated',
        description: 'The game has been updated.',
      })
    } else {
      // Create new game
      const { data: newGame, error } = await supabase
        .from('games')
        .insert({
          team_id: teamId,
          ...gameData,
          status: 'scheduled',
        })
        .select()
        .single()

      if (error || !newGame) {
        toast({
          title: 'Error',
          description: 'Failed to create game.',
          variant: 'destructive',
        })
        return
      }

      setGames([...games, newGame].sort((a, b) =>
        a.game_date.localeCompare(b.game_date)
      ))
      toast({
        title: 'Game created',
        description: 'The game has been added to your schedule.',
      })
    }

    setDialogOpen(false)
  }

  const handleViewGame = (gameId: string) => {
    router.push(`/dashboard/${teamId}/games/${gameId}`)
  }

  // Show warning if no lineup data exists
  if (!canCreateGames) {
    return (
      <Card className="border-amber-300 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Setup Required</CardTitle>
          </div>
          <CardDescription>
            Before creating games, you need player data for lineup generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To generate AI-powered lineups, you need either:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 ml-4">
            <li>1. Rate all players on your roster (at least one rating per player)</li>
            <li>2. Import GameChanger statistics for your team</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/dashboard/${teamId}/roster`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Add Player Ratings
              {totalPlayers > 0 && (
                <span className="text-xs opacity-80">({playersRatedCount}/{totalPlayers} rated)</span>
              )}
            </Link>
            <Link
              href={`/dashboard/${teamId}/stats`}
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Import GameChanger Stats
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {games.length} game{games.length !== 1 ? 's' : ''} scheduled
        </p>
        <Button onClick={handleAddGame}>
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingGames.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastGames.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingGames.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                No upcoming games. Add a game to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onEdit={() => handleEditGame(game)}
                  onDelete={() => handleDeleteGame(game.id)}
                  onView={() => handleViewGame(game.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastGames.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                No past games yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onEdit={() => handleEditGame(game)}
                  onDelete={() => handleDeleteGame(game.id)}
                  onView={() => handleViewGame(game.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        game={editingGame}
        onSave={handleSaveGame}
      />
    </div>
  )
}
