# Changelog

All notable changes to Peanut Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-01-26

### Changed

#### Dashboard - Anthropic Light Mode
Applied the polished Anthropic design language to the main dashboard app using a warm light mode variant. This brings the refined, tech-forward aesthetic from the marketing site while maintaining an approachable feel.

**Design System Updates (CSS Variables):**
- **Background**: Warm cream `#faf9f6` (was pure white)
- **Card surfaces**: Slightly lighter cream `#fdfcfa`
- **Primary accent**: Terracotta `#d97757` (was dark navy)
- **Text**: Warm charcoal `#1a1a1b`
- **Muted text**: Warm gray `#6b6966`
- **Borders**: Warm gray `#e8e6e3`
- **Focus rings**: Terracotta accent

**Component Updates:**
- **Dashboard layout**: Uses `bg-background` CSS variable
- **Header**: Uses `bg-card` with warm border
- **Active nav states**: Terracotta color with `font-semibold`
- **Inactive nav links**: Muted foreground color
- **Mobile menu**: Terracotta accent on hover/active states
- **Sign out button**: Destructive red with hover effect

### Files Modified

| File | Changes |
|------|---------|
| `app/globals.css` | Updated `:root` CSS variables for warm Anthropic palette |
| `app/dashboard/layout.tsx` | Changed `bg-gray-50` to `bg-background` |
| `components/layout/header.tsx` | Updated to `bg-card`, terracotta active states, improved mobile menu styling |

---

## [1.5.0] - 2026-01-26

### Changed

#### Marketing Site Redesign - Anthropic Design Language
Complete visual overhaul of the marketing site using Anthropic's design language: dark, minimalist, tech-centric yet approachable.

**Design System Updates:**
- **New color palette**: Dark slate backgrounds (`#131314`, `#1a1a1b`), cream text (`rgba(250, 249, 240, 0.95)`), terracotta accent (`#d97757`)
- **Fluid typography**: Responsive `clamp()`-based font sizes from `text-fluid-xs` to `text-fluid-5xl`
- **New animations**: `fade-in-up`, `text-reveal`, `scale-in`, `glow-pulse` with cubic-bezier easing
- **Marketing utilities**: `.glow-terracotta`, `.marketing-card`, `.btn-terracotta`, animation delay classes

**Section-by-Section Updates:**
- **Layout**: Dark `bg-anthropic-slate` wrapper for entire marketing site
- **Header**: Dark with cream text, terracotta "Get Started" button
- **Hero**:
  - Dot grid texture background for visual depth
  - Vignette effect to frame content
  - Terracotta glow accent
  - Staggered animation on value props
  - Glowing CTA buttons
- **Features**: Dark cards with terracotta icons, hover scale effect
- **Control Section**: Dark dropdowns, elevated surface styling
- **Showcase**: Dark tabs with terracotta active state
- **How It Works**: Terracotta step circles with connector lines
- **CTA**: Terracotta gradient background with radial overlay
- **Footer**: Dark with subtle borders

**Example Components (6 total):**
All example components updated with dark theme styling:
- Lineup Grid, Batting Order, Defense, Player Insights, Team Insights, Roster Setup

### Files Modified

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Added anthropic colors, fluid typography, new animations |
| `app/globals.css` | Marketing utilities, glow effects, animation delays |
| `app/(marketing)/layout.tsx` | Dark theme wrapper |
| `app/(marketing)/_components/marketing-header.tsx` | Dark header, terracotta CTA |
| `app/(marketing)/_components/hero-section.tsx` | Dot grid texture, vignette, animations |
| `app/(marketing)/_components/features-section.tsx` | Dark cards, terracotta icons |
| `app/(marketing)/_components/control-section.tsx` | Dark dropdowns |
| `app/(marketing)/_components/showcase-section.tsx` | Dark tabs |
| `app/(marketing)/_components/how-it-works-section.tsx` | Terracotta steps |
| `app/(marketing)/_components/cta-section.tsx` | Terracotta gradient |
| `app/(marketing)/_components/footer.tsx` | Dark footer |
| `app/(marketing)/_components/examples/*.tsx` | All 6 example components |

---

