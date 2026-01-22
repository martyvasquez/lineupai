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
      />
    </div>
  )
}
