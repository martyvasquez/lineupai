# LineupAI - MVP Build Plan

## Overview

A mobile-first web app that generates optimized youth baseball/softball lineups using AI. Coaches input rosters, subjective ratings, and team-specific rules. The system combines this with GameChanger statistics to generate batting orders and defensive assignments that comply with league rules while maximizing team performance.

---

## Problem Statement

Youth baseball coaches spend significant time before and during games manually creating lineups that must satisfy complex, often league-specific rules (e.g., "every player must play infield by the 4th inning", "no one sits twice until everyone sits once"). Mistakes lead to forfeits, parent complaints, or suboptimal play. Current tools don't account for both statistical performance AND rule compliance.

---

## Core Value Proposition

1. **Rule Compliance** — Never violate league rules; app tracks constraints automatically
2. **Data-Driven** — Integrates GameChanger stats with coach observations
3. **Mid-Game Adjustments** — Re-optimize on the fly when injuries or pitch counts change the plan
4. **Flexible Rules** — Each team defines their own rules in plain language; AI interprets them

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 (App Router) | SSR, great mobile experience, Vercel integration |
| Hosting | Vercel | Zero-config deploys, edge functions |
| Database | Supabase (Postgres) | Auth, real-time, edge functions, generous free tier |
| Auth | Supabase Auth | Email/password for MVP; Google OAuth later |
| AI | Claude API (Anthropic) | Best reasoning for constraint satisfaction |
| Styling | Tailwind CSS | Rapid UI development |
| UI Components | shadcn/ui | Accessible, customizable, no lock-in |

---

## Data Model

### Entity Relationship

```
teams
  └── players
  │     └── player_ratings (subjective, per season)
  │     └── position_eligibility (flags)
  │     └── player_metrics (supplemental data)
  │     └── gamechanger_batting (per game, aggregated to season)
  │     └── gamechanger_fielding (per game, aggregated to season)
  │
  └── team_rules (league/team constraints)
  │
  └── games
        └── game_roster (who's available, restrictions)
        └── game_preferences (soft optimization hints)
        └── lineups (AI-generated, versioned)
        └── game_state (mid-game tracking)
```

### SQL Schema

