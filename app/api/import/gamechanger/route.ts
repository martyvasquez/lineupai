import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ParsedBattingStats, ParsedFieldingStats } from '@/lib/parsers/gamechanger-csv'

interface ImportedStats {
  player_id: string
  batting: ParsedBattingStats
  fielding: ParsedFieldingStats
}

export async function POST(request: NextRequest) {
  try {
    const { team_id, stats } = await request.json() as {
      team_id: string
      stats: ImportedStats[]
    }

    if (!team_id || !stats || !Array.isArray(stats)) {
      return NextResponse.json(
        { error: 'team_id and stats array are required' },
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

    // Verify all player_ids belong to this team
    const playerIds = stats.map(s => s.player_id)
    const { data: players } = await supabase
      .from('players')
      .select('id')
      .in('id', playerIds)
      .eq('team_id', team_id)

    const validPlayerIds = new Set(players?.map(p => p.id) ?? [])
    const validStats = stats.filter(s => validPlayerIds.has(s.player_id))

    if (validStats.length === 0) {
      return NextResponse.json(
        { error: 'No valid players found to import stats for' },
        { status: 400 }
      )
    }

    // Use a single "season summary" date for these stats
    // This allows re-importing to upsert rather than create duplicates
    const seasonDate = `${new Date().getFullYear()}-01-01`

    // Delete existing stats for these players (to allow re-import/update)
    await supabase
      .from('gamechanger_batting')
      .delete()
      .in('player_id', validStats.map(s => s.player_id))
      .eq('game_date', seasonDate)

    await supabase
      .from('gamechanger_fielding')
      .delete()
      .in('player_id', validStats.map(s => s.player_id))
      .eq('game_date', seasonDate)

    // Insert batting stats
    const battingRecords = validStats.map(s => ({
      player_id: s.player_id,
      game_date: seasonDate,
      pa: s.batting.pa,
      ab: s.batting.ab,
      h: s.batting.h,
      singles: s.batting.singles,
      doubles: s.batting.doubles,
      triples: s.batting.triples,
      hr: s.batting.hr,
      rbi: s.batting.rbi,
      r: s.batting.r,
      bb: s.batting.bb,
      so: s.batting.so,
      hbp: s.batting.hbp,
      sb: s.batting.sb,
      cs: s.batting.cs,
      imported_at: new Date().toISOString(),
    }))

    const { error: battingError } = await supabase
      .from('gamechanger_batting')
      .insert(battingRecords)

    if (battingError) {
      console.error('Failed to insert batting stats:', battingError)
      return NextResponse.json(
        { error: 'Failed to save batting statistics' },
        { status: 500 }
      )
    }

    // Insert fielding stats
    const fieldingRecords = validStats.map(s => ({
      player_id: s.player_id,
      game_date: seasonDate,
      tc: s.fielding.tc,
      a: s.fielding.a,
      po: s.fielding.po,
      e: s.fielding.e,
      dp: s.fielding.dp,
      imported_at: new Date().toISOString(),
    }))

    const { error: fieldingError } = await supabase
      .from('gamechanger_fielding')
      .insert(fieldingRecords)

    if (fieldingError) {
      console.error('Failed to insert fielding stats:', fieldingError)
      // Don't fail completely - batting stats were saved
    }

    // Update team's stats_imported_at timestamp
    await supabase
      .from('teams')
      .update({ stats_imported_at: new Date().toISOString() })
      .eq('id', team_id)

    return NextResponse.json({
      success: true,
      imported_count: validStats.length,
      skipped_count: stats.length - validStats.length,
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import stats' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { team_id } = await request.json()

    if (!team_id) {
      return NextResponse.json(
        { error: 'team_id is required' },
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

    // Get all player IDs for this team
    const { data: players } = await supabase
      .from('players')
      .select('id')
      .eq('team_id', team_id)

    if (!players || players.length === 0) {
      return NextResponse.json({
        success: true,
        deleted_count: 0,
      })
    }

    const playerIds = players.map(p => p.id)

    // Delete batting stats
    const { error: battingError } = await supabase
      .from('gamechanger_batting')
      .delete()
      .in('player_id', playerIds)

    if (battingError) {
      console.error('Failed to delete batting stats:', battingError)
    }

    // Delete fielding stats
    const { error: fieldingError } = await supabase
      .from('gamechanger_fielding')
      .delete()
      .in('player_id', playerIds)

    if (fieldingError) {
      console.error('Failed to delete fielding stats:', fieldingError)
    }

    // Clear player analyses
    await supabase
      .from('players')
      .update({ stats_analysis: null, stats_analyzed_at: null })
      .in('id', playerIds)

    // Clear team analysis and stats_imported_at
    await supabase
      .from('teams')
      .update({
        team_analysis: null,
        team_analyzed_at: null,
        stats_imported_at: null,
      })
      .eq('id', team_id)

    return NextResponse.json({
      success: true,
      deleted_count: playerIds.length,
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear stats' },
      { status: 500 }
    )
  }
}
