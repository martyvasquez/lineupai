import type {
  PlayerForLineup,
  TeamRule,
  GamePreference,
  BattingOrderEntry,
  LockedPosition,
  DefensiveInning,
  Position,
  GamePriority,
} from '@/types/lineup'
import type { Database } from '@/types/database'

type Player = Database['public']['Tables']['players']['Row']

// Team context for AI prompts
export interface TeamContext {
  name: string
  age_group: string | null
}
type PlayerRatings = Database['public']['Tables']['player_ratings']['Row']
type PositionEligibility = Database['public']['Tables']['position_eligibility']['Row']
type GameRoster = Database['public']['Tables']['game_roster']['Row']
type BattingStats = Database['public']['Views']['gamechanger_batting_season']['Row']
type FieldingStats = Database['public']['Views']['gamechanger_fielding_season']['Row']

// Game priority prompts - injected at the top of AI prompts
export const GAME_PRIORITY_PROMPTS: Record<GamePriority, string> = {
  'win': 'PRIMARY DIRECTIVE: Winning is the top priority. Always recommend the lineup, plays, and substitutions that maximize the chance of winning, regardless of player development considerations. Prioritize experienced players and proven strategies over giving less experienced players opportunities.',
  'win-leaning': 'PRIMARY DIRECTIVE: Winning takes priority over player development. Favor decisions that increase win probability, but when the game situation allows (comfortable lead, low-stakes moments), you may suggest development opportunities. Never sacrifice a likely win for development purposes.',
  'balanced': 'PRIMARY DIRECTIVE: Winning and player development carry equal weight. Seek decisions that advance both goals when possible. In close games, lean toward winning; in comfortable situations, lean toward development. Explicitly acknowledge tradeoffs when they exist.',
  'dev-leaning': 'PRIMARY DIRECTIVE: Player development takes priority over winning. Favor decisions that maximize learning and growth opportunities, but do not completely abandon competitive play. In critical moments, winning considerations may factor in, but default to development-focused choices.',
  'develop': 'PRIMARY DIRECTIVE: Player development is the top priority. Always recommend decisions that maximize player growth, learning, and experience—even at the cost of winning. Rotate players, try new strategies, and give all players meaningful opportunities regardless of game situation.',
}

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
      cs: battingStats?.cs ?? 0,
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

// Build simplified player text for batting order prompt
function buildBattingPlayerText(player: PlayerForLineup): string {
  let text = `---
Name: ${player.name}
ID: ${player.id}
Subjective Ratings: Plate Discipline: ${player.ratings.plate_discipline ?? 3}, Contact Ability: ${player.ratings.contact_ability ?? 3}, Power: ${player.ratings.batting_power ?? 3}, Run Speed: ${player.ratings.run_speed ?? 3}`

  // Add GameChanger stats if available
  if (player.stats && player.stats.pa > 0) {
    // Calculate SB% (stolen base percentage)
    const sbAttempts = player.stats.sb + player.stats.cs
    const sbPct = sbAttempts > 0 ? (player.stats.sb / sbAttempts * 100).toFixed(0) : 'N/A'
    text += `
GameChanger Stats: AVG: ${player.stats.avg.toFixed(3)}, OBP: ${player.stats.obp.toFixed(3)}, SLG: ${player.stats.slg.toFixed(3)}, K%: ${(player.stats.k_rate * 100).toFixed(1)}%, BB%: ${(player.stats.bb_rate * 100).toFixed(1)}%, SB: ${player.stats.sb}, SB%: ${sbPct}%`
  }

  // Add coach notes if available
  const notes = player.restrictions
  text += `
Coach Notes: ${notes || 'none'}`

  return text
}

// Build the prompt for batting order generation (Phase 1)
export function buildBattingOrderPrompt(
  innings: number,
  ruleGroupName: string | null,
  players: PlayerForLineup[],
  rules: TeamRule[],
  preferences: GamePreference[],
  teamContext?: TeamContext | null,
  additionalNotes?: string | null,
  scoutingReport?: string | null,
  gamePriority?: GamePriority | null
): string {
  const availablePlayers = players.filter(p => p.available)

  // Get age group for persona
  const ageGroup = teamContext?.age_group || 'youth'

  // Build players section
  const playersText = availablePlayers.map(buildBattingPlayerText).join('\n')

  // Build rules section - these are the rules coaches define
  const activeRules = rules.filter(r => r.active)
  const rulesText = activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r.rule_text}`).join('\n')
    : '(No rules defined - use your expertise as a youth baseball coach)'

  // Build scouting report section
  const scoutingReportSection = scoutingReport
    ? `