## [1.4.0] - 2026-01-26

### Added

#### Marketing Page Feature Showcase
- **"See It In Action" Section** - Interactive tabbed showcase demonstrating app features with mock data
- **6 Example Components** showcasing different aspects of the app:
  - **Lineup Grid** - Interactive defensive grid with locked positions and position auto-swap
  - **Batting Order** - AI-generated batting order with rationale for each position
  - **Defense** - Baseball field layout showing defensive positioning by inning
  - **Player Insights** - Individual player analysis with strengths/weaknesses and recommendations
  - **Team Insights** - Team-level analysis with practice recommendations
  - **Roster Setup** - Player setup modal mockup with Info/Ratings/Positions tabs

#### "You Set the Strategy" Control Section
- **Interactive Game Setup Mockup** - Shows the actual dropdowns coaches use:
  - Rule Group selector (League Rules, Tournament Mode, Practice Game)
  - Game Priority spectrum (Win ↔ Balanced ↔ Develop)
  - Data Weighting options (GameChanger Only ↔ Equal ↔ Coach Ratings Only)
- **Explanation Cards** - Describes each dropdown's purpose
- **Lock Feature Callout** - Emphasizes coaches always have final say

### Changed

#### Hero Section
- **New headline:** "Your Lineup Assistant for Youth Baseball & Softball"
- **Added value prop badges:** "Lineups in seconds, not hours", "Data-driven advantage", "Ridiculously easy to use"
- **Updated tagline:** "Let AI handle the busywork, or take full control—your choice"

#### Features Section → "Data-Driven Lineups, Powered by AI"
- Complete rewrite focusing on AI power and data integration:
  - **GameChanger Stats** - Import real batting, fielding, pitching stats
  - **Coach Ratings** - Rate players on 14 observable skills
  - **AI-Powered Analysis** - Combines ratings + stats for true player understanding
  - **Optimized Batting Orders** - Maximizes run production
  - **Smart Defensive Rotations** - Respects strengths, ensures fair time
  - **Rule Compliance Built-In** - 100% compliant lineups every time

#### How It Works Section → "Ready in Minutes, Not Hours"
- Added time estimates to each step (~1 min, ~5 sec, Your call)
- Added connector lines between steps
- New tagline: "That's it. Seriously."

#### CTA Section
- Added benefit checkmarks: "Lineups in seconds", "Data-driven competitive edge", "Stay in control"

### Files Added

| File | Description |
|------|-------------|
| `app/(marketing)/_components/showcase-section.tsx` | Tabbed container for all example components |
| `app/(marketing)/_components/control-section.tsx` | Game setup dropdowns mockup |
| `app/(marketing)/_components/examples/mock-data.ts` | Sample data for all examples |
| `app/(marketing)/_components/examples/example-lineup-grid.tsx` | Interactive lineup grid showcase |
| `app/(marketing)/_components/examples/example-lineup.tsx` | Batting order with AI rationale |
| `app/(marketing)/_components/examples/example-defensive.tsx` | Baseball field defensive layout |
| `app/(marketing)/_components/examples/example-player-insights.tsx` | Player analysis display |
| `app/(marketing)/_components/examples/example-team-insights.tsx` | Team analysis with practice recs |
| `app/(marketing)/_components/examples/example-roster.tsx` | Player setup modal mockup |

### Files Modified

| File | Changes |
|------|---------|
| `app/(marketing)/page.tsx` | Added ShowcaseSection and ControlSection |
| `app/(marketing)/_components/hero-section.tsx` | New headline, value props, updated messaging |
| `app/(marketing)/_components/features-section.tsx` | Complete rewrite for AI/data focus |
| `app/(marketing)/_components/how-it-works-section.tsx` | Time estimates, connector lines, new tagline |
| `app/(marketing)/_components/cta-section.tsx` | Added benefit checkmarks |

---

## [1.3.0] - 2026-01-26

### Added

#### Marketing Landing Page (New Public Website)
- **Single-page marketing website** - Public landing page at `/` for new visitors
- **Route group architecture** - `app/(marketing)/` route group keeps marketing pages separate from app
- **Responsive design** - Mobile-first layout with proper stacking on small screens