```sql
-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  league_name TEXT,
  age_group TEXT, -- "12U", "10U", etc.
  innings_per_game INT DEFAULT 6,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  jersey_number INT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjective Ratings (coach input, 1-5 scale)
CREATE TABLE player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season TEXT, -- "Spring 2025"
  batting INT CHECK (batting BETWEEN 1 AND 5),
  infield INT CHECK (infield BETWEEN 1 AND 5),
  outfield INT CHECK (outfield BETWEEN 1 AND 5),
  pitching INT CHECK (pitching BETWEEN 1 AND 5),
  catching INT CHECK (catching BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season)
);

-- Position Eligibility (binary flags)
CREATE TABLE position_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  can_pitch BOOLEAN DEFAULT false,
  can_catch BOOLEAN DEFAULT false,
  can_play_ss BOOLEAN DEFAULT false,
  can_play_1b BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id)
);

-- Supplemental Metrics (sprint times, pop times, etc.)
CREATE TABLE player_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- "60yd_sprint", "pop_time", "coach_note"
  value TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- GameChanger Batting Stats (per game)
CREATE TABLE gamechanger_batting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_date DATE,
  pa INT DEFAULT 0,
  ab INT DEFAULT 0,
  h INT DEFAULT 0,
  singles INT DEFAULT 0,
  doubles INT DEFAULT 0,
  triples INT DEFAULT 0,
  hr INT DEFAULT 0,
  rbi INT DEFAULT 0,
  r INT DEFAULT 0,
  bb INT DEFAULT 0,
  so INT DEFAULT 0,
  hbp INT DEFAULT 0,
  sb INT DEFAULT 0,
  cs INT DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- GameChanger Fielding Stats (per game)
CREATE TABLE gamechanger_fielding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_date DATE,
  tc INT DEFAULT 0, -- total chances
  po INT DEFAULT 0, -- putouts
  a INT DEFAULT 0,  -- assists
  e INT DEFAULT 0,  -- errors
  dp INT DEFAULT 0, -- double plays
  innings_by_position JSONB, -- {"P": 2.1, "C": 3.0, "SS": 0, ...}
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Season Aggregated Stats (view or materialized view)
CREATE VIEW gamechanger_batting_season AS
SELECT 
  player_id,
  SUM(pa) as pa,
  SUM(ab) as ab,
  SUM(h) as h,
  ROUND(SUM(h)::NUMERIC / NULLIF(SUM(ab), 0), 3) as avg,
  ROUND((SUM(h) + SUM(bb) + SUM(hbp))::NUMERIC / NULLIF(SUM(pa), 0), 3) as obp,
  ROUND((SUM(singles) + 2*SUM(doubles) + 3*SUM(triples) + 4*SUM(hr))::NUMERIC / NULLIF(SUM(ab), 0), 3) as slg,
  ROUND(SUM(so)::NUMERIC / NULLIF(SUM(pa), 0), 3) as k_rate,
  ROUND(SUM(bb)::NUMERIC / NULLIF(SUM(pa), 0), 3) as bb_rate,
  SUM(sb) as sb,
  SUM(cs) as cs
FROM gamechanger_batting
GROUP BY player_id;

CREATE VIEW gamechanger_fielding_season AS
SELECT 
  player_id,
  SUM(tc) as tc,
  SUM(po) as po,
  SUM(a) as a,
  SUM(e) as e,
  SUM(dp) as dp,
  ROUND((SUM(po) + SUM(a))::NUMERIC / NULLIF(SUM(tc), 0), 3) as fpct
FROM gamechanger_fielding
GROUP BY player_id;

-- Team Rules (open-ended, per team)
CREATE TABLE team_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  priority INT DEFAULT 0, -- higher = more important
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent TEXT,
  game_date DATE NOT NULL,
  game_time TIME,
  location TEXT,
  innings INT DEFAULT 6,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed
  our_score INT,
  their_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Day Roster (availability per game)
CREATE TABLE game_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  pitching_innings_available INT DEFAULT 0,
  restrictions TEXT, -- "sore arm", "leaving early", etc.
  UNIQUE(game_id, player_id)
);

-- Game Preferences (soft hints for this game only)
CREATE TABLE game_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  preference_text TEXT NOT NULL,
  priority INT DEFAULT 0
);

-- Generated Lineups
CREATE TABLE lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  batting_order JSONB NOT NULL,
  defensive_grid JSONB NOT NULL,
  rules_check JSONB,
  warnings JSONB,
  optimization_mode TEXT, -- competitive, developmental, balanced
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mid-Game State
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  lineup_id UUID REFERENCES lineups(id),
  current_inning INT DEFAULT 1,
  is_top_of_inning BOOLEAN DEFAULT true,
  our_score INT DEFAULT 0,
  their_score INT DEFAULT 0,
  adjustments JSONB, -- log of changes
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id)
);

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ... (add policies based on created_by / team membership)
```

---

## MVP Features

### P0 - Must Have

| Feature | Description |
|---------|-------------|
| Team Setup | Create team, set innings per game |
| Roster Management | Add/edit/remove players |
| Subjective Ratings | Input 1-5 ratings for each player |
| Position Eligibility | Toggle flags for P, C, SS, 1B |
| Team Rules | Add/edit/delete rules in plain language |
| Game Creation | Create upcoming games |
| Game Roster | Mark players available/unavailable, set pitching limits |
| Lineup Generation | AI generates batting order + defensive grid |
| Lineup Review | View lineup, see rule compliance, read AI reasoning |
| Manual Override | Drag-drop to swap positions, re-validate |

### P1 - Should Have

| Feature | Description |
|---------|-------------|
| GameChanger Import | Upload CSV export, parse and store stats |
| Game Preferences | Add soft preferences per game |
| Mid-Game Adjustment | Trigger re-optimization for remaining innings |
| Lineup History | View past lineups, compare versions |

### P2 - Nice to Have (Post-MVP)