Scouting Report: ${scoutingReport}`
    : `

Scouting Report: None provided`

  // Build additional notes section
  const additionalNotesSection = additionalNotes
    ? `

Notes for AI: ${additionalNotes}`
    : ''

  // Build priority directive section
  const priorityDirective = gamePriority
    ? `

${GAME_PRIORITY_PROMPTS[gamePriority]}
`
    : ''

  return `You are the highest rated youth baseball coach for ${ageGroup} players.
${priorityDirective}
You will be coming up with the batting order.

Here are the rules listed in order of priority that you must follow:
${rulesText}

Here are the available players:
${playersText}
${scoutingReportSection}
${additionalNotesSection}

Return JSON only:

{
  "batting_order": [
    {"order": 1, "player_id": "string", "name": "string", "reasoning": "string"}
  ],
  "rationale": "Brief overall explanation of the batting order strategy"
}`
}

// Build simplified player text for defensive prompt
function buildDefensivePlayerText(player: PlayerForLineup): string {
  const positionStrengthsText = player.position_strengths.length > 0
    ? player.position_strengths.join(' > ')
    : 'Not specified'

  // Build subjective ratings - base fielding ratings for all players
  const baseRatings = [
    `Speed: ${player.ratings.run_speed ?? 3}`,
    `Baseball IQ: ${player.ratings.baseball_iq ?? 3}`,
    `Attention: ${player.ratings.attention ?? 3}`,
    `Fielding Hands: ${player.ratings.fielding_hands ?? 3}`,
    `Throw Accuracy: ${player.ratings.fielding_throw_accuracy ?? 3}`,
    `Arm Strength: ${player.ratings.fielding_arm_strength ?? 3}`,
    `Fly Ball Ability: ${player.ratings.fly_ball_ability ?? 3}`,
  ]

  // Add pitching ratings only if eligible to pitch
  if (player.eligibility.can_pitch) {
    baseRatings.push(
      `Pitch Control: ${player.ratings.pitch_control ?? 3}`,
      `Pitch Velocity: ${player.ratings.pitch_velocity ?? 3}`,
      `Pitch Composure: ${player.ratings.pitch_composure ?? 3}`
    )
  }

  // Add catching rating only if eligible to catch
  if (player.eligibility.can_catch) {
    baseRatings.push(`Catcher Ability: ${player.ratings.catcher_ability ?? 3}`)
  }

  let text = `---
Name: ${player.name}
ID: ${player.id}
Subjective Ratings: ${baseRatings.join(', ')}`

  // Add GameChanger stats if available (defensive stats only)
  if (player.stats && player.stats.tc > 0) {
    text += `
GameChanger Stats: FPCT: ${player.stats.fpct.toFixed(3)}, Errors: ${player.stats.errors}, TC: ${player.stats.tc}`
  }

  text += `
Premium Position Eligibility: Pitch: ${player.eligibility.can_pitch ? 'yes' : 'no'}, Catch: ${player.eligibility.can_catch ? 'yes' : 'no'}, SS: ${player.eligibility.can_play_ss ? 'yes' : 'no'}, 1B: ${player.eligibility.can_play_1b ? 'yes' : 'no'}
Position Strengths: ${positionStrengthsText}`

  // Add coach notes if available
  const notes = player.restrictions
  text += `
