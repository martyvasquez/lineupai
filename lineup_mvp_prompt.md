# Lineup AI - MVP Prompt

## System Prompt

```
You are a youth baseball lineup optimizer. Generate batting orders and defensive assignments that strictly comply with team rules while maximizing performance.

INPUTS YOU WILL RECEIVE:
- Available players with eligibility flags
- GameChanger statistics (if available)
- Coach subjective ratings (1-5 scale)
- Supplemental metrics (sprint times, etc.)
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
Return valid JSON only. No markdown, no explanation outside the JSON structure.
```

---

## User Prompt

```
GAME SETUP:
- Innings: {{innings}}
- Players Available: {{player_count}}
- Mode: {{mode}} // "competitive" | "developmental" | "balanced"

PLAYERS:
{{#each players}}
---
Name: {{name}}
ID: {{id}}
Jersey: #{{jersey}}
Available: {{available}}
Pitching Innings Available: {{pitching_innings}}

Eligibility:
  Can Pitch: {{can_pitch}}
  Can Catch: {{can_catch}}
  Can Play SS: {{can_play_ss}}
  Can Play 1B: {{can_play_1b}}
  Restrictions: {{restrictions}}

Subjective Ratings (1-5):
  Batting: {{ratings.batting}}
  Infield: {{ratings.infield}}
  Outfield: {{ratings.outfield}}
  Pitching: {{ratings.pitching}}
  Catching: {{ratings.catching}}

{{#if stats}}
GameChanger Stats:
  PA: {{stats.pa}}, AVG: {{stats.avg}}, OBP: {{stats.obp}}, SLG: {{stats.slg}}
  K%: {{stats.k_rate}}, BB%: {{stats.bb_rate}}, SB: {{stats.sb}}
  FPCT: {{stats.fpct}}, Errors: {{stats.errors}}, TC: {{stats.tc}}
  Innings by Position: {{stats.innings_by_position}}
{{/if}}

{{#if metrics}}
Supplemental:
  {{#each metrics}}{{key}}: {{value}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}

TEAM RULES (MANDATORY):
{{#each rules}}
{{@index_1}}. {{text}}
{{/each}}

GAME PREFERENCES (OPTIMIZE FOR):
{{#each preferences}}
- {{text}}
{{/each}}

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
}
```

---

## Mid-Game Adjustment Prompt

```
ADJUSTMENT NEEDED:
Trigger: {{trigger}}
// Examples: "Jack injured", "Tip hit pitch count", "Up by 12 - switch to developmental"

CURRENT STATE:
- Current Inning: {{current_inning}}
- Score: Us {{our_score}} - Them {{their_score}}
- Innings Remaining: {{remaining_innings}}

COMPLETED INNINGS:
{{#each completed}}
Inning {{inning}}: P={{P}}, C={{C}}, 1B={{1B}}, 2B={{2B}}, 3B={{3B}}, SS={{SS}}, LF={{LF}}, CF={{CF}}, RF={{RF}} | Sat: {{sat}}
{{/each}}

RULES STATUS:
{{#each rules_status}}
- "{{rule}}": {{#if satisfied}}✓ Satisfied{{else}}⚠ Still needed: {{remaining}}{{/if}}
{{/each}}

AVAILABLE PLAYERS (remaining):
{{#each available_players}}
- {{name}} ({{id}}): {{status}}
{{/each}}

Re-optimize remaining innings only. Satisfy all outstanding rules. Return same JSON format but only for innings {{start_inning}} through {{end_inning}}.
```

---

## Example: Full Prompt with Real Data