| Feature | Description |
|---------|-------------|
| Screenshot OCR | Upload GameChanger screenshots, extract stats via Claude Vision |
| Offline Mode | PWA with cached lineup, sync when online |
| Season Analytics | Player trends, subjective vs actual comparisons |
| Multi-Team | Coach manages multiple teams |
| Team Sharing | Assistant coaches can view/edit |

---

## User Flows

### 1. Onboarding (First Time)

```
Sign Up → Create Team → Add Players → Set Eligibility → Input Ratings → Add Rules → Done
```

### 2. Pre-Game Setup

```
Select Game → Mark Attendance → Set Pitching Limits → Add Preferences (optional) → Generate Lineup → Review/Adjust → Save
```

### 3. GameChanger Import

```
Export CSV from GameChanger → Upload to App → Map Players (auto-match by name/jersey) → Confirm → Stats Merged
```

### 4. Mid-Game Adjustment

```
Open Active Game → Tap "Adjustment Needed" → Select Reason (injury, pitch count, blowout) → AI Re-Optimizes → Review → Accept
```

---

## Screen List (MVP)

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/login` | Email/password auth |
| Dashboard | `/` | Team overview, next game, quick actions |
| Roster | `/roster` | Player list with ratings summary |
| Player Detail | `/roster/[id]` | Edit player, ratings, eligibility, view stats |
| Rules | `/rules` | List/add/edit team rules |
| Games | `/games` | Upcoming and past games |
| Game Setup | `/games/[id]/setup` | Attendance, pitching limits, preferences |
| Lineup | `/games/[id]/lineup` | Generated lineup, rule compliance, override |
| Import | `/import` | Upload GameChanger CSV |
| Settings | `/settings` | Team settings, account |

---

## AI Integration

### Endpoint

```
POST /api/generate-lineup
```

### Request

```json
{
  "game_id": "uuid",
  "mode": "competitive" | "developmental" | "balanced"
}
```

### Process

1. Fetch game, roster, stats, rules, preferences from Supabase
2. Build prompt (see attached `lineup_mvp_prompt.md`)
3. Call Claude API (`claude-sonnet-4-20250514`)
4. Parse JSON response
5. Validate rule compliance
6. Save lineup to database
7. Return to client

### Response

```json
{
  "success": true,
  "lineup": {
    "id": "uuid",
    "batting_order": [...],
    "defensive_grid": [...],
    "rules_check": [...],
    "warnings": [...],
    "summary": "string"
  }
}
```

### Mid-Game Adjustment Endpoint

```
POST /api/adjust-lineup
```

```json
{
  "game_id": "uuid",
  "trigger": "Jack injured, cannot continue",
  "current_inning": 3
}
```

---

## API Endpoints (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/teams` | List user's teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/[id]/players` | List players |
| POST | `/api/teams/[id]/players` | Add player |
| PUT | `/api/players/[id]` | Update player |
| PUT | `/api/players/[id]/ratings` | Update ratings |
| PUT | `/api/players/[id]/eligibility` | Update eligibility |
| GET | `/api/teams/[id]/rules` | List rules |
| POST | `/api/teams/[id]/rules` | Add rule |
| PUT | `/api/rules/[id]` | Update rule |
| DELETE | `/api/rules/[id]` | Delete rule |
| GET | `/api/teams/[id]/games` | List games |
| POST | `/api/teams/[id]/games` | Create game |
| GET | `/api/games/[id]` | Get game details |
| PUT | `/api/games/[id]/roster` | Update game roster |
| POST | `/api/games/[id]/preferences` | Add preference |
| POST | `/api/generate-lineup` | Generate lineup (AI) |
| POST | `/api/adjust-lineup` | Mid-game adjustment (AI) |
| GET | `/api/games/[id]/lineup` | Get current lineup |
| PUT | `/api/lineups/[id]` | Manual lineup edit |
| POST | `/api/import/gamechanger` | Upload CSV |

---

## GameChanger CSV Import

### Expected Format

GameChanger exports batting and fielding as separate CSVs. Key columns:

**Batting:**
```
Player, #, PA, AB, H, 1B, 2B, 3B, HR, RBI, R, BB, SO, HBP, SB, CS
```

