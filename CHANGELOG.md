# Changelog

All notable changes to LineupAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.96.1] - 2026-01-21

### Fixed

#### Player Ratings Not Saving Bug
- **Root cause:** When loading player ratings, the code was taking the first rating record (`player_ratings?.[0]`) without checking the season. If a player had multiple rating records from different seasons, old data was displayed instead of current season's data.
- **Solution:**
  - Updated `player-dialog.tsx` to find current season's rating first: `player.player_ratings?.find(r => r.season === currentSeason) || player.player_ratings?.[0]`
  - Updated `roster-client.tsx` `getRatingsCount()` function with same fix
- **Result:** Ratings now save and load correctly, persisting across page refreshes

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/roster/_components/player-dialog.tsx` | Find current season's rating before falling back to first record |
| `app/dashboard/roster/_components/roster-client.tsx` | Same fix applied to `getRatingsCount()` function |

---

## [0.96.0] - 2026-01-21

### Added

#### Player Stats Page with AI Analysis (Major Feature)
- **Renamed "Import" to "Stats"** - Navigation now links to `/dashboard/stats`
- **Player Stats List** - All players displayed with expandable cards showing:
  - Batting stats: AVG, OBP, SLG, OPS, H, RBI, BB, SO, SB, GP, PA, 2B
  - Fielding stats: FPCT, TC, PO, A, E, DP
- **AI-Powered Analysis** - Claude analyzes each player's stats to identify:
  - 2-4 Strengths with supporting statistics
  - 1-3 Areas for improvement with supporting statistics
  - Summary of player capabilities
  - Recommended batting position
  - Recommended defensive positions
- **Generate Analysis Button** - One-click analysis for all players with stats
- **Auto-Analysis After Import** - Analysis generates automatically after CSV upload
- **Collapsible Import Section** - CSV upload moved to collapsible card at bottom
- **Migration** `20260121000004_add_stats_analysis.sql`:
  - Adds `stats_analysis JSONB` column to `players` table
  - Adds `stats_analyzed_at TIMESTAMPTZ` column

#### API Endpoint for Stats Analysis
- **`POST /api/stats/analyze`** - Generates AI analysis for players with imported stats
  - Fetches player ratings, batting stats, and fielding stats
  - Builds prompt for Claude with all player data
  - Saves analysis to players table as JSONB
  - Returns analyzed count and analysis results

### Changed

#### Lineup Grid UX Improvements
- **Drag-and-drop batting order** - Coaches can reorder batting lineup by dragging players
- **Collapsible sections** - Game detail page sections collapse for iPad game-day use
- **Recommended vs Actual batting order** - AI recommended order preserved separately from actual lineup
- **Batting insights only in AI recommendation** - Insights removed from editable grid for cleaner display

### Files Added

| File | Description |
|------|-------------|
| `app/dashboard/stats/page.tsx` | Stats page server component |
| `app/dashboard/stats/_components/stats-client.tsx` | Stats page client with analysis display |
| `app/api/stats/analyze/route.ts` | AI analysis generation endpoint |
| `supabase/migrations/20260121000004_add_stats_analysis.sql` | Migration for analysis fields |

### Files Modified

| File | Changes |
|------|---------|
| `components/layout/header.tsx` | Changed "Import" to "Stats" in navigation |
| `lib/ai/claude-client.ts` | Added `generateStatsAnalysis()` method |
| `types/lineup.ts` | Added `PlayerStatsAnalysis`, `StatsAnalysisResponse` types |

---

## [0.95.0] - 2026-01-21

### Added

#### Two-Phase Lineup Generation (Major UX Improvement)
- **Phase 1: Batting Order** - Generate batting order first, save immediately to database
- **Phase 2: Defensive Positions** - Coach locks specific positions, AI fills remaining cells
- **Lineup Grid Component** (`app/dashboard/games/[gameId]/_components/lineup-grid.tsx`):
  - Interactive grid with players as rows (in batting order), innings as columns
  - Click any cell to open position dropdown (P, C, 1B, 2B, 3B, SS, LF, CF, RF, SIT)
  - Visual indicators for locked cells (lock icon, ring highlight)
  - Clear option to remove position from cell

#### Inning Locking Feature
- **Click inning header to lock/unlock entire inning**
- Locked innings prevent cell editing (cursor shows not-allowed)
- Visual indicators: lock icon in header, blue-tinted background for locked columns
- All cells in locked inning get locked status
- Legend shows "Click inning header to lock/unlock" hint

#### Position Auto-Swap
- **Automatic position swapping** when assigning a position already taken
- Dropdown shows taken positions in amber color with ↔ symbol
- Selecting a taken position removes it from the other player automatically
- Prevents duplicate position assignments in same inning

#### Always-Editable Defense Grid
- Grid remains editable after defensive generation (removed readOnly restriction)
- Coaches can make mid-game substitutions at any time
- Real-time updates to locked positions state

### Fixed

#### Position Dropdown Selection Bug
- **Root cause:** Event timing conflict between mousedown (click-outside detection) and click (selection)
- **Solution:**
  - Changed from `mousedown` to `click` event for outside-click detection
  - Added `setTimeout` for event listener attachment to ensure proper ordering
  - Added `onMouseDown` stopPropagation on buttons
  - Added `type="button"` to prevent form submission behavior
  - Wrapped `onClose()` in `setTimeout(() => onClose(), 0)` for state update completion

### Changed

#### Game Detail Client Rewrite
- New state management for two-phase generation:
  - `phase`: 'setup' | 'batting' | 'defense' | 'complete'
  - `battingOrder`: Generated batting order entries
  - `grid`: Two-dimensional GridCell array for defensive positions
  - `lockedPositions`: Array of coach-locked positions
  - `lockedInnings`: Set of locked inning numbers
- Separated API calls for batting order and defensive generation
- Added `handleLockInning` handler for inning-level locking

### Technical Details

```typescript
// New types for two-phase generation
interface LockedPosition {
  playerId: string
  inning: number
  position: Position | 'SIT'
}

