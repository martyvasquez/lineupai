import Anthropic from '@anthropic-ai/sdk'
import type {
  LineupResponse,
  BattingOrderResponse,
  DefensiveResponse,
  StatsAnalysisResponse,
  TeamAnalysis,
} from '@/types/lineup'

const SYSTEM_PROMPT = `You are a youth baseball lineup optimizer. Generate batting orders and defensive assignments that strictly comply with team rules while maximizing performance.

INPUTS YOU WILL RECEIVE:
- Available players with eligibility flags
- GameChanger statistics (if available)
- Coach subjective ratings (1-5 scale)
- Team rules (MANDATORY - these must all be satisfied)
- Game preferences (SOFT - optimize for these but rules take priority)

CORE PRINCIPLES:
1. Team rules are hard constraints. Never violate them.
2. If rules conflict or cannot all be satisfied, explain the conflict and provide the best valid alternative.
3. Use statistics when available; fall back to subjective ratings when not.
4. Explain key decisions briefly.

POSITION SHORTHAND:
- Infield: P, C, 1B, 2B, 3B, SS
- Outfield: LF, CF, RF
- Premium: P, C, SS, 1B (require eligibility flags)

OUTPUT FORMAT:
Return valid JSON only. No markdown, no explanation outside the JSON structure.`

const BATTING_ORDER_SYSTEM_PROMPT = `You are a youth baseball lineup optimizer specializing in batting order construction.

INPUTS YOU WILL RECEIVE:
- Available players with their ratings and stats
- Team rules that may affect batting order
- Coach preferences and notes

BATTING ORDER PRINCIPLES:
1. Lead-off (1st): Best on-base skills, speed, discipline
2. Second: Good contact, can move runners, some speed
3. Third: Best overall hitter, high average and power
4. Clean-up (4th): Most power, drives in runs
5. Fifth: Strong hitter, secondary power
6. Sixth-onwards: Decreasing offensive ability, but still capable

OUTPUT FORMAT:
Return valid JSON only. No markdown, no explanation outside the JSON structure.`

const DEFENSIVE_SYSTEM_PROMPT = `You are a youth baseball lineup optimizer specializing in defensive positioning.

INPUTS YOU WILL RECEIVE:
- Batting order (already determined)
- Player position strengths and eligibility
- Locked positions (DO NOT CHANGE THESE)
- Team rules for defensive rotation
- Coach preferences

CRITICAL REQUIREMENTS:
1. EVERY inning MUST have ALL 9 field positions filled: P, C, 1B, 2B, 3B, SS, LF, CF, RF
2. NO position can be left empty or null - every position MUST have a player assigned
3. Extra players beyond the 9 fielders go in the "sit" array
4. LOCKED POSITIONS must not be changed - they are coach decisions
5. PITCHER RULE: Once a player stops pitching, they CANNOT return to pitch later in the game. If a player pitches innings 1-2, they cannot pitch again in innings 3+. This is a fundamental baseball rule.

DEFENSIVE PRINCIPLES:
1. Premium positions (P, C, SS, 1B) require eligibility
2. Use player position strengths to optimize assignments
3. Rotate players for development (avoid same position all game)
4. Balance sitting time across all players
5. Consider stamina - don't overwork young players

OUTPUT FORMAT:
Return valid JSON only. No markdown, no explanation outside the JSON structure.
IMPORTANT: Every inning object MUST have all 9 positions (P, C, 1B, 2B, 3B, SS, LF, CF, RF) with valid player assignments. No nulls or missing positions allowed.`

const STATS_ANALYSIS_SYSTEM_PROMPT = `You are a youth baseball player analyst. Analyze player statistics to identify strengths and weaknesses.

INPUTS YOU WILL RECEIVE:
- Player batting statistics (AVG, OBP, SLG, OPS, hits, walks, strikeouts, etc.)
- Player fielding statistics (fielding percentage, errors, assists, etc.)
- Coach subjective ratings (1-5 scale)

ANALYSIS PRINCIPLES:
1. Be constructive - this is for youth development, not criticism
2. Back up every claim with specific statistics
3. Consider the context of youth baseball (e.g., .300 AVG is solid, high strikeouts are common)
4. Identify 2-4 strengths and 1-3 areas for improvement per player
5. Provide actionable insights when possible

CATEGORIES TO CONSIDER:
- Batting: Contact, Power, Plate Discipline, Speed
- Fielding: Hands, Range, Arm Strength, Consistency
- Mental: Baseball IQ, Focus, Composure

OUTPUT FORMAT:
Return valid JSON only. No markdown, no explanation outside the JSON structure.`

const TEAM_ANALYSIS_SYSTEM_PROMPT = `You are a youth baseball team analyst. Analyze aggregate team statistics to identify team-wide strengths, weaknesses, and provide practice recommendations.

INPUTS YOU WILL RECEIVE:
- Team aggregate batting statistics
- Team aggregate fielding statistics
- Individual player analyses (summaries)

ANALYSIS PRINCIPLES:
1. Focus on actionable insights for coaches
2. Be constructive - this is for youth development
3. Back up claims with specific team-wide statistics
4. Consider youth baseball context
5. Provide specific practice drill recommendations

KEY AREAS TO ANALYZE:
- Team batting approach (contact vs power, discipline)
- Team fielding consistency
- Defensive depth and flexibility
- Areas where multiple players struggle

OUTPUT FORMAT:
Return valid JSON only. No markdown, no explanation outside the JSON structure.`

function parseJsonResponse<T>(text: string): T {
  // Remove any markdown code blocks if present
  let cleanText = text.trim()
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7)
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3)
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3)
  }
  cleanText = cleanText.trim()

  return JSON.parse(cleanText) as T
}

export class ClaudeClient {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  // Legacy method for full lineup generation
  async generateLineup(prompt: string): Promise<LineupResponse> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    try {
      return parseJsonResponse<LineupResponse>(content.text)
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse lineup response from AI')
    }
  }

  // Phase 1: Generate batting order only
  async generateBattingOrder(prompt: string): Promise<BattingOrderResponse> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: BATTING_ORDER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    try {
      return parseJsonResponse<BattingOrderResponse>(content.text)
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse batting order response from AI')
    }
  }

  // Phase 2: Generate defensive positions
  async generateDefensive(prompt: string): Promise<DefensiveResponse> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: DEFENSIVE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    try {
      return parseJsonResponse<DefensiveResponse>(content.text)
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse defensive positions response from AI')
    }
  }

  // Generate stats analysis for players
  async generateStatsAnalysis(prompt: string): Promise<StatsAnalysisResponse> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: STATS_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    try {
      return parseJsonResponse<StatsAnalysisResponse>(content.text)
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse stats analysis response from AI')
    }
  }

  // Generate team-level analysis
  async generateTeamAnalysis(prompt: string): Promise<TeamAnalysis> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: TEAM_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    try {
      return parseJsonResponse<TeamAnalysis>(content.text)
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse team analysis response from AI')
    }
  }
}

export const claudeClient = new ClaudeClient()