#### Marketing Page Sections
- **Hero Section** - "AI-Powered Lineups for Youth Baseball & Softball" headline with dual CTAs
- **Features Section** - 4 feature cards highlighting key value props:
  - Smart Lineup Generation
  - 100% Rule Compliant
  - GameChanger Integration
  - Mid-Game Adjustments
- **How It Works Section** - 3-step process (Build Roster → Define Rules → Generate & Go)
- **CTA Section** - Dark blue conversion section with "Ready to Simplify Game Day?"
- **Footer** - Branding, nav links, copyright

#### Marketing Components
- **MarketingHeader** - Sticky header with Peanut Manager branding (Pacifico font), Log In/Get Started buttons
- **MarketingLayout** - Clean white background layout without auth checks

### Changed

#### Routing
- **Root page behavior** - `/` now serves landing page for all users (logged in or out)
- **Removed redirect** - Deleted `app/page.tsx` that previously redirected to `/login` or `/dashboard`
- **Auth pages unchanged** - `/login` and `/signup` still redirect authenticated users to `/dashboard`

### Files Added

| File | Description |
|------|-------------|
| `app/(marketing)/layout.tsx` | Marketing layout wrapper |
| `app/(marketing)/page.tsx` | Landing page composing all sections |
| `app/(marketing)/_components/marketing-header.tsx` | Sticky navigation header |
| `app/(marketing)/_components/hero-section.tsx` | Above-fold hero content |
| `app/(marketing)/_components/features-section.tsx` | 4-card feature grid |
| `app/(marketing)/_components/how-it-works-section.tsx` | 3-step process section |
| `app/(marketing)/_components/cta-section.tsx` | Conversion CTA section |
| `app/(marketing)/_components/footer.tsx` | Page footer |

### Files Removed

| File | Reason |
|------|--------|
| `app/page.tsx` | Replaced by `(marketing)/page.tsx` for landing page |

---

## [1.2.7] - 2026-01-25

### Fixed

#### Roster Page State Not Updating After Mutations
- **Issue:** When adding, updating, or importing players on the roster page, changes didn't appear until page refresh
- **Cause:** `router.refresh()` was used instead of local state updates, which doesn't reliably trigger re-renders
- **Fix:** Added immediate local state updates for all mutation operations:
  - **Add Player:** Constructs full Player object with ratings/eligibility and adds to state with `setPlayers(prev => [...prev, fullPlayer])`
  - **Update Player:** Maps over existing players and updates the matching player with new data
  - **Import Players:** Callback now receives imported player objects and adds them to state
- **Removed:** `router.refresh()` calls and unused `useRouter` import

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/roster/_components/roster-client.tsx` | Added `setPlayers()` calls for add/update, updated import callback, removed `useRouter` |
| `app/dashboard/[teamId]/roster/_components/roster-import-inline.tsx` | Changed callback type from `(count: number)` to `(players: ImportedPlayer[])` |

---

## [1.2.6] - 2026-01-25

### Fixed

#### Team Switcher 404 on Game Detail Page
- **Issue:** Switching teams while on an individual game page (`/dashboard/[teamId]/games/[gameId]`) caused a 404
- **Cause:** Team switcher preserved the full path including the game ID, which doesn't exist for the new team
- **Fix:** When on a detail page (path has more than 4 segments), navigate to the section root instead of preserving the ID
- **Example:** Switching teams on `/dashboard/team1/games/abc123` now goes to `/dashboard/team2/games` instead of `/dashboard/team2/games/abc123`

### Files Modified

| File | Changes |
|------|---------|
| `components/layout/team-switcher.tsx` | Detect detail pages and navigate to section root when switching teams |

---

## [1.2.5] - 2026-01-25

### Changed

#### Dynamic Data Weighting Unavailable Message
- **Issue:** Static message "Add coach ratings and import GameChanger data" didn't indicate which data type was missing
- **Fix:** Message now dynamically shows what's missing and what action to take:
  - Neither source: "No player data available. Add coach ratings or import GameChanger data to generate lineups."
  - Only GameChanger: "Using GameChanger stats. Add coach ratings to enable data weighting options."
  - Only coach ratings: "Using coach ratings. Import GameChanger data to enable data weighting options."
- **Benefit:** Users clearly understand why Data Weighting is unavailable and what specific action to take

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/[gameId]/page.tsx` | Pass both `hasGameChangerData` and `hasCoachRatings` props separately |
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Dynamic conditional rendering for fallback message based on which data sources exist |

