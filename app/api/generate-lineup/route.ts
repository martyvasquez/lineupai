import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { claudeClient } from '@/lib/ai/claude-client'
import {
  buildBattingOrderPrompt,
  buildDefensivePrompt,
  transformPlayerData,
  type TeamContext,
} from '@/lib/ai/prompt-builder'
import type {
  TeamRule,
  GamePreference,
  BattingOrderEntry,
  LockedPosition,
  GenerationPhase,
} from '@/types/lineup'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      game_id,
      rule_group_id,
      additional_notes,
      phase = 'batting_order', // Default to batting_order for backwards compatibility
      batting_order,
      locked_positions,
      start_from_inning,
    } = body as {
      game_id: string
      rule_group_id: string | null
      additional_notes: string | null
      phase?: GenerationPhase
      batting_order?: BattingOrderEntry[]
      locked_positions?: LockedPosition[]
      start_from_inning?: number
    }

    if (!game_id) {
      return NextResponse.json(
        { error: 'game_id is required' },
        { status: 400 }
      )
    }

    // Validate phase-specific requirements
    if (phase === 'defensive' && !batting_order) {
      return NextResponse.json(
        { error: 'batting_order is required for defensive phase' },
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

    // Fetch the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*, teams(*)')
      .eq('id', game_id)
      .single()

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Verify user owns this team
    if (game.teams?.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Extract team context for AI prompts
    const teamContext: TeamContext | null = game.teams ? {
      name: game.teams.name,
      age_group: game.teams.age_group,
    } : null

    // Fetch the rule group if provided
    let ruleGroupName: string | null = null
    if (rule_group_id) {
      const { data: ruleGroup } = await supabase
        .from('rule_groups')
        .select('name')
        .eq('id', rule_group_id)
        .single()

      if (ruleGroup) {
        ruleGroupName = ruleGroup.name
      }
    }

    // Fetch game roster with player details
    const { data: gameRoster } = await supabase
      .from('game_roster')
      .select('*')
      .eq('game_id', game_id)

    // Fetch all players on the team
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', game.team_id)
      .eq('active', true)

    if (!players || players.length === 0) {
      return NextResponse.json(
        { error: 'No players on roster' },
        { status: 400 }
      )
    }

    // Fetch player ratings
    const playerIds = players.map(p => p.id)
    const { data: allRatings } = await supabase
      .from('player_ratings')
      .select('*')
      .in('player_id', playerIds)

    // Fetch position eligibility
    const { data: allEligibility } = await supabase
      .from('position_eligibility')
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

    // Fetch team rules - filter by rule_group_id if provided
    let rulesQuery = supabase
      .from('team_rules')
      .select('*')
      .eq('team_id', game.team_id)
      .eq('active', true)
      .order('priority', { ascending: true })

    if (rule_group_id) {
      rulesQuery = rulesQuery.eq('rule_group_id', rule_group_id)
    }

    const { data: rules } = await rulesQuery

    // Fetch game preferences
    const { data: preferences } = await supabase
      .from('game_preferences')
      .select('*')
      .eq('game_id', game_id)
      .order('priority', { ascending: true })

    // Create lookup maps
    const ratingsMap = new Map(allRatings?.map(r => [r.player_id, r]) ?? [])
    const eligibilityMap = new Map(allEligibility?.map(e => [e.player_id, e]) ?? [])
    const rosterMap = new Map(gameRoster?.map(r => [r.player_id, r]) ?? [])
    const battingStatsMap = new Map(battingStats?.map(s => [s.player_id, s]) ?? [])
    const fieldingStatsMap = new Map(fieldingStats?.map(s => [s.player_id, s]) ?? [])

    // Transform players for lineup generation
    const playersForLineup = players.map(player =>
      transformPlayerData({
        player,
        ratings: ratingsMap.get(player.id) ?? null,
        eligibility: eligibilityMap.get(player.id) ?? null,
        gameRoster: rosterMap.get(player.id) ?? null,
        battingStats: battingStatsMap.get(player.id) ?? null,
        fieldingStats: fieldingStatsMap.get(player.id) ?? null,
      })
    )

    // Filter available players
    const availablePlayers = playersForLineup.filter(p => {
      const rosterEntry = rosterMap.get(p.id)
      // If no roster entry, consider available by default
      return rosterEntry ? rosterEntry.available : true
    })

    if (availablePlayers.length < 9) {
      return NextResponse.json(
        { error: `Need at least 9 available players. Currently have ${availablePlayers.length}.` },
        { status: 400 }
      )
    }

    // Transform rules and preferences
    const teamRules: TeamRule[] = (rules ?? []).map(r => ({
      id: r.id,
      rule_text: r.rule_text,
      priority: r.priority ?? 0,
      active: r.active ?? true,
      rule_group_id: r.rule_group_id,
    }))

    const gamePreferences: GamePreference[] = (preferences ?? []).map(p => ({
      id: p.id,
      preference_text: p.preference_text,
      priority: p.priority ?? 0,
    }))

    const innings = game.innings ?? 6

    // Get scouting report from game data
    const scoutingReport = game.scouting_report || null

    // Handle phased generation
    if (phase === 'batting_order') {
      // Phase 1: Generate batting order only
      const prompt = buildBattingOrderPrompt(
        innings,
        ruleGroupName,
        playersForLineup,
        teamRules,
        gamePreferences,
        teamContext,
        additional_notes,
        scoutingReport
      )

      const response = await claudeClient.generateBattingOrder(prompt)

      // Filter out any empty entries from the AI response
      const filteredBattingOrder = response.batting_order.filter(
        entry => entry.player_id && entry.name
      )

      // Re-number the order to be sequential
      const cleanedBattingOrder = filteredBattingOrder.map((entry, index) => ({
        ...entry,
        order: index + 1,
      }))

      // Save batting order to the lineups table
      const { data: existingLineups } = await supabase
        .from('lineups')
        .select('version')
        .eq('game_id', game_id)
        .order('version', { ascending: false })
        .limit(1)

      const newVersion = (existingLineups?.[0]?.version ?? 0) + 1

      const { data: savedLineup, error: saveError } = await supabase
        .from('lineups')
        .insert({
          game_id,
          version: newVersion,
          batting_order: cleanedBattingOrder,
          defensive_grid: [], // Empty array - will be filled in defensive phase
          rules_check: [],
          warnings: [],
          rule_group_id: rule_group_id || null,
          ai_reasoning: response.rationale,
        })
        .select()
        .single()

      if (saveError) {
        console.error('Failed to save lineup:', saveError)
        return NextResponse.json(
          { error: 'Failed to save lineup' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        phase: 'batting_order',
        batting_order: cleanedBattingOrder,
        rationale: response.rationale,
        lineup: savedLineup,
      })

    } else {
      // Phase 2: Generate defensive positions
      const prompt = buildDefensivePrompt(
        innings,
        ruleGroupName,
        playersForLineup,
        batting_order!,
        teamRules,
        gamePreferences,
        locked_positions || [],
        start_from_inning || 1,
        teamContext,
        additional_notes,
        scoutingReport
      )

      const response = await claudeClient.generateDefensive(prompt)

      // Update the existing lineup with defensive positions
      const { data: existingLineups } = await supabase
        .from('lineups')
        .select('*')
        .eq('game_id', game_id)
        .order('version', { ascending: false })
        .limit(1)

      if (existingLineups && existingLineups.length > 0) {
        // Update existing lineup
        const { error: updateError } = await supabase
          .from('lineups')
          .update({
            defensive_grid: response.defense,
            rules_check: response.rules_check,
            warnings: response.warnings,
            ai_reasoning: (existingLineups[0].ai_reasoning || '') + '\n\nDefensive: ' + response.rationale,
          })
          .eq('id', existingLineups[0].id)

        if (updateError) {
          console.error('Failed to update lineup:', updateError)
          return NextResponse.json(
            { error: 'Failed to update lineup' },
            { status: 500 }
          )
        }

        const { data: updatedLineup } = await supabase
          .from('lineups')
          .select()
          .eq('id', existingLineups[0].id)
          .single()

        return NextResponse.json({
          success: true,
          phase: 'defensive',
          defense: response.defense,
          rules_check: response.rules_check,
          warnings: response.warnings,
          rationale: response.rationale,
          lineup: updatedLineup,
        })
      } else {
        // Create new lineup with both batting order and defense
        const newVersion = 1

        const { data: savedLineup, error: saveError } = await supabase
          .from('lineups')
          .insert({
            game_id,
            version: newVersion,
            batting_order: batting_order,
            defensive_grid: response.defense,
            rules_check: response.rules_check,
            warnings: response.warnings,
            rule_group_id: rule_group_id || null,
            ai_reasoning: response.rationale,
          })
          .select()
          .single()

        if (saveError) {
          console.error('Failed to save lineup:', saveError)
          return NextResponse.json(
            { error: 'Failed to save lineup' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          phase: 'defensive',
          defense: response.defense,
          rules_check: response.rules_check,
          warnings: response.warnings,
          rationale: response.rationale,
          lineup: savedLineup,
        })
      }
    }

  } catch (error) {
    console.error('Lineup generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate lineup' },
      { status: 500 }
    )
  }
}
