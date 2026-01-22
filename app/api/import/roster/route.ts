import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ParsedPlayerStats, ParsedBattingStats, ParsedFieldingStats } from '@/lib/parsers/gamechanger-csv'

interface ImportRosterRequest {
  team_id: string
  players: ParsedPlayerStats[]
  include_stats?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { team_id, players, include_stats = false } = await request.json() as ImportRosterRequest

    if (!team_id || !players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { error: 'team_id and players array are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', team_id)
      .eq('created_by', user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or access denied' },
        { status: 403 }
      )
    }

    // Create players
    const playerRecords = players.map(p => ({
      team_id,
      name: `${p.first_name} ${p.last_name}`.trim(),
      jersey_number: p.jersey_number,
    }))

    const { data: createdPlayers, error: playerError } = await supabase
      .from('players')
      .insert(playerRecords)
      .select('id, name, jersey_number')

    if (playerError) {
      console.error('Failed to create players:', playerError)
      return NextResponse.json(
        { error: 'Failed to create players' },
        { status: 500 }
      )
    }

    const createdCount = createdPlayers?.length ?? 0

    // If include_stats is true, also import the stats
    if (include_stats && createdPlayers && createdPlayers.length > 0) {
      // Create a map from jersey number to player ID
      const jerseyToPlayerId = new Map<number, string>()
      createdPlayers.forEach(p => {
        if (p.jersey_number !== null) {
          jerseyToPlayerId.set(p.jersey_number, p.id)
        }
      })

      // Use a single "season summary" date for these stats
      const seasonDate = `${new Date().getFullYear()}-01-01`

      // Prepare batting records
      const battingRecords = players
        .filter(p => jerseyToPlayerId.has(p.jersey_number))
        .map(p => ({
          player_id: jerseyToPlayerId.get(p.jersey_number)!,
          game_date: seasonDate,
          pa: p.batting.pa,
          ab: p.batting.ab,
          h: p.batting.h,
          singles: p.batting.singles,
          doubles: p.batting.doubles,
          triples: p.batting.triples,
          hr: p.batting.hr,
          rbi: p.batting.rbi,
          r: p.batting.r,
          bb: p.batting.bb,
          so: p.batting.so,
          hbp: p.batting.hbp,
          sb: p.batting.sb,
          cs: p.batting.cs,
          imported_at: new Date().toISOString(),
        }))

      if (battingRecords.length > 0) {
        const { error: battingError } = await supabase
          .from('gamechanger_batting')
          .insert(battingRecords)

        if (battingError) {
          console.error('Failed to insert batting stats:', battingError)
        }
      }

      // Prepare fielding records
      const fieldingRecords = players
        .filter(p => jerseyToPlayerId.has(p.jersey_number))
        .map(p => ({
          player_id: jerseyToPlayerId.get(p.jersey_number)!,
          game_date: seasonDate,
          tc: p.fielding.tc,
          a: p.fielding.a,
          po: p.fielding.po,
          e: p.fielding.e,
          dp: p.fielding.dp,
          imported_at: new Date().toISOString(),
        }))

      if (fieldingRecords.length > 0) {
        const { error: fieldingError } = await supabase
          .from('gamechanger_fielding')
          .insert(fieldingRecords)

        if (fieldingError) {
          console.error('Failed to insert fielding stats:', fieldingError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      created_count: createdCount,
      players: createdPlayers,
      stats_imported: include_stats,
    })

  } catch (error) {
    console.error('Roster import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import roster' },
      { status: 500 }
    )
  }
}