---

## [1.2.4] - 2026-01-25

### Fixed

#### Data Weighting Dropdown Visibility Logic
- **Issue:** Data Weighting dropdown appeared when only GameChanger data existed, but no coach ratings
- **Cause:** Dropdown visibility only checked for `hasGameChangerData`, ignoring whether coach ratings exist
- **Fix:** Dropdown now only shows when **both** data sources exist (`hasBothDataTypes = hasGameChangerData && hasCoachRatings`)
- **Rationale:** Data weighting controls the balance between GameChanger stats and coach ratings — showing it when only one source exists is meaningless

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/[gameId]/page.tsx` | Added `hasCoachRatings` query, computed `hasBothDataTypes`, updated prop |
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Renamed prop to `hasBothDataTypes`, conditional dropdown visibility |

---

## [1.2.3] - 2026-01-25

### Added

#### Auto-scroll to Generation Loading Feedback
- **GenerationLoading component now scrolls into view on mount** - Ensures users see the loading indicator when clicking "Generate Batting Order" or "Fill Remaining Positions with AI"
- **Smooth scroll behavior** - Uses `scrollIntoView({ behavior: 'smooth', block: 'center' })` for a polished experience
- **Improves visibility** - Prevents users from thinking the system is stuck when the loading indicator appears below the viewport

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/[gameId]/_components/generation-loading.tsx` | Added useRef, useEffect for scroll-into-view on mount |

---

## [1.2.2] - 2026-01-24

### Added

#### Game Creation Validation Gate
- **Blocks game creation when no lineup data exists** - Prevents coaches from creating games before setting up player data
- **Validation criteria:**
  - **Allow games when:** GameChanger stats imported OR all players have at least 1 rating
  - **Block games when:** No stats AND not all players rated, or no players on roster
