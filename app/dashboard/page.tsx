import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, age_group, league_name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: true })

  const teamList = teams || []

  // If user has exactly 1 team, redirect to that team's dashboard
  if (teamList.length === 1) {
    redirect(`/dashboard/${teamList[0].id}`)
  }

  // If user has 0 teams, show create team UI
  if (teamList.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Peanut Manager</h1>
          <p className="text-muted-foreground">
            Get started by creating your first team.
          </p>
        </div>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Your First Team
            </CardTitle>
            <CardDescription>
              Set up your team to start managing rosters and generating AI-powered lineups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/settings/teams">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has 2+ teams, show team selection grid
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Teams</h1>
          <p className="text-muted-foreground">
            Select a team to manage or create a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings/teams">
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamList.map((team) => (
          <Link key={team.id} href={`/dashboard/${team.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </CardTitle>
                {(team.age_group || team.league_name) && (
                  <CardDescription>
                    {[team.age_group, team.league_name].filter(Boolean).join(' • ')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary hover:underline">
                  Open team →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
