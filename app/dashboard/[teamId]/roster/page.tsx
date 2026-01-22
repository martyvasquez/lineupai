import { createClient } from '@/lib/supabase/server'
import { RosterClient } from './_components/roster-client'

interface RosterPageProps {
  params: Promise<{ teamId: string }>
}

export default async function RosterPage({ params }: RosterPageProps) {
  const { teamId } = await params
  const supabase = await createClient()

  // Note: Auth and team ownership are validated by the layout

  // Fetch players with their ratings and eligibility
  const { data: players } = await supabase
    .from('players')
    .select(`
      *,
      player_ratings (*),
      position_eligibility (*)
    `)
    .eq('team_id', teamId)
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
        teamId={teamId}
      />
    </div>
  )
}