- **Warning card displayed when blocked:**
  - Amber alert styling with "Setup Required" title
  - Clear explanation of requirements
  - Link to Roster page with progress indicator (e.g., "3/5 rated")
  - Link to Stats page for GameChanger import

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/page.tsx` | Added player/stats queries, validation logic, new props to client |
| `app/dashboard/[teamId]/games/_components/games-client.tsx` | Added warning card UI, updated props interface |

---

## [1.2.1] - 2026-01-24

### Changed

#### Rule Group Dropdown UX Improvement
- **Issue:** When no rule groups exist, an amber warning box blocked lineup generation
- **Before:** Prominent warning with AlertCircle icon required creating rule groups first
- **After:** Subtle info note with muted styling allows generation without rule groups
- **UI Changes:**
  - Uses Info icon instead of AlertCircle
  - Muted background with dashed border (matches Data Weighting style)
  - Inline link to create rule groups instead of button
  - Text: "Using default lineup generation. Create rule groups to define league lineup rules..."
- **Functional Change:** Generate button now enabled when no rule groups exist (previously disabled)

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Replaced amber warning with info note, restructured JSX, updated button disabled condition |

---

## [1.2.0] - 2026-01-24

### Fixed

#### Duplicate Players in Batting Order
- **Issue:** AI sometimes returned the same player multiple times in the batting order
- **Cause:** Filtering logic only checked for empty entries, not duplicates
- **Fix:** Added deduplication using a `Set<string>` to track seen player IDs, keeping only the first occurrence

#### Empty Defensive Positions
- **Issue:** AI sometimes left defensive positions unfilled (6 positions empty despite 8 locked)
- **Cause:** AI didn't always return all 9 field positions for each inning
- **Fix:**
  - Added explicit requirements in AI prompts that ALL 9 positions must be filled
  - Added post-processing validation that fills any missing positions with unassigned players

#### Pitcher Re-entry Rule Violation
- **Issue:** AI would sometimes assign a player to pitch after they had already been pulled
- **Cause:** No enforcement of the baseball rule that a pulled pitcher cannot return
- **Fix:**
  - Added PITCHER RULE to AI prompts explaining the constraint
  - Added post-processing validation that tracks pitcher status (not_started → pitching → pulled)
  - If a pulled pitcher is assigned to pitch, automatically swaps them with an eligible player

### Changed

#### AI Prompt Updates (`lib/ai/claude-client.ts`)
- Added CRITICAL REQUIREMENTS section to defensive system prompt:
  - All 9 positions must be filled every inning
  - No positions can be null or empty
  - Pitcher rule enforcement (once pulled, cannot return)

#### AI Prompt Builder (`lib/ai/prompt-builder.ts`)
- Added explicit CRITICAL and PITCHER RULE instructions to defensive prompt text
- Clearer guidance for AI on mandatory position filling

#### Generate Lineup API (`app/api/generate-lineup/route.ts`)
- Added batting order deduplication by player_id
- Added post-processing to fill empty defensive positions
- Added pitcher rule enforcement with automatic position swapping

### Files Modified

| File | Changes |
|------|---------|
| `app/api/generate-lineup/route.ts` | Deduplication, position filling, pitcher rule enforcement |
| `lib/ai/claude-client.ts` | Updated defensive system prompt with critical requirements |
| `lib/ai/prompt-builder.ts` | Added explicit instructions for position filling and pitcher rule |

---

## [1.1.0] - 2026-01-23

### Added

#### Mobile Navigation (Hamburger Menu)
- **Sheet-based mobile menu** - Slide-out navigation drawer for mobile devices
- **Hamburger icon** - Menu button visible only on mobile (hidden on `md:` breakpoint and up)
- **Mobile menu includes:**
  - Brand name header (Pacifico font)
  - Team switcher dropdown
  - All navigation links (Dashboard, Roster, Rules, Games, Stats)
  - Settings link
  - Sign out button (red text)
- **Auto-close** - Menu closes automatically on route change
- **Installed `sheet` component** from shadcn/ui

#### Rules Page Example Rules
- **Example rules section** - Shows when no rule groups exist to help users understand the feature
- **Example rules displayed:**
  - "All players must play an infield position by the end of the 4th inning."
  - "All players must be included in the batting order."

### Changed

#### Rebrand to "Peanut Manager"
- **App Name** - Rebranded from "LineupAI" to "Peanut Manager" across all user-facing surfaces
- **Brand Font** - Added Pacifico Google Font for brand name display
- **Updated Locations:**
  - Browser tab title
  - Header logo text
  - Login page title
  - Signup page title
  - Dashboard welcome message
  - Printed lineup footer
  - localStorage key prefix (`peanutmgr-` instead of `lineupai-`)

### Files Added

| File | Description |
|------|-------------|
| `lib/fonts.ts` | Brand font configuration (Pacifico) |
| `components/ui/sheet.tsx` | shadcn Sheet component for mobile menu |

### Files Modified

| File | Changes |
|------|---------|
| `app/layout.tsx` | Updated page title |
| `components/layout/header.tsx` | Brand name with Pacifico font, hamburger menu for mobile |
| `app/(auth)/login/page.tsx` | Brand name with Pacifico font |
| `app/(auth)/signup/page.tsx` | Brand name with Pacifico font |
| `app/dashboard/page.tsx` | Updated welcome message |
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Updated print footer |
| `app/dashboard/[teamId]/_components/getting-started.tsx` | Updated localStorage key |
| `app/dashboard/[teamId]/rules/_components/rules-client.tsx` | Added example rules in empty state |

---

## [1.0.0] - 2026-01-22

### Added

#### Team Dashboard Overhaul - AI Insights (Major Feature)
- **Team Insights Card** - New dashboard section with three states:
  - **No stats uploaded:** Prompts to upload GameChanger CSV
  - **Stats exist, no analysis:** Shows "Generate Insights" button with data import date
  - **Analysis complete:** Displays team strengths, weaknesses, practice recommendations
- **Team-Level AI Analysis** - Claude analyzes aggregate team stats to provide:
  - Team strengths with supporting statistics
  - Areas for improvement with recommendations
  - Practice drill suggestions with priority levels (high/medium/low)
  - Lineup insights (best leadoff candidates, power spots, defensive strengths/concerns)
- **Data Timestamps** - Shows when stats were imported and when analysis was generated
- **Refresh Analysis** - Button to regenerate insights with updated data

#### Database Migration (`20260122100000_add_team_analysis.sql`)
- `team_analysis JSONB` - Stores AI-generated team-level insights
- `team_analyzed_at TIMESTAMPTZ` - When team analysis was last generated
- `stats_imported_at TIMESTAMPTZ` - When GameChanger stats were last uploaded

#### Dismissible Getting Started Guide
- **"Don't show again" button** - Hides the getting started card
- **Persists to localStorage** - Preference remembered across sessions
- **"Show getting started guide" link** - Brings back the card when hidden

#### Dashboard Navigation
- **Added "Dashboard" link** - Now shows: Dashboard → Roster → Rules → Games → Stats

#### Stats Page Enhancements
- **Last Analysis Date** - Shows when AI player analysis was last generated
- **Sparkles icon indicator** - Visual indicator next to analysis timestamp

#### Team Settings UX
- **Clickable team cards** - Click anywhere on team box to navigate to that team's dashboard
- **Edit/Delete buttons preserved** - Pencil and trash icons still work independently

### Fixed

#### Blank Positions After Lineup Generation
- **Issue:** Sometimes positions were blank after AI generation due to ID mismatch
- **Cause:** `buildGridFromDefense` only matched players by exact UUID
- **Fix:** Added fallback matching by player name when ID match fails
- **Debug:** Console warnings when name fallback is used to help identify AI ID issues

### Changed

#### API Updates
- **`/api/stats/analyze`**:
  - Now generates team-level analysis alongside individual player analyses
  - Calculates aggregate team batting/fielding stats
  - Saves team analysis to `teams` table
  - Returns `team_analysis` in response

- **`/api/import/gamechanger`**:
  - Sets `stats_imported_at` on team when stats are imported
  - Clears team analysis and timestamps when stats are cleared

#### Type Updates
- **`types/lineup.ts`**: Added `TeamAnalysis` interface
- **`types/database.ts`**: Added team analysis columns to teams table type

### Files Added

| File | Description |
|------|-------------|
| `app/dashboard/[teamId]/_components/team-insights.tsx` | Team insights card component |
| `app/dashboard/[teamId]/_components/getting-started.tsx` | Dismissible getting started component |
| `supabase/migrations/20260122100000_add_team_analysis.sql` | Team analysis columns migration |

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/page.tsx` | Added TeamInsights and GettingStarted components |
| `app/dashboard/[teamId]/stats/_components/stats-client.tsx` | Added last analysis date display |
| `app/dashboard/settings/_components/settings-client.tsx` | Made team cards clickable |
| `components/layout/header.tsx` | Added Dashboard to navigation |
| `app/api/stats/analyze/route.ts` | Added team-level analysis generation |
| `app/api/import/gamechanger/route.ts` | Track stats_imported_at timestamp |
| `lib/ai/claude-client.ts` | Added generateTeamAnalysis() method |
| `types/lineup.ts` | Added TeamAnalysis interface |
| `types/database.ts` | Added team analysis columns |
| `game-detail-client.tsx` | Fixed blank positions with name fallback |

