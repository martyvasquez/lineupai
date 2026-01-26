// Mock data for marketing showcase components

export interface MockPlayer {
  id: string
  name: string
  jersey: number
  avg: number
  obp: number
  slg: number
  ops: number
  h: number
  bb: number
  so: number
  sb: number
  cs: number
  fpct: number
}

export const MOCK_PLAYERS: MockPlayer[] = [
  { id: '1', name: 'Jake Martinez', jersey: 12, avg: 0.342, obp: 0.425, slg: 0.486, ops: 0.911, h: 28, bb: 15, so: 12, sb: 8, cs: 1, fpct: 0.956 },
  { id: '2', name: 'Cole Anderson', jersey: 7, avg: 0.385, obp: 0.401, slg: 0.512, ops: 0.913, h: 32, bb: 8, so: 10, sb: 3, cs: 2, fpct: 0.978 },
  { id: '3', name: 'Ryan Chen', jersey: 4, avg: 0.295, obp: 0.380, slg: 0.445, ops: 0.825, h: 23, bb: 12, so: 18, sb: 2, cs: 0, fpct: 0.989 },
  { id: '4', name: 'Sam Williams', jersey: 22, avg: 0.312, obp: 0.356, slg: 0.468, ops: 0.824, h: 25, bb: 6, so: 14, sb: 5, cs: 1, fpct: 0.945 },
  { id: '5', name: 'Tyler Brooks', jersey: 15, avg: 0.268, obp: 0.342, slg: 0.402, ops: 0.744, h: 19, bb: 9, so: 20, sb: 1, cs: 2, fpct: 0.962 },
  { id: '6', name: 'Max Rivera', jersey: 3, avg: 0.298, obp: 0.368, slg: 0.425, ops: 0.793, h: 22, bb: 10, so: 15, sb: 6, cs: 2, fpct: 0.972 },
  { id: '7', name: 'Ben Taylor', jersey: 9, avg: 0.255, obp: 0.315, slg: 0.375, ops: 0.690, h: 17, bb: 7, so: 22, sb: 4, cs: 1, fpct: 0.938 },
  { id: '8', name: 'Noah Garcia', jersey: 18, avg: 0.278, obp: 0.348, slg: 0.410, ops: 0.758, h: 20, bb: 8, so: 16, sb: 2, cs: 0, fpct: 0.951 },
  { id: '9', name: 'Ethan Park', jersey: 11, avg: 0.245, obp: 0.302, slg: 0.358, ops: 0.660, h: 15, bb: 5, so: 25, sb: 0, cs: 1, fpct: 0.968 },
]

export interface LineupRationale {
  position: number
  playerId: string
  reason: string
}

export const MOCK_LINEUP_RATIONALE: LineupRationale[] = [
  { position: 1, playerId: '1', reason: 'Elite OBP (.425) with speed threat - 8 SB' },
  { position: 2, playerId: '2', reason: 'Best contact hitter (.385 AVG), protects the leadoff' },
  { position: 3, playerId: '3', reason: 'Highest power potential, patient at plate' },
  { position: 4, playerId: '4', reason: 'Reliable RBI producer, solid contact' },
  { position: 5, playerId: '6', reason: 'Good on-base skills, can drive in runs' },
  { position: 6, playerId: '5', reason: 'Developing power, works counts' },
  { position: 7, playerId: '8', reason: 'Consistent contact, good situational hitting' },
  { position: 8, playerId: '7', reason: 'Speed on the bases, can advance runners' },
  { position: 9, playerId: '9', reason: 'Strong defense at catcher, improving bat' },
]

export interface DefensiveInning {
  inning: number
  positions: {
    P: string
    C: string
    '1B': string
    '2B': string
    '3B': string
    SS: string
    LF: string
    CF: string
    RF: string
  }
  reasoning: string
}

export const MOCK_DEFENSIVE_INNINGS: DefensiveInning[] = [
  {
    inning: 1,
    positions: { P: 'Cole', C: 'Ethan', '1B': 'Ryan', '2B': 'Sam', '3B': 'Tyler', SS: 'Jake', LF: 'Ben', CF: 'Noah', RF: 'Max' },
    reasoning: 'Starting Cole on the mound with his best velocity. Jake at SS for range, Ethan behind the plate for his strong arm.',
  },
  {
    inning: 2,
    positions: { P: 'Cole', C: 'Ethan', '1B': 'Ryan', '2B': 'Jake', '3B': 'Tyler', SS: 'Max', LF: 'Ben', CF: 'Noah', RF: 'Sam' },
    reasoning: 'Rotating Jake to 2B to keep his arm fresh. Max has great range at SS.',
  },
  {
    inning: 3,
    positions: { P: 'Tyler', C: 'Jake', '1B': 'Ryan', '2B': 'Sam', '3B': 'Cole', SS: 'Max', LF: 'Ben', CF: 'Noah', RF: 'Ethan' },
    reasoning: 'Tyler takes the mound for innings 3-4. Jake to catcher for his game management. Cole rests at 3B.',
  },
]

