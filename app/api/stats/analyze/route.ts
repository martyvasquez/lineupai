import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { claudeClient } from '@/lib/ai/claude-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team_id, player_ids, include_team_analysis = true } = body as {
      team_id: string
      player_ids?: string[] // Optional: if not provided, analyze all players
      include_team_analysis?: boolean // Whether to also generate team-level analysis
    }

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
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', team_id)
      .eq('created_by', user.id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 404 }
      )
    }

    // Build query for players
    let playersQuery = supabase
      .from('players')
      .select('*')
      .eq('team_id', team_id)
      .eq('active', true)

    if (player_ids && player_ids.length > 0) {
      playersQuery = playersQuery.in('id', player_ids)
    }

    const { data: players } = await playersQuery

    if (!players || players.length === 0) {
      return NextResponse.json(
        { error: 'No players found' },
        { status: 400 }
      )
    }

    const playerIds = players.map(p => p.id)

    // Fetch player ratings
    const { data: ratings } = await supabase
      .from('player_ratings')
      .select('*')
      .in('player_id', playerIds)

    // Fetch batting stats
    const { data: battingStats } = await supabase
      .from('gamechanger_batting_season')
      .select('*')
      .in('player_id', playerIds)

    // Fetch fielding stats
    const { data: fieldingStats } = await supabase
      .from('gamechanger_fielding_season')
      .select('*')
      .in('player_id', playerIds)

    // Create lookup maps
    const ratingsMap = new Map(ratings?.map(r => [r.player_id, r]) ?? [])
    const battingMap = new Map(battingStats?.map(s => [s.player_id, s]) ?? [])
    const fieldingMap = new Map(fieldingStats?.map(s => [s.player_id, s]) ?? [])

    // Check if any player has stats
    const playersWithStats = players.filter(p =>
      battingMap.has(p.id) || fieldingMap.has(p.id)
    )

    if (playersWithStats.length === 0) {
      return NextResponse.json(
        { error: 'No players have imported stats. Please upload GameChanger stats first.' },
        { status: 400 }
      )
    }

    // Build prompt for analysis
    const playersData = playersWithStats.map(player => {
      const playerRatings = ratingsMap.get(player.id)
      const batting = battingMap.get(player.id)
      const fielding = fieldingMap.get(player.id)

      return {
        id: player.id,
        name: player.name,
        jersey_number: player.jersey_number,
        position_strengths: player.position_strengths || [],
        ratings: playerRatings ? {
          plate_discipline: playerRatings.plate_discipline,
          contact_ability: playerRatings.contact_ability,
          run_speed: playerRatings.run_speed,
          batting_power: playerRatings.batting_power,
          fielding_hands: playerRatings.fielding_hands,
          fielding_throw_accuracy: playerRatings.fielding_throw_accuracy,
          fielding_arm_strength: playerRatings.fielding_arm_strength,
          fly_ball_ability: playerRatings.fly_ball_ability,
          baseball_iq: playerRatings.baseball_iq,
          attention: playerRatings.attention,
          pitch_control: playerRatings.pitch_control,
          pitch_velocity: playerRatings.pitch_velocity,
          pitch_composure: playerRatings.pitch_composure,
          catcher_ability: playerRatings.catcher_ability,
        } : null,
        batting_stats: batting ? {
          games_played: batting.gp,
          plate_appearances: batting.pa,
          at_bats: batting.ab,
          avg: batting.avg,
          obp: batting.obp,
          slg: batting.slg,
          ops: batting.ops,
          hits: batting.h,
          singles: batting.singles,
          doubles: batting.doubles,
          triples: batting.triples,
          home_runs: batting.hr,
          rbi: batting.rbi,
          runs: batting.r,
          walks: batting.bb,
          strikeouts: batting.so,
          hbp: batting.hbp,
          stolen_bases: batting.sb,
          caught_stealing: batting.cs,
        } : null,
        fielding_stats: fielding ? {
          total_chances: fielding.tc,
          assists: fielding.a,
          putouts: fielding.po,
          fielding_percentage: fielding.fpct,
          errors: fielding.e,
          double_plays: fielding.dp,
        } : null,
      }
    })

    const prompt = `Analyze the following youth baseball players based on their statistics and coach ratings.

PLAYERS TO ANALYZE:
${JSON.stringify(playersData, null, 2)}

For each player, provide:
1. 2-4 strengths with supporting statistics
2. 1-3 areas for improvement with supporting statistics
3. A brief summary (1-2 sentences)
4. Recommended batting position in lineup (e.g., "leadoff", "3-hole", "bottom third")
5. Recommended defensive positions (array of positions like ["SS", "2B"])

Return your analysis in this exact JSON format:
{
  "analyses": [
    {
      "player_id": "the player's id",
      "analysis": {
        "strengths": [
          {
            "category": "Contact",
            "description": "Excellent contact hitter who rarely strikes out",
            "supporting_stats": ".342 AVG, only 8 SO in 45 PA"
          }
        ],
        "weaknesses": [
          {
            "category": "Power",
            "description": "Limited extra-base hit production",
            "supporting_stats": "0 HR, .380 SLG, only 3 doubles"
          }
        ],
        "summary": "A reliable contact hitter who gets on base consistently. Focus on driving the ball with more authority.",
        "recommended_batting_position": "1 or 2 (leadoff type)",
        "recommended_defensive_positions": ["2B", "CF"]
      }
    }
  ]
}`

    const response = await claudeClient.generateStatsAnalysis(prompt)

    // Save player analyses to database
    const now = new Date().toISOString()
    for (const result of response.analyses) {
      await supabase
        .from('players')
        .update({
          stats_analysis: result.analysis,
          stats_analyzed_at: now,
        })
        .eq('id', result.player_id)
    }

    // Generate team-level analysis if requested
    let teamAnalysis = null
    if (include_team_analysis && playersWithStats.length >= 3) {
      // Calculate team aggregate stats
      const teamBattingStats = {
        total_pa: battingStats?.reduce((sum, s) => sum + (s.pa || 0), 0) || 0,
        total_ab: battingStats?.reduce((sum, s) => sum + (s.ab || 0), 0) || 0,
        total_h: battingStats?.reduce((sum, s) => sum + (s.h || 0), 0) || 0,
        total_bb: battingStats?.reduce((sum, s) => sum + (s.bb || 0), 0) || 0,
        total_so: battingStats?.reduce((sum, s) => sum + (s.so || 0), 0) || 0,
        total_sb: battingStats?.reduce((sum, s) => sum + (s.sb || 0), 0) || 0,
        avg_avg: battingStats && battingStats.length > 0
          ? battingStats.reduce((sum, s) => sum + (s.avg || 0), 0) / battingStats.length
          : 0,
        avg_obp: battingStats && battingStats.length > 0
          ? battingStats.reduce((sum, s) => sum + (s.obp || 0), 0) / battingStats.length
          : 0,
        avg_slg: battingStats && battingStats.length > 0
          ? battingStats.reduce((sum, s) => sum + (s.slg || 0), 0) / battingStats.length
          : 0,
      }

      const teamFieldingStats = {
        total_tc: fieldingStats?.reduce((sum, s) => sum + (s.tc || 0), 0) || 0,
        total_e: fieldingStats?.reduce((sum, s) => sum + (s.e || 0), 0) || 0,
        total_po: fieldingStats?.reduce((sum, s) => sum + (s.po || 0), 0) || 0,
        total_a: fieldingStats?.reduce((sum, s) => sum + (s.a || 0), 0) || 0,
        avg_fpct: fieldingStats && fieldingStats.length > 0
          ? fieldingStats.reduce((sum, s) => sum + (s.fpct || 0), 0) / fieldingStats.length
          : 0,
      }

      // Collect individual player summaries
      const playerSummaries = response.analyses.map(r => ({
        name: playersWithStats.find(p => p.id === r.player_id)?.name || 'Unknown',
        summary: r.analysis.summary,
        strengths: r.analysis.strengths.map(s => s.category),
        weaknesses: r.analysis.weaknesses.map(w => w.category),
      }))

      const teamPrompt = `Analyze the following youth baseball team based on aggregate statistics and individual player analyses.

TEAM AGGREGATE BATTING STATS:
- Total Plate Appearances: ${teamBattingStats.total_pa}
- Total At Bats: ${teamBattingStats.total_ab}
- Total Hits: ${teamBattingStats.total_h}
- Total Walks: ${teamBattingStats.total_bb}
- Total Strikeouts: ${teamBattingStats.total_so}
- Total Stolen Bases: ${teamBattingStats.total_sb}
- Team Average AVG: ${teamBattingStats.avg_avg.toFixed(3)}
- Team Average OBP: ${teamBattingStats.avg_obp.toFixed(3)}
- Team Average SLG: ${teamBattingStats.avg_slg.toFixed(3)}
- Team K Rate: ${teamBattingStats.total_ab > 0 ? ((teamBattingStats.total_so / teamBattingStats.total_ab) * 100).toFixed(1) : 0}%
- Team BB Rate: ${teamBattingStats.total_pa > 0 ? ((teamBattingStats.total_bb / teamBattingStats.total_pa) * 100).toFixed(1) : 0}%

TEAM AGGREGATE FIELDING STATS:
- Total Chances: ${teamFieldingStats.total_tc}
- Total Errors: ${teamFieldingStats.total_e}
- Total Putouts: ${teamFieldingStats.total_po}
- Total Assists: ${teamFieldingStats.total_a}
- Team Average FPCT: ${teamFieldingStats.avg_fpct.toFixed(3)}

INDIVIDUAL PLAYER SUMMARIES:
${JSON.stringify(playerSummaries, null, 2)}

Provide team-level analysis in this exact JSON format:
{
  "team_strengths": [
    {
      "category": "Plate Discipline",
      "description": "Team draws walks at an above-average rate",
      "supporting_stats": "12% BB rate, well above youth average"
    }
  ],
  "team_weaknesses": [
    {
      "category": "Strikeouts",
      "description": "High strikeout rate indicates contact issues",
      "supporting_stats": "25% K rate across the roster"
    }
  ],
  "practice_recommendations": [
    {
      "focus_area": "Contact hitting",
      "drill_suggestions": "Soft toss, tee work focusing on bat-to-ball contact, two-strike approach drills",
      "priority": "high"
    }
  ],
  "lineup_insights": {
    "best_leadoff_candidates": ["Player A", "Player B"],
    "best_power_spots": ["Player C", "Player D"],
    "defensive_strengths": ["Middle infield depth", "Catching"],
    "defensive_concerns": ["Outfield arm strength", "Corner infield consistency"]
  },
  "summary": "A brief 2-3 sentence summary of the team's overall profile and top priorities."
}`

      try {
        teamAnalysis = await claudeClient.generateTeamAnalysis(teamPrompt)

        // Save team analysis to database
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            team_analysis: teamAnalysis,
            team_analyzed_at: now,
          })
          .eq('id', team_id)

        // Update error is non-critical, analysis still succeeded
      } catch (teamError) {
        // Return error info for debugging
        return NextResponse.json({
          success: true,
          analyzed_count: response.analyses.length,
          analyses: response.analyses,
          team_analysis: null,
          team_analysis_error: teamError instanceof Error ? teamError.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      analyzed_count: response.analyses.length,
      analyses: response.analyses,
      team_analysis: teamAnalysis,
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stats analysis error:', error)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