---

## [0.99.0] - 2026-01-22

### Added

#### Regeneration Feedback System
- **Feedback Text Field** - When regenerating defensive positions, coaches can now provide feedback to the AI
  - Text area in the regeneration dialog for instructions like "Move Jake to outfield" or "Cole should pitch inning 3"
  - AI receives the current lineup context along with the feedback
  - Enables targeted adjustments without starting from scratch

#### Multi-Inning Selection for Regeneration
- **Checkbox-based Inning Selection** - Replaced single dropdown with checkboxes for each inning
  - Select specific innings to regenerate (not just "from inning X onward")
  - "Select All" checkbox for quick full regeneration
  - Grid layout (3 columns) for compact display
  - Button shows count of selected innings

### Changed

#### Regeneration Dialog UX
- **`in-game-adjustments.tsx`**:
  - Changed `onRegenerateFrom` to `onRegenerateInnings` (accepts array of innings)
  - Added checkbox grid for inning selection
  - Added "Select All" option at top
  - Button disabled when no innings selected
  - Feedback field with helper text explaining AI context

#### API & Prompt Updates
- **`game-detail-client.tsx`**:
  - Added `buildCurrentGridForAPI()` helper to convert grid state for API
  - `handleFillDefensive()` now accepts optional feedback parameter
  - Passes current grid and feedback to API for context-aware regeneration

