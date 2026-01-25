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
  DefensiveInning,
  GamePriority,
  DataWeighting,
} from '@/types/lineup'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      game_id,
      rule_group_id,
      additional_notes,
      phase = 'batting_order', // Default to batting_order for backwards compatibility
      game_priority,
      data_weighting,
      batting_order,
      locked_positions,
      start_from_inning,
      current_grid,
      feedback,
    } = body as {
      game_id: string
      rule_group_id: string | null
      additional_notes: string | null
      phase?: GenerationPhase
      game_priority?: GamePriority
      data_weighting?: DataWeighting
      batting_order?: BattingOrderEntry[]
      locked_positions?: LockedPosition[]
      start_from_inning?: number
      current_grid?: DefensiveInning[] | null
      feedback?: string | null
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
        scoutingReport,
        game_priority || null,
        data_weighting || null
      )

      const response = await claudeClient.generateBattingOrder(prompt)

      // Filter out any empty entries and deduplicate by player_id
      const seenPlayerIds = new Set<string>()
      const filteredBattingOrder = response.batting_order.filter(entry => {
        if (!entry.player_id || !entry.name) return false
        if (seenPlayerIds.has(entry.player_id)) return false
        seenPlayerIds.add(entry.player_id)
        return true
      })

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
        scoutingReport,
        current_grid || null,
        feedback || null,
        game_priority || null,
        data_weighting || null
      )

      const response = await claudeClient.generateDefensive(prompt)

      // Post-process: Ensure all positions are filled in each inning
      const POSITIONS: ('P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF')[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']

      for (const inningData of response.defense) {
        // Find which positions are missing or have null/undefined players
        const missingPositions: typeof POSITIONS = []
        const assignedPlayerIds = new Set<string>()

        for (const pos of POSITIONS) {
          const player = inningData[pos]
          if (!player || !player.id || !player.name) {
            missingPositions.push(pos)
          } else {
            assignedPlayerIds.add(player.id)
          }
        }

        // Also track players in sit array
        if (inningData.sit) {
          for (const player of inningData.sit) {
            if (player?.id) {
              assignedPlayerIds.add(player.id)
            }
          }
        }

        // If there are missing positions, fill them with unassigned players
        if (missingPositions.length > 0) {
          // Get unassigned players from the batting order
          const unassignedPlayers = batting_order!.filter(
            entry => !assignedPlayerIds.has(entry.player_id)
          )

          for (let i = 0; i < missingPositions.length && i < unassignedPlayers.length; i++) {
            const pos = missingPositions[i]
            const player = unassignedPlayers[i]
            inningData[pos] = {
              id: player.player_id,
              name: player.name,
            }
          }

          // If we still have missing positions after using all available players,
          // fill with a placeholder (shouldn't happen if we have enough players)
          for (const pos of missingPositions) {
            if (!inningData[pos] || !inningData[pos].id) {
              // Use the first player from batting order as fallback
              const fallbackPlayer = batting_order![0]
              inningData[pos] = {
                id: fallbackPlayer.player_id,
                name: fallbackPlayer.name,
              }
            }
          }
        }
      }

      // Post-process: Enforce pitcher rule (once pulled, cannot return to pitch)
      // Track each player's pitching status: 'not_started' | 'pitching' | 'pulled'
      const pitcherStatus = new Map<string, 'not_started' | 'pitching' | 'pulled'>()

      // Sort innings to process in order
      const sortedInnings = [...response.defense].sort((a, b) => a.inning - b.inning)

      for (const inningData of sortedInnings) {
        const currentPitcher = inningData.P
        if (!currentPitcher?.id) continue

        const currentStatus = pitcherStatus.get(currentPitcher.id) || 'not_started'

        if (currentStatus === 'pulled') {
          // This player already pitched and was pulled - they can't pitch again
          // Find a replacement from players who haven't been pulled
          const eligibleReplacements = batting_order!.filter(entry => {
            const status = pitcherStatus.get(entry.player_id)
            return status !== 'pulled' && entry.player_id !== currentPitcher.id
          })

          if (eligibleReplacements.length > 0) {
            // Find the player currently at another position who can swap
            let swapped = false
            for (const pos of POSITIONS) {
              if (pos === 'P') continue
              const playerAtPos = inningData[pos]
              if (playerAtPos?.id && eligibleReplacements.some(e => e.player_id === playerAtPos.id)) {
                const replacement = eligibleReplacements.find(e => e.player_id === playerAtPos.id)
                if (replacement) {
                  // Swap: move the eligible player to pitcher, move invalid pitcher to their position
                  inningData.P = { id: replacement.player_id, name: replacement.name }
                  inningData[pos] = currentPitcher
                  // Mark the new pitcher as pitching
                  pitcherStatus.set(replacement.player_id, 'pitching')
                  swapped = true
                  break
                }
              }
            }

            if (!swapped) {
              // Just pick the first eligible replacement and swap with whoever is at their current position
              const replacement = eligibleReplacements[0]
              // Find where the replacement currently is
              for (const pos of POSITIONS) {
                if (pos === 'P') continue
                if (inningData[pos]?.id === replacement.player_id) {
                  inningData.P = { id: replacement.player_id, name: replacement.name }
                  inningData[pos] = currentPitcher
                  pitcherStatus.set(replacement.player_id, 'pitching')
                  break
                }
              }
            }
          }
          // If no eligible replacements, we can't fix it - leave as is (shouldn't happen with enough players)
        } else {
          // Player is starting or continuing to pitch
          pitcherStatus.set(currentPitcher.id, 'pitching')
        }

        // Mark all players who were pitching but aren't now as 'pulled'
        for (const [playerId, status] of pitcherStatus.entries()) {
          if (status === 'pitching' && inningData.P?.id !== playerId) {
            pitcherStatus.set(playerId, 'pulled')
          }
        }
      }

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
    // Error logged for debugging in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Lineup generation error:', error)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate lineup' },
      { status: 500 }
    )
  }
}