```
GAME SETUP:
- Innings: 6
- Players Available: 11
- Mode: competitive

PLAYERS:
---
Name: James
ID: p_22
Jersey: #22
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: true
  Can Play SS: true
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 5
  Infield: 5
  Outfield: 5
  Pitching: 5
  Catching: 5

GameChanger Stats:
  PA: 52, AVG: .700, OBP: .769, SLG: 1.125
  K%: .231, BB%: .231, SB: 12
  FPCT: .947, Errors: 3, TC: 57
  Innings by Position: P:19.1, C:32.0, SS:16.2, 3B:13.2, CF:10.1

---
Name: Jack
ID: p_5
Jersey: #5
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: true
  Can Play SS: false
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 4
  Infield: 3
  Outfield: 4
  Pitching: 3
  Catching: 4

GameChanger Stats:
  PA: 48, AVG: .641, OBP: .708, SLG: .923
  K%: .292, BB%: .125, SB: 14
  FPCT: .875, Errors: 15, TC: 120
  Innings by Position: C:53.0, 1B:26.1, P:14.0, LF:6.2, CF:7.1, RF:7.0

---
Name: Matthew
ID: p_23
Jersey: #23
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: true
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 3
  Infield: 5
  Outfield: 3
  Pitching: 4
  Catching: 1

GameChanger Stats:
  PA: 41, AVG: .613, OBP: .707, SLG: .645
  K%: .293, BB%: .244, SB: 12
  FPCT: .898, Errors: 6, TC: 59
  Innings by Position: SS:47.2, CF:31.2, P:14.1, 1B:12.2, 2B:8.0

---
Name: Cam
ID: p_4
Jersey: #4
Available: true
Pitching Innings Available: 2

Eligibility:
  Can Pitch: false
  Can Catch: true
  Can Play SS: false
  Can Play 1B: false
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 3
  Infield: 3
  Outfield: 2
  Pitching: 3
  Catching: 4

GameChanger Stats:
  PA: 28, AVG: .632, OBP: .750, SLG: .684
  K%: .250, BB%: .250, SB: 6
  FPCT: .911, Errors: 5, TC: 56
  Innings by Position: 2B:47.2, C:18.1, RF:15.0, LF:11.2

---
Name: Jackson
ID: p_42
Jersey: #42
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: false
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 4
  Infield: 3
  Outfield: 3
  Pitching: 4
  Catching: 1

GameChanger Stats:
  PA: 52, AVG: .595, OBP: .712, SLG: .784
  K%: .288, BB%: .288, SB: 5
  FPCT: .868, Errors: 7, TC: 53
  Innings by Position: 1B:40.0, 3B:23.0, LF:17.1, P:13.1, RF:13.2

---
Name: Tip
ID: p_10
Jersey: #10
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: true
  Can Play 1B: false
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 3
  Infield: 5
  Outfield: 3
  Pitching: 5
  Catching: 1

GameChanger Stats:
  PA: 40, AVG: .394, OBP: .500, SLG: .424
  K%: .500, BB%: .125, SB: 12
  FPCT: .816, Errors: 14, TC: 76
  Innings by Position: SS:61.1, P:23.2, CF:16.1, 3B:8.0, 1B:6.0

---
Name: Lennox
ID: p_7
Jersey: #7
Available: true
Pitching Innings Available: 1

Eligibility:
  Can Pitch: false
  Can Catch: true
  Can Play SS: false
  Can Play 1B: false
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 2
  Infield: 2
  Outfield: 3
  Pitching: 2
  Catching: 2

GameChanger Stats:
  PA: 35, AVG: .429, OBP: .657, SLG: .429
  K%: .343, BB%: .400, SB: 7
  FPCT: .826, Errors: 8, TC: 46
  Innings by Position: 2B:51.0, RF:19.2, LF:17.1, C:15.1

---
Name: Max
ID: p_99
Jersey: #99
Available: true
Pitching Innings Available: 1

Eligibility:
  Can Pitch: false
  Can Catch: true
  Can Play SS: false
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 2
  Infield: 2
  Outfield: 3
  Pitching: 1
  Catching: 3

GameChanger Stats:
  PA: 21, AVG: .611, OBP: .667, SLG: .611
  K%: .333, BB%: .143, SB: 0
  FPCT: .851, Errors: 11, TC: 74
  Innings by Position: 1B:48.2, RF:26.2, LF:13.0, C:8.1

Supplemental:
  coach_note: "Most reliable at 1B per coach observation"

---
Name: Graham
ID: p_12
Jersey: #12
Available: true
Pitching Innings Available: 3

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: true
  Can Play 1B: true
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 3
  Infield: 4
  Outfield: 3
  Pitching: 4
  Catching: 1

GameChanger Stats:
  PA: 32, AVG: .417, OBP: .562, SLG: .500
  K%: .438, BB%: .250, SB: 5
  FPCT: .804, Errors: 9, TC: 46
  Innings by Position: 3B:47.2, CF:19.0, P:16.2, SS:8.0

---
Name: Mav
ID: p_9
Jersey: #9
Available: true
Pitching Innings Available: 2

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: false
  Can Play 1B: false
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 4
  Infield: 4
  Outfield: 4
  Pitching: 4
  Catching: 1

GameChanger Stats:
  PA: 24, AVG: .238, OBP: .333, SLG: .333
  K%: .667, BB%: .083, SB: 3
  FPCT: .840, Errors: 4, TC: 25
  Innings by Position: CF:26.2, 3B:16.2, LF:16.2, C:7.0

---
Name: Clint
ID: p_19
Jersey: #19
Available: true
Pitching Innings Available: 2

Eligibility:
  Can Pitch: true
  Can Catch: false
  Can Play SS: false
  Can Play 1B: false
  Restrictions: none

Subjective Ratings (1-5):
  Batting: 3
  Infield: 2
  Outfield: 2
  Pitching: 3
  Catching: 1

GameChanger Stats:
  PA: 37, AVG: .308, OBP: .514, SLG: .308
  K%: .486, BB%: .297, SB: 6
  FPCT: .625, Errors: 9, TC: 24
  Innings by Position: RF:33.1, LF:31.2, 3B:23.1, P:10.0

TEAM RULES (MANDATORY):
1. Every player must play at least one infield position (P, C, 1B, 2B, 3B, SS) by the end of the 4th inning
2. No player may sit for a second time until every player has sat at least once
3. Continuous batting order - all 11 players bat in order
4. No player may pitch more than 3 innings per game
5. Only players flagged as eligible may play P, C, SS, or 1B

GAME PREFERENCES (OPTIMIZE FOR):
- James catches final 2 innings (closing defense)
- Matthew at SS over Tip in final inning (better FPCT)
- Max at 1B when possible (coach says most reliable there)
- Clint and Graham should sit in 6th inning (defensive liabilities)
- Competitive mode: stack best defenders for innings 5-6

Generate the lineup now. Return JSON only.
```

