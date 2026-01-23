// Lineup generation types

// Rule Group interface - user-defined groups of rules
export interface RuleGroup {
  id: string
  team_id: string
  name: string
  description: string | null
  created_at: string
}

// Input types for lineup generation
export interface PlayerForLineup {
  id: string
  name: string
  jersey_number: number | null
  available: boolean
  pitching_innings_available: number
  restrictions: string | null
  position_strengths: string[]
  eligibility: {
    can_pitch: boolean
    can_catch: boolean
    can_play_ss: boolean
    can_play_1b: boolean
  }
  ratings: {
    // Aggregated ratings for AI prompt
    batting: number
    infield: number
    outfield: number
    pitching: number
    catching: number
    // Individual ratings for display
    plate_discipline: number | null
    contact_ability: number | null
    run_speed: number | null
    batting_power: number | null
    fielding_hands: number | null
    fielding_throw_accuracy: number | null
    fielding_arm_strength: number | null
    baseball_iq: number | null
    attention: number | null
    fly_ball_ability: number | null
    pitch_control: number | null
    pitch_velocity: number | null
    pitch_composure: number | null
    catcher_ability: number | null
  }
  stats?: {
    pa: number
    avg: number
    obp: number
    slg: number
    k_rate: number
    bb_rate: number
    sb: number
    cs: number
    fpct: number
    errors: number
    tc: number
  }
}

export interface TeamRule {
  id: string
  rule_text: string
  priority: number
  active: boolean
  rule_group_id: string | null
}

export interface GamePreference {
  id: string
  preference_text: string
  priority: number
}

export interface LineupRequest {
  gameId: string
  innings: number
  ruleGroupId: string | null
  ruleGroupName: string | null
  players: PlayerForLineup[]
  rules: TeamRule[]
  preferences: GamePreference[]
}

// Output types from AI
export interface BattingOrderEntry {
  order: number
  player_id: string
  name: string
  reasoning: string
}

export interface PlayerAssignment {
  id: string
  name: string
}

export interface DefensiveInning {
  inning: number
  P: PlayerAssignment
  C: PlayerAssignment
  '1B': PlayerAssignment
  '2B': PlayerAssignment
  '3B': PlayerAssignment
  SS: PlayerAssignment
  LF: PlayerAssignment
  CF: PlayerAssignment
  RF: PlayerAssignment
  sit: PlayerAssignment[]
  reasoning: string
}

export interface RuleCheck {
  rule: string
  satisfied: boolean
  details: string
}

export interface LineupResponse {
  batting_order: BattingOrderEntry[]
  defense: DefensiveInning[]
  rules_check: RuleCheck[]
  warnings: string[]
  summary: string
}

// Position type
export type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF'

export const POSITIONS: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']
export const INFIELD_POSITIONS: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS']
export const OUTFIELD_POSITIONS: Position[] = ['LF', 'CF', 'RF']
export const PREMIUM_POSITIONS: Position[] = ['P', 'C', 'SS', '1B']

// Phased generation types

// Locked positions set by coach before AI fills
export interface LockedPosition {
  playerId: string
  inning: number
  position: Position | 'SIT'
}

// Grid cell state for the interactive lineup grid
export interface GridCell {
  playerId: string
  inning: number
  position: Position | 'SIT' | null // null = not yet assigned
  locked: boolean // true if coach manually set
}

// Phase type for generation
export type GenerationPhase = 'batting_order' | 'defensive'

// API request for phased generation
export interface GenerateLineupRequest {
  game_id: string
  rule_group_id: string | null
  additional_notes: string | null
  phase: GenerationPhase
  // For defensive phase only:
  batting_order?: BattingOrderEntry[]
  locked_positions?: LockedPosition[]
  start_from_inning?: number // For mid-game regeneration
}

// Response for batting order phase
export interface BattingOrderResponse {
  batting_order: BattingOrderEntry[]
  rationale: string
}

// Response for defensive phase
export interface DefensiveResponse {
  defense: DefensiveInning[]
  rules_check: RuleCheck[]
  warnings: string[]
  rationale: string
}

// Player stats analysis types
export interface PlayerStatsAnalysis {
  strengths: Array<{
    category: string
    description: string
    supporting_stats: string
  }>
  weaknesses: Array<{
    category: string
    description: string
    supporting_stats: string
  }>
  summary: string
  recommended_batting_position: string
  recommended_defensive_positions: string[]
}

export interface StatsAnalysisResponse {
  analyses: Array<{
    player_id: string
    analysis: PlayerStatsAnalysis
  }>
}

// Team-level analysis types
export interface TeamAnalysis {
  team_strengths: Array<{
    category: string
    description: string
    supporting_stats: string
  }>
  team_weaknesses: Array<{
    category: string
    description: string
    supporting_stats: string
  }>
  practice_recommendations: Array<{
    focus_area: string
    drill_suggestions: string
    priority: 'high' | 'medium' | 'low'
  }>
  lineup_insights: {
    best_leadoff_candidates: string[]
    best_power_spots: string[]
    defensive_strengths: string[]
    defensive_concerns: string[]
  }
  summary: string
}