interface GridCell {
  playerId: string
  inning: number
  position: Position | 'SIT' | null
  locked: boolean
}

// Inning locking handler
const handleLockInning = useCallback((inning: number, locked: boolean) => {
  setLockedInnings(prev => {
    const newSet = new Set(prev)
    if (locked) newSet.add(inning)
    else newSet.delete(inning)
    return newSet
  })
  // Lock/unlock all cells in that inning
  setGrid(prevGrid => prevGrid.map(playerRow =>
    playerRow.map(cell =>
      cell.inning === inning && cell.position
        ? { ...cell, locked }
        : cell
    )
  ))
}, [grid])
```

### Files Modified

| File | Changes |
|------|---------|
| `lineup-grid.tsx` | Position dropdown event fixes, inning locking, auto-swap UI |
| `game-detail-client.tsx` | Two-phase state management, lock handlers |
| `types/lineup.ts` | Added LockedPosition, GridCell, GenerationPhase types |
| `generate-lineup/route.ts` | Support for phased generation |
| `prompt-builder.ts` | Separate prompts for batting order and defensive |
| `claude-client.ts` | Added generateBattingOrder() and generateDefensive() methods |

---

## [0.90.0] - 2026-01-21

### Added

#### GameChanger CSV Import (Phase 5 Complete)
- **CSV Parser** (`lib/parsers/gamechanger-csv.ts`) - Complete GameChanger CSV parsing:
  - Parses multi-section CSV format (Batting, Pitching, Fielding headers)
  - Extracts batting stats: GP, PA, AB, AVG, OBP, SLG, OPS, H, 1B, 2B, 3B, HR, RBI, R, BB, SO, HBP, SB, CS
  - Extracts fielding stats: TC, A, PO, FPCT, E, DP
  - Extracts pitching stats: IP, ERA, WHIP, SO, BB, H, R, ER
  - Automatically skips "Totals" and "Glossary" rows
  - Handles edge cases: "-" values, "N/A", percentages, empty cells
- **Player Matching** - Matches CSV players to roster:
  - Primary: Match by jersey number
  - Fallback: Fuzzy match by name
  - Returns match status for each player
- **Import Page** (`app/dashboard/import/page.tsx`) - Server component that fetches team and player data
- **Import Client** (`app/dashboard/import/_components/import-client.tsx`):
  - Drag-and-drop file upload zone
  - Preview table showing parsed players with stats
  - Match status indicators (matched by #, matched by name, no match)
  - Import button to save matched player stats
  - Clear Stats button to remove all imported data
  - Last import date display
- **API Endpoints** (`app/api/import/gamechanger/route.ts`):
  - `POST` - Import stats: parses CSV, matches players, upserts to database
  - `DELETE` - Clear stats: removes all imported stats for team's players
  - Auth verification and team ownership checks
  - Uses season date for upsert behavior (re-import replaces existing)

### Technical Details

```typescript
// CSV Parser exports
interface ParsedPlayerStats {
  jersey_number: number
  last_name: string
  first_name: string
  batting: ParsedBattingStats    // 19 batting metrics
  fielding: ParsedFieldingStats  // 6 fielding metrics
  pitching: ParsedPitchingStats | null  // 8 pitching metrics (if IP > 0)
}

