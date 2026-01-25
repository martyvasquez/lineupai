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

  // Check if GameChanger data exists for any of the team's players
  const playerIds = (players || []).map(p => p.id)
  let hasGameChangerData = false
  let hasCoachRatings = false

  if (playerIds.length > 0) {
    const { count: gcCount } = await supabase
      .from('gamechanger_batting_season')
      .select('*', { count: 'exact', head: true })
      .in('player_id', playerIds)

    hasGameChangerData = (gcCount ?? 0) > 0

    const { count: ratingsCount } = await supabase
      .from('player_ratings')
      .select('*', { count: 'exact', head: true })
      .in('player_id', playerIds)

    hasCoachRatings = (ratingsCount ?? 0) > 0
  }

  return (
    <GameDetailClient
      game={game}
      players={players || []}
      gameRoster={gameRoster || []}
      existingLineup={lineup}
      ruleGroups={ruleGroups || []}
      teamId={teamId}
      hasGameChangerData={hasGameChangerData}
      hasCoachRatings={hasCoachRatings}
    />
  )
}
