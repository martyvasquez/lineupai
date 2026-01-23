import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, FileText, Calendar, BarChart3 } from 'lucide-react'
import { TeamInsights } from './_components/team-insights'
import { GettingStarted } from './_components/getting-started'
import type { TeamAnalysis } from '@/types/lineup'

interface TeamDashboardPageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamDashboardPage({ params }: TeamDashboardPageProps) {
  const { teamId } = await params
  const supabase = await createClient()

  // Note: Auth and team ownership are validated by the layout

  // Fetch team info with analysis data
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  const today = new Date().toISOString().split('T')[0]

  // Fetch counts and stats data in parallel
  const [playersResult, rulesResult, gamesResult, playersWithStatsResult] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact', head: true }).eq('team_id', teamId),
    supabase.from('team_rules').select('id', { count: 'exact', head: true }).eq('team_id', teamId).eq('active', true),
    supabase.from('games').select('id', { count: 'exact', head: true }).eq('team_id', teamId).gte('game_date', today),
    // Get player IDs to check for stats
    supabase.from('players').select('id').eq('team_id', teamId).eq('active', true),
  ])

  const playerCount = playersResult.count ?? 0
  const ruleCount = rulesResult.count ?? 0
  const upcomingGameCount = gamesResult.count ?? 0

  // Check how many players have stats (using the season view which aggregates per player)
  let statsCount = 0
  let lastImportDate: string | null = team?.stats_imported_at || null
  const playerIds = playersWithStatsResult.data?.map(p => p.id) || []
  if (playerIds.length > 0) {
    const { data: playersWithStats } = await supabase
      .from('gamechanger_batting_season')
      .select('player_id')
      .in('player_id', playerIds)
    statsCount = playersWithStats?.length ?? 0

    // If no stats_imported_at on team, get it from the batting records
    if (!lastImportDate && statsCount > 0) {
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
  }

  const hasStats = statsCount > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{team?.name || 'Team Dashboard'}</h1>
        <p className="text-muted-foreground">
          {team?.age_group && `${team.age_group} • `}
          {team?.league_name || 'Manage your team'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/dashboard/${teamId}/roster`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roster</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount}</div>
              <p className="text-xs text-muted-foreground">
                {playerCount === 1 ? 'Player' : 'Players'} on your team
              </p>
              <span className="text-sm text-primary hover:underline">
                Manage roster →
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/${teamId}/rules`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rules</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ruleCount}</div>
              <p className="text-xs text-muted-foreground">
                Active team {ruleCount === 1 ? 'rule' : 'rules'}
              </p>
              <span className="text-sm text-primary hover:underline">
                Manage rules →
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/${teamId}/games`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingGameCount}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming {upcomingGameCount === 1 ? 'game' : 'games'}
              </p>
              <span className="text-sm text-primary hover:underline">
                View games →
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/${teamId}/stats`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stats</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsCount > 0 ? statsCount : 'CSV'}</div>
              <p className="text-xs text-muted-foreground">
                {statsCount > 0 ? `${statsCount} players with stats` : 'GameChanger import'}
              </p>
              <span className="text-sm text-primary hover:underline">
                View stats →
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Team Insights Section */}
      <TeamInsights
        teamId={teamId}
        hasStats={hasStats}
        statsCount={statsCount}
        playerCount={playerCount}
        statsImportedAt={lastImportDate}
        teamAnalysis={team?.team_analysis as TeamAnalysis | null}
        teamAnalyzedAt={team?.team_analyzed_at || null}
      />

      <GettingStarted />
    </div>
  )
}
