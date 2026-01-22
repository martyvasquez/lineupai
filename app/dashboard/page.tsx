import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, FileText, Calendar, Upload } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's team
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('created_by', user?.id ?? '')
    .single()

  const teamId = team?.id

  // Fetch counts in parallel
  const today = new Date().toISOString().split('T')[0]

  const [playersResult, rulesResult, gamesResult] = await Promise.all([
    // Count players
    teamId
      ? supabase.from('players').select('id', { count: 'exact', head: true }).eq('team_id', teamId)
      : Promise.resolve({ count: 0 }),
    // Count active rules (across all rule groups)
    teamId
      ? supabase.from('team_rules').select('id', { count: 'exact', head: true }).eq('team_id', teamId).eq('active', true)
      : Promise.resolve({ count: 0 }),
    // Count upcoming games
    teamId
      ? supabase.from('games').select('id', { count: 'exact', head: true }).eq('team_id', teamId).gte('game_date', today)
      : Promise.resolve({ count: 0 }),
  ])

  const playerCount = playersResult.count ?? 0
  const ruleCount = rulesResult.count ?? 0
  const upcomingGameCount = gamesResult.count ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/roster">
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

        <Link href="/dashboard/rules">
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

        <Link href="/dashboard/games">
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

        <Link href="/dashboard/import">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Import Stats</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CSV</div>
              <p className="text-xs text-muted-foreground">
                GameChanger data
              </p>
              <span className="text-sm text-primary hover:underline">
                Import now →
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Set up your team to start generating lineups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium">Create your team and add players</h3>
              <p className="text-sm text-muted-foreground">
                Go to Settings to create your team, then add players to your roster.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium">Set player ratings and eligibility</h3>
              <p className="text-sm text-muted-foreground">
                Rate each player's abilities and mark position eligibility for key positions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium">Define team rules</h3>
              <p className="text-sm text-muted-foreground">
                Add your league and team rules in plain language for AI to follow.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <h3 className="font-medium">Create a game and generate lineup</h3>
              <p className="text-sm text-muted-foreground">
                Create an upcoming game, mark players as available, and let AI generate your lineup!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
