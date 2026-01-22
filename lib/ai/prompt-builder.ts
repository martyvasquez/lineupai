import type {
  PlayerForLineup,
  TeamRule,
  GamePreference,
  BattingOrderEntry,
  LockedPosition,
} from '@/types/lineup'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row']
type PlayerRatings = Database['public']['Tables']['player_ratings']['Row']
type PositionEligibility = Database['public']['Tables']['position_eligibility']['Row']
type GameRoster = Database['public']['Tables']['game_roster']['Row']
type BattingStats = Database['public']['Views']['gamechanger_batting_season']['Row']
type FieldingStats = Database['public']['Views']['gamechanger_fielding_season']['Row']

interface PlayerData {
  player: Player
  ratings: PlayerRatings | null
  eligibility: PositionEligibility | null
  gameRoster: GameRoster | null
  battingStats: BattingStats | null
  fieldingStats: FieldingStats | null
}

// Calculate aggregated ratings from the 14 specific ratings
function calculateAggregatedRatings(ratings: PlayerRatings | null): {
  batting: number
  infield: number
  outfield: number
  pitching: number
  catching: number
} {
  if (!ratings) {
    return { batting: 3, infield: 3, outfield: 3, pitching: 3, catching: 3 }
  }

  // Calculate averages, treating null as 3 (average)
  const safeAvg = (...values: (number | null)[]): number => {
    const validValues = values.filter((v): v is number => v !== null)
    if (validValues.length === 0) return 3
    return Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length)
  }

  return {
    // Batting = plate discipline, contact ability, batting power, run speed
    batting: safeAvg(
      ratings.plate_discipline,
      ratings.contact_ability,
      ratings.batting_power,
      ratings.run_speed
    ),
    // Infield = fielding hands, throw accuracy, baseball IQ, attention
    infield: safeAvg(
      ratings.fielding_hands,
      ratings.fielding_throw_accuracy,
      ratings.baseball_iq,
      ratings.attention
    ),
    // Outfield = fielding hands, fly ball ability, arm strength
    outfield: safeAvg(
      ratings.fielding_hands,
      ratings.fly_ball_ability,
      ratings.fielding_arm_strength
    ),
    // Pitching = pitch control, velocity, composure
    pitching: safeAvg(
      ratings.pitch_control,
      ratings.pitch_velocity,
      ratings.pitch_composure
    ),
    // Catching = catcher ability
    catching: ratings.catcher_ability ?? 3,
  }
}

// Transform player data into the format needed for lineup generation
export function transformPlayerData(playerData: PlayerData): PlayerForLineup {
  const { player, ratings, eligibility, gameRoster, battingStats, fieldingStats } = playerData

  const aggregatedRatings = calculateAggregatedRatings(ratings)

  const result: PlayerForLineup = {
    id: player.id,
    name: player.name,
    jersey_number: player.jersey_number,
    available: gameRoster?.available ?? true,
    pitching_innings_available: gameRoster?.pitching_innings_available ?? 0,
    restrictions: gameRoster?.restrictions ?? null,
    position_strengths: player.position_strengths ?? [],
    eligibility: {
      can_pitch: eligibility?.can_pitch ?? false,
      can_catch: eligibility?.can_catch ?? false,
      can_play_ss: eligibility?.can_play_ss ?? false,
      can_play_1b: eligibility?.can_play_1b ?? false,
    },
    ratings: {
      ...aggregatedRatings,
      plate_discipline: ratings?.plate_discipline ?? null,
      contact_ability: ratings?.contact_ability ?? null,
      run_speed: ratings?.run_speed ?? null,
      batting_power: ratings?.batting_power ?? null,
      fielding_hands: ratings?.fielding_hands ?? null,
      fielding_throw_accuracy: ratings?.fielding_throw_accuracy ?? null,
      fielding_arm_strength: ratings?.fielding_arm_strength ?? null,
      baseball_iq: ratings?.baseball_iq ?? null,
      attention: ratings?.attention ?? null,
      fly_ball_ability: ratings?.fly_ball_ability ?? null,
      pitch_control: ratings?.pitch_control ?? null,
      pitch_velocity: ratings?.pitch_velocity ?? null,
      pitch_composure: ratings?.pitch_composure ?? null,
      catcher_ability: ratings?.catcher_ability ?? null,
    },
  }

  // Add stats if available
  if (battingStats || fieldingStats) {
    result.stats = {
      pa: battingStats?.pa ?? 0,
      avg: battingStats?.avg ?? 0,
      obp: battingStats?.obp ?? 0,
      slg: battingStats?.slg ?? 0,
      k_rate: battingStats?.k_rate ?? 0,
      bb_rate: battingStats?.bb_rate ?? 0,
      sb: battingStats?.sb ?? 0,
      fpct: fieldingStats?.fpct ?? 0,
      errors: fieldingStats?.e ?? 0,
      tc: fieldingStats?.tc ?? 0,
    }
  }

  return result
}

