import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GameDetailClient } from './_components/game-detail-client'

interface GameDetailPageProps {
  params: Promise<{ teamId: string; gameId: string }>
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { teamId, gameId } = await params
  const supabase = await createClient()

  // Note: Auth and team ownership are validated by the layout

  // Fetch the game
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .eq('team_id', teamId)
    .single()

  if (!game) {
    notFound()
  }

  // Fetch all players on the team
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
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
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })

  return (
    <GameDetailClient
      game={game}
      players={players || []}
      gameRoster={gameRoster || []}
      existingLineup={lineup}
      ruleGroups={ruleGroups || []}
      teamId={teamId}
    />
  )
}