- **`app/api/generate-lineup/route.ts`**:
  - Added `current_grid` and `feedback` parameters to request body
  - Passes new parameters to `buildDefensivePrompt()`

- **`lib/ai/prompt-builder.ts`**:
  - Added `formatCurrentLineupForPrompt()` helper function
  - `buildDefensivePrompt()` now accepts `currentGrid` and `feedback` parameters
  - When regenerating with feedback, prompt includes:
    - Current lineup positions by inning
    - Coach's feedback as high-priority instructions

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/[teamId]/games/[gameId]/_components/in-game-adjustments.tsx` | Checkbox inning selection, feedback textarea |
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Pass feedback and current grid to API |
| `app/api/generate-lineup/route.ts` | Accept feedback and current_grid parameters |
| `lib/ai/prompt-builder.ts` | Include current lineup and feedback in prompt |

---

## [0.98.0] - 2026-01-22

### Removed

#### UI Simplification - Unused Fields
Removed fields that added UI complexity without functional value:

**Team Level:**
- **League Name** - Removed from team dialog and settings display
- **Team Description** - Removed from team dialog and settings display
- **Innings Per Game** - Removed from team level (remains at game level where it belongs)

**Game Level:**
- **Location/Field** - Removed from game dialog and game detail display

**AI Prompts:**
- **TeamContext** interface simplified to only `name` and `age_group`
- Removed `league_name` and `description` from AI prompt context

### Changed

#### Team Dialog
- Simplified to just Team Name and Age Group fields
- Removed 2-column grid layout (now single column)
- Cleaner, more focused form

#### Game Dialog
- Removed Location input field
- Focused on essential fields: Opponent, Date, Time, Innings, Scouting Report

#### Settings Page
- Team cards no longer display innings per game
- Simplified team card layout

### Files Modified

| File | Changes |
|------|---------|
| `app/dashboard/settings/_components/team-dialog.tsx` | Removed league_name, description, innings_per_game fields |
| `app/dashboard/settings/_components/settings-client.tsx` | Removed fields from save function and display |
| `app/dashboard/[teamId]/games/_components/game-dialog.tsx` | Removed location field |
| `app/dashboard/[teamId]/games/[gameId]/_components/game-detail-client.tsx` | Removed location display |
| `lib/ai/prompt-builder.ts` | Simplified TeamContext interface |
| `app/api/generate-lineup/route.ts` | Updated TeamContext creation |

### Notes
- Database columns remain unchanged (non-breaking change)
- Innings per game is still set at the game level when creating/editing games
- AI prompts still receive team name and age group for context

---

## [0.97.0] - 2026-01-22

### Added

#### Multi-Team Support (Major Feature)
- **New URL Structure** - Team-scoped routes: `/dashboard/[teamId]/roster`, `/dashboard/[teamId]/games`, etc.
- **Team Switcher** - Dropdown in header to switch between teams, preserves current page when switching
- **Team Selection Page** - Dashboard root shows team grid for users with multiple teams, auto-redirects for single team
- **Team Management** - Dedicated settings pages for team and profile management
- **Team Description** - New field for AI context (e.g., "Competitive 12U travel ball team")
- **AI Context Integration** - Team name, age group, and description included in lineup generation prompts
- **Migration** `20260122000000_add_multi_team_support.sql`:
  - Adds `description TEXT` column to `teams` table
  - Adds index on `created_by` for faster team lookups

#### Authentication Flow
- **Forgot Password Page** (`/forgot-password`) - Request password reset via email
- **Reset Password Page** (`/reset-password`) - Set new password after clicking reset link
- **Auth Callback Route** (`/auth/callback`) - Handles Supabase email confirmations and redirects
- **Email Change Support** - Users can update their email in profile settings
- **Password Change** - Users can update password from profile settings

#### Roster Import from CSV
- **Import API** (`/api/import/roster`) - Creates players from GameChanger CSV with optional stats
- **Import During Team Creation** - After creating a team, dialog shows roster import step
- **Import on Roster Page** - "Import CSV" button opens import dialog for existing teams
- **Stats Toggle** - Option to import just roster (names/numbers) or include batting/fielding stats
- **Preview Table** - Shows parsed players before import with stats preview

#### Settings Pages Separation
- **Team Settings** (`/dashboard/settings/teams`) - Create, edit, delete teams
- **Profile Settings** (`/dashboard/settings/account`) - Email and password management
- **Settings Navigation** (`/dashboard/settings`) - Cards linking to team and profile settings

### Fixed

#### Team Switcher 404 Bug
- **Issue:** Selecting a team from dropdown while on settings page caused 404
- **Cause:** Switcher tried to navigate to `/dashboard/[teamId]/settings/teams` which doesn't exist
- **Fix:** Detect settings pages and navigate to team's main page instead

### Changed

#### URL Structure Migration
| Old Path | New Path |
|----------|----------|
| `/dashboard/roster` | `/dashboard/[teamId]/roster` |
| `/dashboard/rules` | `/dashboard/[teamId]/rules` |
| `/dashboard/games` | `/dashboard/[teamId]/games` |
| `/dashboard/games/[gameId]` | `/dashboard/[teamId]/games/[gameId]` |
| `/dashboard/stats` | `/dashboard/[teamId]/stats` |
| `/dashboard/settings` | `/dashboard/settings` (unchanged, not team-scoped) |

#### Team-Scoped Layout
- New `app/dashboard/[teamId]/layout.tsx` validates user owns the team
- Redirects to `/dashboard` if team not found or access denied
- Child pages no longer need individual auth/team ownership checks

### Files Added

| File | Description |
|------|-------------|
| `app/dashboard/[teamId]/layout.tsx` | Team validation layout |
| `app/dashboard/[teamId]/page.tsx` | Team dashboard index |
| `app/dashboard/[teamId]/roster/` | Moved roster pages |
| `app/dashboard/[teamId]/rules/` | Moved rules pages |
| `app/dashboard/[teamId]/games/` | Moved games pages |
| `app/dashboard/[teamId]/stats/` | Moved stats pages |
| `app/dashboard/settings/page.tsx` | Settings navigation |
| `app/dashboard/settings/teams/page.tsx` | Team management |
| `app/dashboard/settings/account/page.tsx` | Profile settings |
| `app/dashboard/settings/_components/settings-client.tsx` | Team CRUD client |
| `app/dashboard/settings/_components/team-dialog.tsx` | Create/edit team dialog with import step |
| `app/dashboard/settings/_components/account-settings.tsx` | Email/password forms |
| `app/dashboard/settings/_components/roster-import.tsx` | CSV import component |
| `app/(auth)/forgot-password/page.tsx` | Password reset request |
| `app/(auth)/reset-password/page.tsx` | New password form |
| `app/auth/callback/route.ts` | Auth redirect handler |
| `app/api/import/roster/route.ts` | Roster import API |
| `components/layout/team-switcher.tsx` | Team dropdown component |
| `supabase/migrations/20260122000000_add_multi_team_support.sql` | Multi-team migration |

### Database Schema

```sql
-- Team description for AI context
ALTER TABLE teams ADD COLUMN description TEXT;

-- Index for faster team lookups
CREATE INDEX idx_teams_created_by ON teams(created_by);
```

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
| `20260122000000_add_multi_team_support.sql` | Team description and index | 2026-01-22 |
| `20260122100000_add_team_analysis.sql` | Team analysis and stats timestamps | 2026-01-22 |

---

## Upcoming

### [1.0.0] - MVP Release (Planned)
- Production deployment to Vercel
- End-to-end testing with Claude API
- Error boundaries and loading states
- Mobile responsiveness polish
- Empty states for all lists
