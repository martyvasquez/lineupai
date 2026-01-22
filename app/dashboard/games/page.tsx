import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GamesClient } from './_components/games-client'

export default async function GamesPage() {
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

  // Fetch games ordered by date
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('team_id', team.id)
    .order('game_date', { ascending: true })

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
        teamId={team.id}
      />
    </div>
  )
}
