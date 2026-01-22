import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GameDetailClient } from './_components/game-detail-client'

interface GameDetailPageProps {
  params: Promise<{ gameId: string }>
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's team
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (!team) {
    redirect('/dashboard')
  }

  // Fetch the game
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .eq('team_id', team.id)
    .single()

  if (!game) {
    notFound()
  }

  // Fetch all players on the team
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', team.id)
    .order('jersey_number', { ascending: true })

  // Fetch game roster (availability settings)
  const { data: gameRoster } = await supabase
    .from('game_roster')
    .select('*')
    .eq('game_id', gameId)

  // Fetch existing lineup if any
  const { data: lineup } = await supabase
    .from('lineups')
    .select('*')
    .eq('game_id', gameId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  // Fetch rule groups for the team
  const { data: ruleGroups } = await supabase
    .from('rule_groups')
    .select('*')
    .eq('team_id', team.id)
    .order('created_at', { ascending: true })

  return (
    <GameDetailClient
      game={game}
      players={players || []}
      gameRoster={gameRoster || []}
      existingLineup={lineup}
      ruleGroups={ruleGroups || []}
    />
  )
}