---

## TypeScript Types (for app integration)

```typescript
// Input types
interface Player {
  id: string;
  name: string;
  jersey: number;
  available: boolean;
  pitching_innings_available: number;
  eligibility: {
    can_pitch: boolean;
    can_catch: boolean;
    can_play_ss: boolean;
    can_play_1b: boolean;
    restrictions: string | null;
  };
  ratings: {
    batting: number;
    infield: number;
    outfield: number;
    pitching: number;
    catching: number;
  };
  stats?: {
    pa: number;
    avg: number;
    obp: number;
    slg: number;
    k_rate: number;
    bb_rate: number;
    sb: number;
    fpct: number;
    errors: number;
    tc: number;
    innings_by_position: Record<string, number>;
  };
  metrics?: Record<string, string | number>;
}

interface TeamRule {
  id: string;
  text: string;
  active: boolean;
}

interface GamePreference {
  id: string;
  text: string;
}

interface LineupRequest {
  innings: number;
  mode: 'competitive' | 'developmental' | 'balanced';
  players: Player[];
  rules: TeamRule[];
  preferences: GamePreference[];
}

// Output types
interface BattingOrderEntry {
  order: number;
  player_id: string;
  name: string;
  reasoning: string;
}

interface DefensiveInning {
  inning: number;
  P: { id: string; name: string };
  C: { id: string; name: string };
  '1B': { id: string; name: string };
  '2B': { id: string; name: string };
  '3B': { id: string; name: string };
  SS: { id: string; name: string };
  LF: { id: string; name: string };
  CF: { id: string; name: string };
  RF: { id: string; name: string };
  sit: Array<{ id: string; name: string }>;
  reasoning: string;
}

interface RuleCheck {
  rule: string;
  satisfied: boolean;
  details: string;
}

interface LineupResponse {
  batting_order: BattingOrderEntry[];
  defense: DefensiveInning[];
  rules_check: RuleCheck[];
  warnings: string[];
  summary: string;
}
```

---

## Supabase Edge Function (Production Ready)

```typescript
// supabase/functions/generate-lineup/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a youth baseball lineup optimizer. Generate batting orders and defensive assignments that strictly comply with team rules while maximizing performance.

INPUTS YOU WILL RECEIVE:
- Available players with eligibility flags
- GameChanger statistics (if available)
- Coach subjective ratings (1-5 scale)
- Supplemental metrics (sprint times, etc.)
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
Return valid JSON only. No markdown, no explanation outside the JSON structure.`;