**Fielding:**
```
Player, #, TC, PO, A, E, DP, FPCT
```

### Import Flow

1. User uploads CSV
2. Backend parses, extracts player names and jersey numbers
3. Auto-match to existing roster (by jersey number, then fuzzy name match)
4. Show mapping UI for unmatched players
5. User confirms
6. Stats inserted into `gamechanger_batting` / `gamechanger_fielding`
7. Season aggregates auto-update via views

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard
│   │   ├── roster/
│   │   │   ├── page.tsx          # Player list
│   │   │   └── [id]/page.tsx     # Player detail
│   │   ├── rules/page.tsx        # Team rules
│   │   ├── games/
│   │   │   ├── page.tsx          # Game list
│   │   │   └── [id]/
│   │   │       ├── setup/page.tsx
│   │   │       └── lineup/page.tsx
│   │   ├── import/page.tsx       # GameChanger import
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── generate-lineup/route.ts
│   │   ├── adjust-lineup/route.ts
│   │   └── import/gamechanger/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn components
│   ├── roster/
│   ├── lineup/
│   └── games/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── prompts.ts
│   │   └── generate-lineup.ts
│   └── utils/
├── supabase/
│   ├── migrations/
│   └── functions/                # Edge functions (optional)
└── public/
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Initialize Next.js project with Tailwind, shadcn/ui
- [ ] Set up Supabase project, run migrations
- [ ] Implement auth (signup, login, logout)
- [ ] Build team creation flow
- [ ] Build roster CRUD (add, edit, delete players)
- [ ] Build ratings and eligibility forms

### Phase 2: Rules & Games (Week 3)

- [ ] Build rules management UI
- [ ] Build game creation flow
- [ ] Build game roster (availability) UI
- [ ] Build game preferences UI

### Phase 3: AI Integration (Week 4)

- [ ] Implement prompt builder function
- [ ] Integrate Claude API
- [ ] Build lineup generation endpoint
- [ ] Build lineup display UI (batting order, defensive grid)
- [ ] Build rule compliance display
- [ ] Build manual override (drag-drop)

### Phase 4: Import & Polish (Week 5)

- [ ] Build GameChanger CSV parser
- [ ] Build import UI with player matching
- [ ] Implement mid-game adjustment endpoint
- [ ] Build mid-game adjustment UI
- [ ] Testing and bug fixes
- [ ] Mobile responsiveness pass

### Phase 5: Launch Prep (Week 6)

- [ ] Error handling and edge cases
- [ ] Loading states and optimistic updates
- [ ] Analytics setup (optional)
- [ ] Documentation
- [ ] Deploy to production

---

## Open Questions / Decisions Needed

| Question | Options | Recommendation |
|----------|---------|----------------|
| Auth flow | Email only vs Google OAuth | Start with email, add OAuth later |
| Real-time updates | Polling vs Supabase real-time | Polling for MVP, simpler |
| Lineup editing | Drag-drop vs form-based | Drag-drop (better UX) |
| AI model | Sonnet vs Haiku | Sonnet for accuracy; Haiku for mid-game speed |
| Offline support | PWA vs none | None for MVP, add later |
| Multi-team | Support now vs later | Single team for MVP |

---

## Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| Vercel (Pro) | $20 |
| Supabase (Free → Pro) | $0-25 |
| Claude API | $10-30 (depends on usage) |
| Domain | ~$1 |
| **Total** | **$30-75/month** |

---

## Success Metrics (MVP)

1. Coach can create a team and roster in < 5 minutes
2. Lineup generation completes in < 10 seconds
3. Generated lineups satisfy all team rules 100% of the time
4. Mid-game adjustment completes in < 5 seconds
5. Zero rule violations reported by users

---

## Appendix

### Attached Files

1. `lineup_mvp_prompt.md` — Full AI prompt specification with examples
2. `data_driven_lineup.xlsx` — Example output showing batting order and defensive grid

### Reference Links

- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Claude API](https://docs.anthropic.com/claude/reference/messages_post)
- [GameChanger](https://www.gc.com/) — Source of stats

---

## Contact

Questions? Reach out to [your contact info here].
