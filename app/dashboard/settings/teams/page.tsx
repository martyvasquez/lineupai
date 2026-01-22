import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '../_components/settings-client'

export default async function TeamsSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch teams with player and game counts
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: true })

  // Get counts for each team
  const teamsWithCounts = await Promise.all(
    (teams || []).map(async (team) => {
      const [playersResult, gamesResult] = await Promise.all([
        supabase
          .from('players')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', team.id),
        supabase
          .from('games')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', team.id),
      ])

      return {
        ...team,
        player_count: playersResult.count ?? 0,
        game_count: gamesResult.count ?? 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground">
          Create and manage your teams.
        </p>
      </div>

      <SettingsClient
        initialTeams={teamsWithCounts}
        userId={user.id}
      />
    </div>
  )
}