serve(async (req) => {
  try {
    const { game_id, mode } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch game
    const { data: game } = await supabase
      .from("games")
      .select("*, teams(*)")
      .eq("id", game_id)
      .single();

    // Fetch available players with all related data
    const { data: roster } = await supabase
      .from("game_roster")
      .select(`
        *,
        players (
          *,
          player_ratings (*),
          position_eligibility (*),
          player_metrics (*)
        )
      `)
      .eq("game_id", game_id)
      .eq("available", true);

    // Fetch stats
    const playerIds = roster.map((r) => r.player_id);

    const { data: battingStats } = await supabase
      .from("gamechanger_batting_season")
      .select("*")
      .in("player_id", playerIds);

    const { data: fieldingStats } = await supabase
      .from("gamechanger_fielding_season")
      .select("*")
      .in("player_id", playerIds);

    // Fetch team rules
    const { data: rules } = await supabase
      .from("team_rules")
      .select("*")
      .eq("team_id", game.team_id)
      .eq("active", true);

    // Fetch game preferences
    const { data: preferences } = await supabase
      .from("game_preferences")
      .select("*")
      .eq("game_id", game_id);

    // Build prompt
    const prompt = buildPrompt({
      innings: game.innings || 6,
      mode,
      roster,
      battingStats,
      fieldingStats,
      rules,
      preferences,
    });

    // Call Claude
    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const lineup = JSON.parse(content.text);

    // Save to database
    const { data: saved } = await supabase
      .from("lineups")
      .insert({
        game_id,
        version: 1,
        batting_order: lineup.batting_order,
        defensive_grid: lineup.defense,
        rules_check: lineup.rules_check,
        optimization_mode: mode,
        ai_reasoning: lineup.summary,
        warnings: lineup.warnings,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ success: true, lineup: saved }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt({ innings, mode, roster, battingStats, fieldingStats, rules, preferences }) {
  const statsMap = new Map();
  battingStats?.forEach((s) => statsMap.set(s.player_id, { ...statsMap.get(s.player_id), batting: s }));
  fieldingStats?.forEach((s) => statsMap.set(s.player_id, { ...statsMap.get(s.player_id), fielding: s }));

  const playersText = roster
    .map((r) => {
      const p = r.players;
      const ratings = p.player_ratings?.[0] || {};
      const elig = p.position_eligibility?.[0] || {};
      const stats = statsMap.get(p.id);
      const metrics = p.player_metrics || [];

      let text = `---
Name: ${p.name}
ID: ${p.id}
Jersey: #${p.jersey_number}
Available: true
Pitching Innings Available: ${r.pitching_innings_available || 0}

Eligibility:
  Can Pitch: ${elig.can_pitch || false}
  Can Catch: ${elig.can_catch || false}
  Can Play SS: ${elig.can_play_ss || false}
  Can Play 1B: ${elig.can_play_1b || false}
  Restrictions: ${r.restrictions || "none"}

Subjective Ratings (1-5):
  Batting: ${ratings.batting || 3}
  Infield: ${ratings.infield || 3}
  Outfield: ${ratings.outfield || 3}
  Pitching: ${ratings.pitching || 3}
  Catching: ${ratings.catching || 3}`;

      if (stats?.batting) {
        const b = stats.batting;
        const f = stats.fielding || {};
        text += `

GameChanger Stats:
  PA: ${b.pa}, AVG: ${b.avg}, OBP: ${b.obp}, SLG: ${b.slg}
  K%: ${b.k_rate}, BB%: ${b.bb_rate}, SB: ${b.sb}
  FPCT: ${f.fpct || "N/A"}, Errors: ${f.errors || 0}, TC: ${f.tc || 0}
  Innings by Position: ${f.innings_by_position || "N/A"}`;
      }

      if (metrics.length > 0) {
        text += `

Supplemental:
  ${metrics.map((m) => `${m.metric_type}: ${m.value}`).join(", ")}`;
      }

      return text;
    })
    .join("\n");

  const rulesText = rules.map((r, i) => `${i + 1}. ${r.rule_text}`).join("\n");
  const prefsText = preferences.map((p) => `- ${p.preference_text}`).join("\n");

  return `GAME SETUP:
- Innings: ${innings}
- Players Available: ${roster.length}
- Mode: ${mode}

PLAYERS:
${playersText}

TEAM RULES (MANDATORY):
${rulesText}

GAME PREFERENCES (OPTIMIZE FOR):
${prefsText}

Generate the lineup now. Return JSON only.`;
}
```