// Helper function to build player text section
function buildPlayerText(player: PlayerForLineup): string {
  const positionStrengthsText = player.position_strengths.length > 0
    ? player.position_strengths.join(' > ')
    : 'Not specified'

  let text = `---
Name: ${player.name}
ID: ${player.id}
Jersey: #${player.jersey_number ?? 'N/A'}
Available: ${player.available}
Position Strengths (in order): ${positionStrengthsText}

Premium Position Eligibility:
  Can Pitch: ${player.eligibility.can_pitch}
  Can Catch: ${player.eligibility.can_catch}
  Can Play SS: ${player.eligibility.can_play_ss}
  Can Play 1B: ${player.eligibility.can_play_1b}
  Restrictions: ${player.restrictions || 'none'}

Subjective Ratings (1-5):
  Batting: ${player.ratings.batting}
  Infield: ${player.ratings.infield}
  Outfield: ${player.ratings.outfield}
  Pitching: ${player.ratings.pitching}
  Catching: ${player.ratings.catching}`

  // Add GameChanger stats if available
  if (player.stats && player.stats.pa > 0) {
    text += `

GameChanger Stats:
  PA: ${player.stats.pa}, AVG: ${player.stats.avg.toFixed(3)}, OBP: ${player.stats.obp.toFixed(3)}, SLG: ${player.stats.slg.toFixed(3)}
  K%: ${(player.stats.k_rate * 100).toFixed(1)}%, BB%: ${(player.stats.bb_rate * 100).toFixed(1)}%, SB: ${player.stats.sb}
  FPCT: ${player.stats.fpct.toFixed(3)}, Errors: ${player.stats.errors}, TC: ${player.stats.tc}`
  }

  return text
}

// Build the prompt for batting order generation (Phase 1)
export function buildBattingOrderPrompt(
  innings: number,
  ruleGroupName: string | null,
  players: PlayerForLineup[],
  rules: TeamRule[],
  preferences: GamePreference[],
  additionalNotes?: string | null
): string {
  const availablePlayers = players.filter(p => p.available)

  // Build players section
  const playersText = availablePlayers.map(buildPlayerText).join('\n')

  // Build rules section
  const activeRules = rules.filter(r => r.active)
  const rulesText = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.rule_text}`).join('\n')
    : '1. No specific rules defined - use standard youth baseball best practices'

  // Build preferences section
  const prefsText = preferences.length > 0
    ? preferences.map(p => `- ${p.preference_text}`).join('\n')
    : '- Optimize for player development and fair playing time'

  // Build the full prompt
  const ruleGroupInfo = ruleGroupName
    ? `- Rule Group: ${ruleGroupName}`
    : '- Rule Group: None selected (using default best practices)'

  // Build additional notes section if provided
  const additionalNotesSection = additionalNotes
    ? `

ADDITIONAL NOTES FROM COACH (IMPORTANT - FOLLOW THESE INSTRUCTIONS):
${additionalNotes}`
    : ''

  return `BATTING ORDER GENERATION

GAME SETUP:
- Innings: ${innings}
- Players Available: ${availablePlayers.length}
${ruleGroupInfo}

PLAYERS:
${playersText}

TEAM RULES (MANDATORY):
${rulesText}

GAME PREFERENCES (OPTIMIZE FOR):
${prefsText}${additionalNotesSection}

Generate ONLY the batting order. Consider:
- Put your best on-base players at the top (1-2 spots)
- Strong hitters in the 3-4-5 spots
- Speed at the top and bottom of the order
- Consider matchups against likely pitching

Return JSON only:

{
  "batting_order": [
    {"order": 1, "player_id": "string", "name": "string", "reasoning": "string"}
  ],
  "rationale": "Brief overall explanation of the batting order strategy"
}`
}

// Build the prompt for defensive position generation (Phase 2)
export function buildDefensivePrompt(
  innings: number,
  ruleGroupName: string | null,
  players: PlayerForLineup[],
  battingOrder: BattingOrderEntry[],
  rules: TeamRule[],
  preferences: GamePreference[],
  lockedPositions: LockedPosition[],
  startFromInning: number,
  additionalNotes?: string | null
): string {
  const availablePlayers = players.filter(p => p.available)

  // Build players section
  const playersText = availablePlayers.map(buildPlayerText).join('\n')

  // Build batting order section
  const battingOrderText = battingOrder
    .map(entry => `${entry.order}. ${entry.name} (ID: ${entry.player_id})`)
    .join('\n')

  // Build locked positions section
  let lockedPositionsText = ''
  if (lockedPositions.length > 0) {
    const lockedByInning = new Map<number, string[]>()
    lockedPositions.forEach(lp => {
      const playerName = battingOrder.find(b => b.player_id === lp.playerId)?.name || 'Unknown'
      const existing = lockedByInning.get(lp.inning) || []
      existing.push(`${playerName} at ${lp.position}`)
      lockedByInning.set(lp.inning, existing)
    })

    lockedPositionsText = '\n\nLOCKED POSITIONS (DO NOT CHANGE):\n'
    Array.from(lockedByInning.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([inning, positions]) => {
        lockedPositionsText += `Inning ${inning}: ${positions.join(', ')}\n`
      })
  }

  // Build rules section
  const activeRules = rules.filter(r => r.active)
  const rulesText = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.rule_text}`).join('\n')
    : '1. No specific rules defined - use standard youth baseball best practices'

  // Build preferences section
  const prefsText = preferences.length > 0
    ? preferences.map(p => `- ${p.preference_text}`).join('\n')
    : '- Optimize for player development and fair playing time'

  // Build the full prompt
  const ruleGroupInfo = ruleGroupName
    ? `- Rule Group: ${ruleGroupName}`
    : '- Rule Group: None selected (using default best practices)'

  // Build additional notes section if provided
  const additionalNotesSection = additionalNotes
    ? `

ADDITIONAL NOTES FROM COACH (IMPORTANT - FOLLOW THESE INSTRUCTIONS):
${additionalNotes}`
    : ''

  // Build regeneration note if starting from a later inning
  const regenerationNote = startFromInning > 1
    ? `\n\nREGENERATION NOTE: Generate defensive positions starting from inning ${startFromInning}. Keep all locked positions intact.`
    : ''

  return `DEFENSIVE POSITION GENERATION

GAME SETUP:
- Innings: ${innings}
- Players Available: ${availablePlayers.length}
- Generate from inning: ${startFromInning}
${ruleGroupInfo}

BATTING ORDER (already determined):
${battingOrderText}
${lockedPositionsText}
PLAYERS:
${playersText}

TEAM RULES (MANDATORY):
${rulesText}

GAME PREFERENCES (OPTIMIZE FOR):
${prefsText}${additionalNotesSection}${regenerationNote}

Generate defensive positions for ${startFromInning === 1 ? 'all' : `innings ${startFromInning}-${innings}`}. Consider:
- Respect all LOCKED POSITIONS - do not change them
- Player position strengths (use them optimally)
- Premium positions (P, C, SS, 1B) should go to eligible players
- Rotate players through different positions for development
- Balance playing time - minimize consecutive sitting
- If more than 9 players, some must sit each inning

Return JSON only:

{
  "defense": [
    {
      "inning": 1,
      "P": {"id": "string", "name": "string"},
      "C": {"id": "string", "name": "string"},
      "1B": {"id": "string", "name": "string"},
      "2B": {"id": "string", "name": "string"},
      "3B": {"id": "string", "name": "string"},
      "SS": {"id": "string", "name": "string"},
      "LF": {"id": "string", "name": "string"},
      "CF": {"id": "string", "name": "string"},
      "RF": {"id": "string", "name": "string"},
      "sit": [{"id": "string", "name": "string"}],
      "reasoning": "Brief explanation for this inning's assignments"
    }
  ],
  "rules_check": [
    {"rule": "string", "satisfied": true, "details": "string"}
  ],
  "warnings": ["string"],
  "rationale": "Brief overall explanation of the defensive strategy"
}`
}

