import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RosterClient } from './_components/roster-client'

export default async function RosterPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get or create team for user
  let { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (!team) {
    // Auto-create a team for the user
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({
        name: 'My Team',
        created_by: user.id,
        innings_per_game: 6,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating team:', error)
      return <div>Error creating team. Please try again.</div>
    }

    team = newTeam
  }

  // Fetch players with their ratings and eligibility
  const { data: players } = await supabase
    .from('players')
    .select(`
      *,
      player_ratings (*),
      position_eligibility (*)
    `)
    .eq('team_id', team.id)
    .order('jersey_number', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
        <p className="text-muted-foreground">
          Manage your team&apos;s players, ratings, and position eligibility.
        </p>
      </div>

      <RosterClient
        initialPlayers={players || []}
        teamId={team.id}
      />
    </div>
  )
}