Coach Notes: ${notes || 'none'}`

  return text
}

// Helper function to format the current lineup for the prompt (for regeneration context)
function formatCurrentLineupForPrompt(
  grid: DefensiveInning[],
  battingOrder: BattingOrderEntry[]
): string {
  const POSITIONS_LIST: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']
  const lines: string[] = []

  for (const inningData of grid) {
    const positions: string[] = []

    for (const pos of POSITIONS_LIST) {
      const player = inningData[pos]
      if (player?.name) {
        positions.push(`${pos}: ${player.name}`)
      }
    }

    if (inningData.sit && inningData.sit.length > 0) {
      const sittingNames = inningData.sit.map(p => p.name).join(', ')
      positions.push(`SIT: ${sittingNames}`)
    }

    lines.push(`Inning ${inningData.inning}: ${positions.join(', ')}`)
  }

  return lines.join('\n')
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
  teamContext?: TeamContext | null,
  additionalNotes?: string | null,
  scoutingReport?: string | null,
  currentGrid?: DefensiveInning[] | null,
  feedback?: string | null,
  gamePriority?: GamePriority | null
): string {
  const availablePlayers = players.filter(p => p.available)

  // Get age group for persona
  const ageGroup = teamContext?.age_group || 'youth'

  // Build players section
  const playersText = availablePlayers.map(buildDefensivePlayerText).join('\n')

  // Build batting order section
  const battingOrderText = battingOrder
    .map(entry => `${entry.order}. ${entry.name} (ID: ${entry.player_id})`)
    .join('\n')

  // Build locked positions section
  let lockedPositionsText = 'None'
  if (lockedPositions.length > 0) {
    const lockedByInning = new Map<number, string[]>()
    lockedPositions.forEach(lp => {
      const playerName = battingOrder.find(b => b.player_id === lp.playerId)?.name || 'Unknown'
      const existing = lockedByInning.get(lp.inning) || []
      existing.push(`${playerName} at ${lp.position}`)
      lockedByInning.set(lp.inning, existing)
    })

    const lockedLines: string[] = []
    Array.from(lockedByInning.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([inning, positions]) => {
        lockedLines.push(`Inning ${inning}: ${positions.join(', ')}`)
      })
    lockedPositionsText = lockedLines.join('\n')
  }

  // Build rules section - locked positions is always rule #1
  const activeRules = rules.filter(r => r.active)
  let rulesText = '1. All locked positions must be maintained (see locked positions below)'
  if (activeRules.length > 0) {
    rulesText += '\n' + activeRules.map((r, i) => `${i + 2}. ${r.rule_text}`).join('\n')
  }

  // Build scouting report section
  const scoutingReportSection = scoutingReport
    ? `

Scouting Report: ${scoutingReport}`
    : `

Scouting Report: None provided`

  // Build additional notes section
  const additionalNotesSection = additionalNotes
    ? `

Notes for AI: ${additionalNotes}`
    : ''

  // Build current lineup section (for regeneration context)
  let currentLineupSection = ''
  if (currentGrid && currentGrid.length > 0 && feedback) {
    const currentLineupText = formatCurrentLineupForPrompt(currentGrid, battingOrder)
    currentLineupSection = `

CURRENT LINEUP (for context - the coach wants adjustments):
${currentLineupText}`
  }

  // Build feedback section
  const feedbackSection = feedback
    ? `

COACH FEEDBACK (IMPORTANT - This is what the coach wants changed):
${feedback}`
    : ''

  // Note about which innings to generate
  const inningsNote = startFromInning > 1
    ? `(Generate for innings ${startFromInning}-${innings})`
    : ''

  // Build priority directive section
  const priorityDirective = gamePriority
    ? `

${GAME_PRIORITY_PROMPTS[gamePriority]}
`
    : ''

  return `You are the highest rated youth baseball coach for ${ageGroup} players.
${priorityDirective}
You will be coming up with defense and positions for ${innings} innings. ${inningsNote}

CRITICAL: You MUST assign a player to EVERY position (P, C, 1B, 2B, 3B, SS, LF, CF, RF) for EVERY inning. No position can be left empty. Players who are not fielding go in the "sit" array.

PITCHER RULE: Once a player is removed from pitching, they CANNOT return to pitch later in the game. For example, if a player pitches innings 1-2 and then plays another position in inning 3, they cannot pitch again in innings 4, 5, 6, etc. Plan pitcher usage carefully.

Here are the rules listed in order of priority that you must follow:
${rulesText}

Batting Order (already determined):
${battingOrderText}

Locked Positions (DO NOT CHANGE):
${lockedPositionsText}

Here are the available players:
${playersText}
${scoutingReportSection}
${additionalNotesSection}${currentLineupSection}${feedbackSection}

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