// Player matching
interface MatchResult {
  parsed: ParsedPlayerStats
  player_id: string | null
  player_name: string | null
  matched_by: 'jersey_number' | 'name' | null
}
```

### Files Added

| File | Description |
|------|-------------|
| `lib/parsers/gamechanger-csv.ts` | CSV parser with player matching |
| `app/dashboard/import/page.tsx` | Import page server component |
| `app/dashboard/import/_components/import-client.tsx` | Import UI client component |
| `app/api/import/gamechanger/route.ts` | Import/clear API endpoints |

---

## [0.85.0] - 2026-01-21

### Added

#### Rule Groups (Major Feature)
- **New `rule_groups` table** - User-defined rule groups replace hardcoded optimization modes
- **Rule Group Dialog** (`app/dashboard/rules/_components/rule-group-dialog.tsx`) - Create and edit rule groups with name and description
- **Group Tabs** - Rules page now displays tabs for each rule group, filtering rules by selected group
- **Rule Group Selector** - Game detail page uses dropdown to select rule group when generating lineups
- **Migration** `20260121000000_add_rule_groups.sql`:
  - Creates `rule_groups` table with RLS policies
  - Adds `rule_group_id` to `team_rules` table
  - Adds `rule_group_id` to `lineups` table

#### Position Strengths
- **Position Strength Editor** (`app/dashboard/roster/_components/position-strength-editor.tsx`) - Drag-and-drop interface for ordering positions by player strength
- **10 Positions Supported**: P, C, 1B, 2B, 3B, SS, LF, CF, RF, OF (generic outfield)
- **Visual Ranking** - Position #1 is marked as primary; AI prioritizes placing player there
- **Migration** `20260121000001_add_position_strengths.sql`:
  - Adds `position_strengths TEXT[]` column to `players` table

#### Coach Notes
- **Notes Text Area** - Free-form text field in Ratings tab for coach observations
- **Migration** `20260121000002_add_player_notes.sql`:
  - Adds `notes TEXT` column to `players` table

#### Outfield (OF) Position
- **Generic Outfield Option** - "OF" position gives AI flexibility to assign player to LF, CF, or RF as needed

### Changed

#### Rules System
- **Rules Client Rewrite** (`app/dashboard/rules/_components/rules-client.tsx`) - Complete rewrite to support group tabs and filtering
- **Rule Dialog** - Now associates rules with the currently selected group

#### Lineup Generation
- **API Route** (`app/api/generate-lineup/route.ts`) - Now accepts `rule_group_id` instead of `mode`
- **Prompt Builder** (`lib/ai/prompt-builder.ts`) - Includes rule group name in AI prompt context; adds position strengths to player data

#### Game Detail Page
- **Rule Group Dropdown** - Replaces optimization mode selector
- **Warning Message** - Shows alert when no rule groups exist with link to create one

#### Types
- **`types/lineup.ts`**:
  - Added `RuleGroup` interface
  - Updated `PlayerForLineup` to include `position_strengths: string[]`
  - Updated `LineupRequest` to use `ruleGroupId` instead of `mode`
  - Added `rule_group_id` to `TeamRule`

#### Roster Display
- **Position Badges** - Primary position (first in list) shows default badge style; secondary positions show secondary style

### Database Schema

```sql
-- rule_groups table
CREATE TABLE rule_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- New columns
ALTER TABLE players ADD COLUMN position_strengths TEXT[] DEFAULT '{}';
ALTER TABLE players ADD COLUMN notes TEXT;
ALTER TABLE team_rules ADD COLUMN rule_group_id UUID REFERENCES rule_groups(id) ON DELETE CASCADE;
ALTER TABLE lineups ADD COLUMN rule_group_id UUID REFERENCES rule_groups(id) ON DELETE SET NULL;
```

---

## [0.70.0] - 2026-01-20

### Added

#### AI Integration (Phase 4)
- **Claude API Client** (`lib/ai/claude-client.ts`) - Wrapper for Anthropic Claude API with error handling
- **Prompt Builder** (`lib/ai/prompt-builder.ts`) - Constructs AI prompts from database data
- **Generate Lineup API** (`app/api/generate-lineup/route.ts`) - Main endpoint for lineup generation
- **Lineup Types** (`types/lineup.ts`) - TypeScript interfaces for AI request/response

#### Lineup Display UI
- **Batting Order** (`app/dashboard/games/[gameId]/_components/batting-order.tsx`) - Numbered list of batters
- **Defensive Grid** (`app/dashboard/games/[gameId]/_components/defensive-grid.tsx`) - Table/accordion view of defensive assignments
- **Rule Compliance** (`app/dashboard/games/[gameId]/_components/rule-compliance.tsx`) - Checklist of rule violations/passes
- **Lineup Display** (`app/dashboard/games/[gameId]/_components/lineup-display.tsx`) - Combined view component

---

## [0.60.0] - 2026-01-19

### Added

#### Game Detail & Roster Setup (Phase 3)
- **Game Detail Page** (`app/dashboard/games/[gameId]/page.tsx`)
- **Roster Setup** (`app/dashboard/games/[gameId]/_components/roster-setup.tsx`) - Player availability, pitching innings, restrictions
- **Game Roster Table** - Saves availability data to `game_roster` table

#### Games Management
- **Games List Page** (`app/dashboard/games/page.tsx`)
- **Games Client** - Upcoming/Past tabs with filtering
- **Game Card** - Display component for game details
- **Game Dialog** - Create/edit games

#### Rules Management
- **Rules Page** (`app/dashboard/rules/page.tsx`)
- **Rules Client** - Drag-drop priority ordering with @dnd-kit
- **Sortable Rule** - Draggable rule card component
- **Rule Dialog** - Create/edit rules with active toggle

---

## [0.50.0] - 2026-01-18

### Added

#### Roster Management (Phase 2)
- **Roster Page** (`app/dashboard/roster/page.tsx`) - Player list with table
- **Roster Client** - CRUD operations for players
- **Player Dialog** - Tabbed dialog (Info, Ratings, Positions)
- **Star Rating** - 1-5 star input component

#### Player Ratings (14 Categories)
- **Batting**: Plate Discipline, Contact Ability, Run Speed, Batting Power
- **Fielding**: Fielding Hands, Throw Accuracy, Arm Strength, Fly Ball Ability
- **Mental**: Baseball IQ, Attention
- **Pitching**: Pitch Control, Pitch Velocity, Pitch Composure
- **Catching**: Catcher Ability

#### Position Eligibility
- **Position Toggles** - P, C, SS, 1B eligibility checkboxes
- **Migration** `20260120210000_update_player_ratings.sql`

---

## [0.30.0] - 2026-01-17

### Added

#### Foundation & Infrastructure (Phase 1)
- **Next.js 14** setup with App Router and TypeScript
- **Supabase** integration (PostgreSQL + Auth)
- **Database Schema** - 13 tables with RLS policies
- **Authentication** - Login/signup pages with form validation
- **Dashboard Layout** - Header, navigation, responsive design
- **shadcn/ui Components** - 17+ UI components installed

#### Core Dependencies
- @supabase/supabase-js, @supabase/ssr
- @anthropic-ai/sdk
- react-hook-form, zod, @hookform/resolvers
- @dnd-kit/core, @dnd-kit/sortable
- papaparse, date-fns
- tailwindcss, lucide-react

---

## Migration History

| Migration | Description | Date |
|-----------|-------------|------|
| `initial_schema.sql` | Core database schema (13 tables) | 2026-01-17 |
| `20260120210000_update_player_ratings.sql` | 14 player rating fields | 2026-01-20 |
| `20260121000000_add_rule_groups.sql` | Rule groups table and references | 2026-01-21 |
| `20260121000001_add_position_strengths.sql` | Position strengths array | 2026-01-21 |
| `20260121000002_add_player_notes.sql` | Coach notes field | 2026-01-21 |
| `20260121000004_add_stats_analysis.sql` | Stats analysis JSONB column | 2026-01-21 |

---

## Upcoming

### [1.0.0] - MVP Release (Planned)
- Production deployment to Vercel
- End-to-end testing with Claude API
- Error boundaries and loading states
- Mobile responsiveness polish
- Empty states for all lists
