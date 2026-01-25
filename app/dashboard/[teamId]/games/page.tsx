import { createClient } from '@/lib/supabase/server'
import { GamesClient } from './_components/games-client'

interface GamesPageProps {
  params: Promise<{ teamId: string }>
}

export default async function GamesPage({ params }: GamesPageProps) {
  const { teamId } = await params
  const supabase = await createClient()

  // Note: Auth and team ownership are validated by the layout

  // Fetch games ordered by date
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('team_id', teamId)
    .order('game_date', { ascending: true })

  // Fetch players with their ratings
  const { data: players } = await supabase
    .from('players')
    .select(`
      id,
      player_ratings (
        plate_discipline, contact_ability, run_speed, batting_power,
        fielding_hands, fielding_throw_accuracy, fielding_arm_strength, fly_ball_ability,
        baseball_iq, attention,
        pitch_control, pitch_velocity, pitch_composure,
        catcher_ability
      )
    `)
    .eq('team_id', teamId)
    .eq('active', true)

  const playerIds = (players || []).map(p => p.id)

  // Check for GameChanger stats
  let hasGameChangerData = false
  if (playerIds.length > 0) {
    const { count } = await supabase
      .from('gamechanger_batting_season')
      .select('*', { count: 'exact', head: true })
      .in('player_id', playerIds)
    hasGameChangerData = (count ?? 0) > 0
  }

  // Check if each player has at least 1 rating
  const playersWithRatings = (players || []).filter(player => {
    const ratings = player.player_ratings?.[0]
    if (!ratings) return false
    return Object.values(ratings).some(val => typeof val === 'number' && val > 0)
  })

  const totalPlayers = players?.length ?? 0
  const playersRatedCount = playersWithRatings.length
  const allPlayersHaveRatings = totalPlayers > 0 && playersRatedCount === totalPlayers

  // Allow games if GameChanger OR all players rated
  const canCreateGames = hasGameChangerData || allPlayersHaveRatings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Games</h1>
        <p className="text-muted-foreground">
          Manage your team&apos;s games and generate lineups.
        </p>
      </div>

      <GamesClient
        initialGames={games || []}
        teamId={teamId}
        canCreateGames={canCreateGames}
        hasGameChangerData={hasGameChangerData}
        playersRatedCount={playersRatedCount}
        totalPlayers={totalPlayers}
      />
    </div>
  )
}