// Grid data for the interactive lineup grid example
export interface GridCell {
  playerId: string
  position: string
  locked: boolean
}

export type LineupGrid = Record<string, GridCell[]>

export const MOCK_LINEUP_GRID: LineupGrid = {
  '1': [ // Jake
    { playerId: '1', position: 'P', locked: true },
    { playerId: '1', position: 'C', locked: false },
    { playerId: '1', position: 'SS', locked: false },
    { playerId: '1', position: 'LF', locked: false },
    { playerId: '1', position: 'P', locked: true },
  ],
  '2': [ // Cole
    { playerId: '2', position: 'C', locked: false },
    { playerId: '2', position: 'P', locked: true },
    { playerId: '2', position: '1B', locked: false },
    { playerId: '2', position: 'SS', locked: false },
    { playerId: '2', position: 'C', locked: false },
  ],
  '3': [ // Ryan
    { playerId: '3', position: '1B', locked: false },
    { playerId: '3', position: 'SS', locked: false },
    { playerId: '3', position: 'C', locked: true },
    { playerId: '3', position: '1B', locked: false },
    { playerId: '3', position: 'SS', locked: false },
  ],
  '4': [ // Sam
    { playerId: '4', position: '2B', locked: false },
    { playerId: '4', position: '2B', locked: false },
    { playerId: '4', position: '2B', locked: false },
    { playerId: '4', position: 'P', locked: true },
    { playerId: '4', position: 'SIT', locked: false },
  ],
  '5': [ // Tyler
    { playerId: '5', position: '3B', locked: false },
    { playerId: '5', position: '3B', locked: false },
    { playerId: '5', position: '3B', locked: false },
    { playerId: '5', position: '3B', locked: false },
    { playerId: '5', position: '2B', locked: false },
  ],
  '6': [ // Max
    { playerId: '6', position: 'SS', locked: false },
    { playerId: '6', position: '1B', locked: false },
    { playerId: '6', position: '1B', locked: false },
    { playerId: '6', position: 'CF', locked: false },
    { playerId: '6', position: '3B', locked: false },
  ],
  '7': [ // Ben
    { playerId: '7', position: 'LF', locked: false },
    { playerId: '7', position: 'LF', locked: false },
    { playerId: '7', position: 'LF', locked: false },
    { playerId: '7', position: 'LF', locked: false },
    { playerId: '7', position: 'LF', locked: false },
  ],
  '8': [ // Noah
    { playerId: '8', position: 'CF', locked: false },
    { playerId: '8', position: 'CF', locked: false },
    { playerId: '8', position: 'CF', locked: false },
    { playerId: '8', position: 'RF', locked: false },
    { playerId: '8', position: 'CF', locked: false },
  ],
  '9': [ // Ethan
    { playerId: '9', position: 'RF', locked: false },
    { playerId: '9', position: 'RF', locked: false },
    { playerId: '9', position: 'RF', locked: false },
    { playerId: '9', position: '2B', locked: false },
    { playerId: '9', position: 'RF', locked: false },
  ],
}

export interface PlayerAnalysis {
  playerId: string
  strengths: Array<{
    title: string
    description: string
  }>
  weaknesses: Array<{
    title: string
    description: string
  }>
  recommendations: {
    batting: string
    defense: string[]
  }
}

export const MOCK_PLAYER_ANALYSIS: PlayerAnalysis = {
  playerId: '1',
  strengths: [
    {
      title: 'Elite Plate Discipline',
      description: 'Walks 12% of PAs with only 15% strikeout rate',
    },
    {
      title: 'Speed Threat',
      description: '8 stolen bases, only 1 CS - 89% success rate',
    },
  ],
  weaknesses: [
    {
      title: 'Power Development',
      description: 'Only 2 extra-base hits - focus on driving the ball',
    },
  ],
  recommendations: {
    batting: 'Leadoff',
    defense: ['SS', '2B'],
  },
}

export interface TeamAnalysis {
  summary: string
  strengths: Array<{
    title: string
    stat: string
  }>
  weaknesses: Array<{
    title: string
    stat: string
  }>
  practiceRecommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    title: string
    drills: string
  }>
}

export const MOCK_TEAM_ANALYSIS: TeamAnalysis = {
  summary: 'Your team excels at getting on base with a .385 team OBP. Defense is solid up the middle with great range at SS and 2B.',
  strengths: [
    { title: 'Plate Discipline', stat: '.385 team OBP' },
    { title: 'Middle Defense', stat: '.978 FPCT at SS/2B' },
  ],
  weaknesses: [
    { title: 'Situational Hitting', stat: 'Only 45% RISP average' },
    { title: 'Outfield Range', stat: 'Limited coverage in CF' },
  ],
  practiceRecommendations: [
    {
      priority: 'high',
      title: 'Two-Strike Hitting',
      drills: 'Choke-up swings, opposite field work',
    },
    {
      priority: 'medium',
      title: 'Outfield Communication',
      drills: 'Gap coverage, priority calls',
    },
  ],
}