// Legacy function - kept for backwards compatibility
export function buildLineupPrompt(
  innings: number,
  ruleGroupName: string | null,
  players: PlayerForLineup[],
  rules: TeamRule[],
  preferences: GamePreference[],
  additionalNotes?: string | null
): string {
  const availablePlayers = players.filter(p => p.available)

  // Build players section
  const playersText = availablePlayers.map(player => {
    const positionStrengthsText = player.position_strengths.length > 0
      ? player.position_strengths.join(' > ')
      : 'Not specified'

    let text = `---
Name: ${player.name}
ID: ${player.id}
Jersey: #${player.jersey_number ?? 'N/A'}
Available: true
Pitching Innings Available: ${player.pitching_innings_available}

Position Strengths (in order): ${positionStrengthsText}

Premium Position Eligibility:
  Can Pitch: ${player.eligibility.can_pitch}
  Can Catch: ${player.eligibility.can_catch}
  Can Play SS: ${player.eligibility.can_play_ss}
  Can Play 1B: ${player.eligibility.can_play_1b}
  Restrictions: ${player.restrictions || 'none'}

Subjective Ratings (1-5):
  Batting: ${player.ratings.batting}
  Infield: ${player.ratings.infield}
  Outfield: ${player.ratings.outfield}
  Pitching: ${player.ratings.pitching}
  Catching: ${player.ratings.catching}`

    // Add GameChanger stats if available
    if (player.stats && player.stats.pa > 0) {
      text += `

GameChanger Stats:
  PA: ${player.stats.pa}, AVG: ${player.stats.avg.toFixed(3)}, OBP: ${player.stats.obp.toFixed(3)}, SLG: ${player.stats.slg.toFixed(3)}
  K%: ${(player.stats.k_rate * 100).toFixed(1)}%, BB%: ${(player.stats.bb_rate * 100).toFixed(1)}%, SB: ${player.stats.sb}
  FPCT: ${player.stats.fpct.toFixed(3)}, Errors: ${player.stats.errors}, TC: ${player.stats.tc}`
    }

    return text
  }).join('\n')

  // Build rules section
  const activeRules = rules.filter(r => r.active)
  const rulesText = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.rule_text}`).join('\n')
    : '1. No specific rules defined - use standard youth baseball best practices'

  // Build preferences section
  const prefsText = preferences.length > 0
    ? preferences.map(p => `- ${p.preference_text}`).join('\n')
    : '- Optimize for player development and fair playing time'

  // Build the full prompt
  const ruleGroupInfo = ruleGroupName
    ? `- Rule Group: ${ruleGroupName}`
    : '- Rule Group: None selected (using default best practices)'

  // Build additional notes section if provided
  const additionalNotesSection = additionalNotes
    ? `

ADDITIONAL NOTES FROM COACH (IMPORTANT - FOLLOW THESE INSTRUCTIONS):
${additionalNotes}`
    : ''

  return `GAME SETUP:
- Innings: ${innings}
- Players Available: ${availablePlayers.length}
${ruleGroupInfo}

PLAYERS:
${playersText}

TEAM RULES (MANDATORY):
${rulesText}

GAME PREFERENCES (OPTIMIZE FOR):
${prefsText}${additionalNotesSection}

Generate the lineup now. Return JSON only:

{
  "batting_order": [
    {"order": 1, "player_id": "string", "name": "string", "reasoning": "string"}
  ],
  "defense": [
    {
      "inning": 1,
      "P": {"id": "string", "name": "string"},
      "C": {"id": "string", "name": "string"},
      "1B": {"id": "string", "name": "string"},
      "2B": {"id": "string", "name": "string"},
      "3B": {"id": "string", "name": "string"},
      "SS": {"id": "string", "name": "string"},
      "LF": {"id": "string", "name": "string"},
      "CF": {"id": "string", "name": "string"},
      "RF": {"id": "string", "name": "string"},
      "sit": [{"id": "string", "name": "string"}],
      "reasoning": "string"
    }
  ],
  "rules_check": [
    {"rule": "string", "satisfied": true, "details": "string"}
  ],
  "warnings": ["string"],
  "summary": "string"
}`
}
