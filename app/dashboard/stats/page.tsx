import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsClient } from './_components/stats-client'

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get team for user
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (!team) {
    redirect('/dashboard/roster')
  }

  // Fetch players with their stats analysis
  const { data: players } = await supabase
    .from('players')
    .select('id, name, jersey_number, stats_analysis, stats_analyzed_at')
    .eq('team_id', team.id)
    .eq('active', true)
    .order('jersey_number', { ascending: true })

  const playerIds = players?.map(p => p.id) || []

  // Fetch batting stats for all players
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let battingStats: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fieldingStats: any[] = []
  let lastImportDate: string | null = null

  if (playerIds.length > 0) {
    const { data: batting } = await supabase
      .from('gamechanger_batting_season')
      .select('*')
      .in('player_id', playerIds)

    battingStats = batting || []

    const { data: fielding } = await supabase
      .from('gamechanger_fielding_season')
      .select('*')
      .in('player_id', playerIds)

    fieldingStats = fielding || []

    // Get last import date
    const { data: recentImport } = await supabase
      .from('gamechanger_batting')
      .select('imported_at')
      .in('player_id', playerIds)
      .order('imported_at', { ascending: false })
      .limit(1)

    if (recentImport && recentImport.length > 0) {
      lastImportDate = recentImport[0].imported_at
    }
  }

  // Create lookup maps
  const battingMap = new Map<string, typeof battingStats[0]>(battingStats.map(s => [s.player_id, s]))
  const fieldingMap = new Map<string, typeof fieldingStats[0]>(fieldingStats.map(s => [s.player_id, s]))

  // Combine player data with stats
  const playersWithStats = (players || []).map(player => ({
    ...player,
    batting: battingMap.get(player.id) || null,
    fielding: fieldingMap.get(player.id) || null,
    has_stats: battingMap.has(player.id) || fieldingMap.has(player.id),
  }))

  const statsCount = playersWithStats.filter(p => p.has_stats).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Stats</h1>
        <p className="text-muted-foreground">
          View player statistics and AI-powered analysis.
        </p>
      </div>

      <StatsClient
        teamId={team.id}
        players={playersWithStats}
        statsCount={statsCount}
        lastImportDate={lastImportDate}
      />
    </div>
  )
}
