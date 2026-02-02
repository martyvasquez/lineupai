# Peanut Manager - AI-Powered Baseball Lineup Optimizer

**Status:** 🚧 In Development (100% Complete)
**Last Updated:** February 1, 2026 (v1.7.5)

---

## 🎯 Goal

Build a **mobile-first web application** that generates optimized youth baseball/softball lineups using AI. Coaches input their roster, subjective ratings, and team-specific rules. The system combines this with GameChanger statistics to generate batting orders and defensive assignments that comply with league rules while maximizing team performance.

### Core Value Proposition

1. **Rule Compliance** - Never violate league rules; app tracks constraints automatically
2. **Data-Driven** - Integrates GameChanger stats with coach observations
3. **Mid-Game Adjustments** - Re-optimize on the fly when circumstances change
4. **Flexible Rules** - Each team defines their own rules in plain language; AI interprets them

### Tech Stack

- **Frontend:** Next.js 14 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** Claude API (Anthropic claude-sonnet-4-5-20250929)
- **Deployment:** Vercel
- **MVP Scope:** P0 features + GameChanger CSV import + Multi-team support
- **Timeline:** ~5 weeks total

---

## 📊 Where We Are At

### ✅ Completed (Phase 1: Foundation & Infrastructure)

#### Project Setup
- [x] Next.js 14 initialized with TypeScript and Tailwind CSS v3
- [x] All dependencies installed (Supabase, Claude SDK, forms, drag-drop, CSV parser)
- [x] Git repository initialized with organized commits
- [x] Project structure created following Next.js 14 App Router conventions
- [x] Environment variables template (`.env.example`)
- [x] Comprehensive README with setup instructions

#### Database & Backend
- [x] Complete PostgreSQL schema designed (13 tables)
- [x] Supabase migration file created with:
  - All core tables (teams, players, ratings, eligibility, stats, games, lineups)
  - Row Level Security (RLS) policies for all tables
  - Season aggregate views for batting/fielding stats
  - Performance indexes on all foreign keys
- [x] Supabase client utilities (browser and server-side)
- [x] Auth middleware protecting dashboard routes

#### Authentication
- [x] Login page with email/password
- [x] Signup page with password confirmation
- [x] Form validation (react-hook-form + Zod)
- [x] Automatic redirects based on auth state
- [x] Auth layouts (centered, no navigation)
- [x] User dropdown menu with sign out

#### UI Components
- [x] 17+ shadcn/ui components installed and configured:
  - Forms: Button, Input, Label, Select, Textarea, Switch
  - Feedback: Toast, Alert, Badge, Skeleton
  - Layout: Card, Dialog, Dropdown Menu, Table, Tabs, Separator
- [x] Toast notification system
- [x] Responsive layouts
- [x] Mobile-first design patterns

#### Dashboard Layout
- [x] Header with navigation (Roster, Rules, Games, Import)
- [x] Dashboard home page with:
  - Quick stats overview (placeholder)
  - Getting started guide (4-step onboarding)
  - Quick links to all sections
- [x] Responsive mobile navigation
- [x] User account dropdown

### 📁 File Structure Created

```
baseball-lineups/
├── app/
│   ├── (marketing)/                    ✅ Public marketing pages
│   │   ├── layout.tsx                  ✅ Marketing layout (no auth)
│   │   ├── page.tsx                    ✅ Landing page at "/"
│   │   └── _components/
│   │       ├── marketing-header.tsx    ✅ Sticky header with branding
│   │       ├── hero-section.tsx        ✅ Hero with value props + CTAs
│   │       ├── features-section.tsx    ✅ 6 AI/data-focused feature cards
│   │       ├── control-section.tsx     ✅ Game setup dropdowns mockup
│   │       ├── showcase-section.tsx    ✅ Tabbed feature showcase
│   │       ├── how-it-works-section.tsx ✅ 3-step process with times
│   │       ├── cta-section.tsx         ✅ Conversion CTA with benefits
│   │       ├── footer.tsx              ✅ Page footer
│   │       └── examples/               ✅ Feature showcase components
│   │           ├── mock-data.ts        ✅ Sample data for examples
│   │           ├── example-lineup-grid.tsx ✅ Interactive lineup grid
│   │           ├── example-lineup.tsx  ✅ Batting order with rationale
│   │           ├── example-defensive.tsx ✅ Field position layout
│   │           ├── example-player-insights.tsx ✅ Player analysis
│   │           ├── example-team-insights.tsx ✅ Team analysis
│   │           └── example-roster.tsx  ✅ Player setup modal
│   ├── (auth)/
│   │   ├── login/page.tsx              ✅ Login form
│   │   ├── signup/page.tsx             ✅ Signup form
│   │   ├── subscribe/page.tsx          ✅ Subscription page
│   │   ├── forgot-password/page.tsx    ✅ Password reset request
│   │   ├── reset-password/page.tsx     ✅ New password form
│   │   └── layout.tsx                  ✅ Auth layout
│   ├── auth/
│   │   └── callback/route.ts           ✅ Auth redirect handler
│   ├── dashboard/
│   │   ├── page.tsx                    ✅ Team selection/redirect
│   │   ├── layout.tsx                  ✅ Main layout with team switcher
│   │   ├── [teamId]/                   ✅ Team-scoped routes
│   │   │   ├── layout.tsx              ✅ Team validation
│   │   │   ├── page.tsx                ✅ Team dashboard
│   │   │   ├── roster/
│   │   │   │   ├── page.tsx            ✅ Roster list page
│   │   │   │   └── _components/
│   │   │   │       ├── roster-client.tsx   ✅ Roster CRUD + CSV import
│   │   │   │       ├── player-dialog.tsx   ✅ Add/edit player (3 tabs)
│   │   │   │       ├── star-rating.tsx     ✅ 1-5 star rating input
│   │   │   │       ├── position-toggles.tsx ✅ P/C/SS/1B eligibility
│   │   │   │       ├── position-strength-editor.tsx ✅ Drag-drop position ordering
│   │   │   │       └── roster-import-inline.tsx ✅ CSV import dialog
│   │   │   ├── rules/
│   │   │   │   ├── page.tsx            ✅ Rules list with groups
│   │   │   │   └── _components/
│   │   │   │       ├── rules-client.tsx    ✅ Rules CRUD with group tabs
│   │   │   │       ├── rule-dialog.tsx     ✅ Add/edit rule
│   │   │   │       ├── rule-group-dialog.tsx ✅ Create/edit rule groups
│   │   │   │       └── sortable-rule.tsx   ✅ Draggable rule card
│   │   │   ├── games/
│   │   │   │   ├── page.tsx            ✅ Games list page
│   │   │   │   ├── [gameId]/
│   │   │   │   │   ├── page.tsx        ✅ Game detail page
│   │   │   │   │   └── _components/
│   │   │   │   │       ├── game-detail-client.tsx ✅ Two-phase lineup generation
│   │   │   │   │       ├── roster-setup.tsx ✅ Availability/pitching setup
│   │   │   │   │       ├── lineup-grid.tsx ✅ Interactive defensive grid
│   │   │   │   │       └── rule-compliance.tsx ✅ Rule checks display
│   │   │   │   └── _components/
│   │   │   │       ├── games-client.tsx    ✅ Games list client
│   │   │   │       ├── game-card.tsx       ✅ Game card component
│   │   │   │       └── game-dialog.tsx     ✅ Add/edit game
│   │   │   └── stats/
│   │   │       ├── page.tsx            ✅ Stats page with AI analysis
│   │   │       └── _components/
│   │   │           └── stats-client.tsx ✅ Player stats with AI analysis
│   │   └── settings/
│   │       ├── page.tsx                ✅ Settings navigation
│   │       ├── teams/page.tsx          ✅ Team management
│   │       ├── account/page.tsx        ✅ Profile settings
│   │       ├── billing/
│   │       │   ├── page.tsx            ✅ Billing management
│   │       │   └── _components/
│   │       │       └── billing-settings.tsx ✅ Billing status & actions
│   │       └── _components/
│   │           ├── settings-client.tsx ✅ Team CRUD client
│   │           ├── team-dialog.tsx     ✅ Create/edit team + import step
│   │           ├── account-settings.tsx ✅ Email/password forms
│   │           └── roster-import.tsx   ✅ CSV import component
│   ├── api/
│   │   ├── generate-lineup/route.ts    ✅ AI lineup generation endpoint
│   │   ├── billing/
│   │   │   ├── create-checkout/route.ts ✅ Stripe Checkout session
│   │   │   ├── create-portal/route.ts  ✅ Stripe Portal session
│   │   │   └── webhook/route.ts        ✅ Stripe webhook handler
│   │   ├── stats/
│   │   │   └── analyze/route.ts        ✅ AI stats analysis endpoint
│   │   └── import/
│   │       ├── gamechanger/route.ts    ✅ CSV stats import API
│   │       └── roster/route.ts         ✅ CSV roster import API
│   ├── layout.tsx                      ✅ Root layout
│   ├── page.tsx                        ✅ Root redirect
│   ├── globals.css                     ✅ Global styles
│   └── providers.tsx                   ✅ Client providers
├── components/
│   ├── ui/                             ✅ 20+ shadcn components
│   ├── layout/
│   │   ├── header.tsx                  ✅ Header with nav + team switcher
│   │   └── team-switcher.tsx           ✅ Team dropdown component
│   └── shared/                         📁 Created (empty)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ✅ Browser client
│   │   ├── server.ts                   ✅ Server client
│   │   └── middleware.ts               📁 (in root middleware.ts)
│   ├── ai/
│   │   ├── claude-client.ts            ✅ Claude API wrapper
│   │   └── prompt-builder.ts           ✅ Prompt construction (with rule groups)
│   ├── parsers/
│   │   └── gamechanger-csv.ts          ✅ CSV parser & player matcher
│   ├── hooks/
│   │   └── use-toast.ts                ✅ Toast hook
│   ├── validations/                    📁 Created (empty)
│   └── utils.ts                        ✅ Utility functions (cn)
├── types/
│   ├── database.ts                     ✅ Supabase types (auto-generated)
│   └── lineup.ts                       ✅ Lineup types (RuleGroup, PlayerForLineup)
├── supabase/
│   ├── migrations/
│   │   ├── initial_schema.sql          ✅ Complete schema
│   │   ├── 20260120210000_update_player_ratings.sql ✅ 14 player ratings
│   │   ├── 20260121000000_add_rule_groups.sql ✅ Rule groups table
│   │   ├── 20260121000001_add_position_strengths.sql ✅ Position strengths
│   │   ├── 20260121000002_add_player_notes.sql ✅ Coach notes
│   │   ├── 20260121000004_add_stats_analysis.sql ✅ Stats analysis JSONB
│   │   ├── 20260122000000_add_multi_team_support.sql ✅ Team description + index
│   │   ├── 20260127000000_add_billing.sql ✅ Profiles table + billing fields
│   │   ├── 20260127000001_fix_billing_trigger.sql ✅ Fix trigger schema
│   │   └── 20260127000002_add_subscription_period_end.sql ✅ Period end date
│   └── config.toml                     ✅ Supabase config
├── middleware.ts                       ✅ Auth middleware
├── .env.example                        ✅ Environment template
├── README.md                           ✅ Setup instructions
├── CHANGELOG.md                        📄 Version history
└── CLAUDE.md                           📄 This file
```

### 🧪 What Works Right Now

Even without credentials configured, you can test:
- ✅ App runs with `npm run dev`
- ✅ Homepage redirects to `/login`
- ✅ Login/signup forms are fully functional (UI only)
- ✅ Dashboard layout and navigation work
- ✅ Responsive design on mobile/desktop
- ✅ TypeScript compilation with no errors

### 📦 Packages Installed

**Core:**
- next@16.1.4, react@19.2.3, typescript@5.9.3

**Database & Auth:**
- @supabase/supabase-js@2.91.0, @supabase/ssr@0.8.0

**AI:**
- @anthropic-ai/sdk@0.71.2

**Forms & Validation:**
- react-hook-form@7.71.1, zod@4.3.5, @hookform/resolvers@5.2.2

**UI & Styling:**
- tailwindcss@3.4.1, tailwindcss-animate@1.0.7
- class-variance-authority@0.7.1, clsx@2.1.1, tailwind-merge@3.4.0
- lucide-react@0.562.0 (icons)

**Features:**
- @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0, @dnd-kit/utilities@3.2.2
- papaparse@5.5.3 (CSV parsing)
- date-fns@4.1.0 (date utilities)
- stripe (payment processing)

---

## ✅ Completed Phases

### Phase 2: Team & Roster Management ✅

#### Roster CRUD
- [x] `app/dashboard/roster/page.tsx` - Player list with table
- [x] `app/dashboard/roster/_components/roster-client.tsx` - Client component with CRUD
- [x] `app/dashboard/roster/_components/player-dialog.tsx` - Add/edit player dialog with tabs
- [x] Add, edit, delete player functionality
- [x] Player count display ("X/14 rated")

#### Player Ratings (14 Specific Ratings)
- [x] `app/dashboard/roster/_components/star-rating.tsx` - 1-5 star rating component
- [x] Batting ratings: Plate Discipline, Contact Ability, Run Speed, Batting Power
- [x] Fielding ratings: Fielding Hands, Throw Accuracy, Arm Strength, Fly Ball Ability
- [x] Mental ratings: Baseball IQ, Attention
- [x] Pitching ratings: Pitch Control, Pitch Velocity, Pitch Composure
- [x] Catching rating: Catcher Ability
- [x] Save ratings to `player_ratings` table (migration: `20260120210000_update_player_ratings.sql`)

#### Position Eligibility
- [x] `app/dashboard/roster/_components/position-toggles.tsx` - P/C/SS/1B toggles
- [x] Save eligibility to `position_eligibility` table

#### Position Strengths (NEW)
- [x] `app/dashboard/roster/_components/position-strength-editor.tsx` - Drag-drop position ordering
- [x] Ordered list of positions from strongest to weakest
- [x] Supports all 10 positions: P, C, 1B, 2B, 3B, SS, LF, CF, RF, OF (generic outfield)
- [x] Visual rank indicators (1st = primary position for AI)
- [x] Save to `players.position_strengths` column (TEXT[] array)
- [x] Migration: `20260121000001_add_position_strengths.sql`

#### Coach Notes (NEW)
- [x] Free-form text area in Ratings tab for coach observations
- [x] Save to `players.notes` column
- [x] Migration: `20260121000002_add_player_notes.sql`

---

### Phase 3: Rules & Games Setup ✅

#### Team Rules Management
- [x] `app/dashboard/rules/page.tsx` - Rules list and management
- [x] `app/dashboard/rules/_components/rules-client.tsx` - Client with drag-drop and group tabs
- [x] `app/dashboard/rules/_components/sortable-rule.tsx` - Draggable rule card
- [x] `app/dashboard/rules/_components/rule-dialog.tsx` - Add/edit rule dialog
- [x] Integrated @dnd-kit for drag-drop priority ordering
- [x] Active/inactive toggle per rule
- [x] Priority automatically updates on reorder

#### Rule Groups (NEW - Replaces Optimization Modes)
- [x] `app/dashboard/rules/_components/rule-group-dialog.tsx` - Create/edit rule groups
- [x] Rule groups replace hardcoded modes (competitive/balanced/developmental)
- [x] Each rule belongs to a specific group
- [x] Group tabs in Rules page for easy switching
- [x] Rules filtered by selected group
- [x] Save to `rule_groups` table with RLS policies
- [x] Migration: `20260121000000_add_rule_groups.sql`

#### Game Creation & Management
- [x] `app/dashboard/games/page.tsx` - Game list with Upcoming/Past tabs
- [x] `app/dashboard/games/_components/games-client.tsx` - Client with filtering
- [x] `app/dashboard/games/_components/game-card.tsx` - Game card with details
- [x] `app/dashboard/games/_components/game-dialog.tsx` - Add/edit game dialog
- [x] Filter games by upcoming vs past

#### Game Detail & Roster Setup
- [x] `app/dashboard/games/[gameId]/page.tsx` - Game detail page
- [x] `app/dashboard/games/[gameId]/_components/game-detail-client.tsx` - Game detail client
- [x] `app/dashboard/games/[gameId]/_components/roster-setup.tsx` - Roster availability
- [x] Player availability checkboxes
- [x] Pitching innings input per player
- [x] Restrictions/notes textarea
- [x] Save to `game_roster` table

---

## ✅ Phase 4: AI Integration & Lineup Generation ✅ COMPLETE

#### AI Infrastructure ✅
- [x] `lib/ai/claude-client.ts` - Claude API wrapper with error handling
  - `generateBattingOrder()` - Phase 1: batting order only
  - `generateDefensive()` - Phase 2: defensive positions with locked cells
  - Separate system prompts for each phase
- [x] `lib/ai/prompt-builder.ts` - Build prompt from database data
  - `buildBattingOrderPrompt()` - Batting order prompt construction
  - `buildDefensivePrompt()` - Defensive prompt with locked positions support
  - Includes rule group name in prompt context
  - Formats player position strengths for AI
- [x] `types/lineup.ts` - TypeScript types for AI responses
  - PlayerForLineup (includes position_strengths), TeamRule, GamePreference
  - BattingOrderEntry, DefensiveInning, RuleCheck
  - **NEW:** LockedPosition, GridCell, GenerationPhase types

#### Two-Phase Lineup Generation ✅
- [x] **Phase 1: Batting Order** - Generate batting order first
  - API accepts `phase: 'batting_order'`
  - Saves batting order to database immediately
  - Returns rationale for batting decisions
- [x] **Phase 2: Defensive Positions** - Fill remaining cells
  - API accepts `phase: 'defensive'` with `batting_order` and `locked_positions`
  - AI respects locked positions (coach decisions)
  - Supports `start_from_inning` for mid-game regeneration

#### Lineup Generation API ✅
- [x] `app/api/generate-lineup/route.ts` - Main generation endpoint
  - Two-phase generation support
  - Accepts `{ game_id, rule_group_id, phase, batting_order, locked_positions }`
  - Calls Claude API (claude-sonnet-4-5-20250929)
  - Parses JSON response, validates structure
  - Saves to `lineups` table with `rule_group_id` reference

#### Interactive Lineup Grid ✅
- [x] `app/dashboard/games/[gameId]/_components/lineup-grid.tsx` - Interactive grid
  - Players as rows (batting order), innings as columns
  - Click cell to open position dropdown (P, C, 1B, 2B, 3B, SS, LF, CF, RF, SIT)
  - **Position Auto-Swap:** Selecting a taken position removes it from other player
  - Visual indicators: lock icons, amber color for taken positions, ↔ for swaps
  - **Inning Locking:** Click inning header to lock/unlock entire inning
  - Locked innings prevent editing (visual: blue tint, lock icon, not-allowed cursor)
  - Always editable (coaches can make mid-game substitutions)
  - Mobile-responsive card view

#### Lineup Display UI ✅
- [x] `app/dashboard/games/[gameId]/_components/batting-order.tsx` - Batting order list
- [x] `app/dashboard/games/[gameId]/_components/defensive-grid.tsx` - Defensive grid (legacy)
- [x] `app/dashboard/games/[gameId]/_components/rule-compliance.tsx` - Rules check with ✅/⚠️
- [x] `app/dashboard/games/[gameId]/_components/lineup-display.tsx` - Combined lineup display
- [x] Rule group selector dropdown (replaces optimization mode selector)
- [x] Warning message when no rule groups exist with link to create one

#### Game Detail Client Rewrite ✅
- [x] `app/dashboard/games/[gameId]/_components/game-detail-client.tsx`
  - Phase-based workflow: setup → batting → defense → complete
  - State management: battingOrder, grid, lockedPositions, lockedInnings
  - `handleCellChange` with auto-swap logic
  - `handleLockInning` for inning-level locking
  - Collapsible rationale sections for AI explanations

#### ⏳ Remaining for Phase 4
- [ ] **BLOCKER: Add ANTHROPIC_API_KEY to .env.local** - Required for AI to work
- [ ] Test end-to-end lineup generation with real API

**Deliverable:** Full two-phase lineup generation with interactive editing ✅

---

### Phase 5: GameChanger CSV Import ✅ COMPLETE

#### CSV Parser ✅
- [x] `lib/parsers/gamechanger-csv.ts` - Parse CSV with papaparse
  - Parses GameChanger CSV format (category headers, column names, player data)
  - Handles batting stats: GP, PA, AB, AVG, OBP, SLG, OPS, H, 1B, 2B, 3B, HR, RBI, R, BB, SO, HBP, SB, CS
  - Handles fielding stats: TC, A, PO, FPCT, E, DP
  - Handles pitching stats: IP, ERA, WHIP, SO, BB, H, R, ER
  - Skips "Totals" and "Glossary" rows automatically
- [x] Player matching by jersey number (primary) and name (fallback)
- [x] Handles edge cases: missing columns, "-" values, percentages

#### Import UI & API ✅
- [x] `app/dashboard/import/page.tsx` - Server component with team/player data
- [x] `app/dashboard/import/_components/import-client.tsx` - Client component with:
  - Drag-and-drop file upload zone
  - Preview table showing parsed players
  - Match status indicators (matched by jersey#, matched by name, no match)
  - Import button to save matched stats
  - Clear Stats button to remove all imported data
- [x] `app/api/import/gamechanger/route.ts` - API endpoints:
  - POST: Parse CSV, match players by jersey number, upsert stats to database
  - DELETE: Clear all stats for team's players
  - Auth verification and team ownership checks
  - Inserts into `gamechanger_batting` / `gamechanger_fielding` tables
  - Uses season date for upsert behavior (re-import replaces existing)

**Deliverable:** Complete CSV import with stats integration ✅

---

### Phase 6: Polish & Deployment (Week 5)

#### Error Handling
- [ ] Error boundaries for all major sections
- [ ] Retry logic for API calls
- [ ] User-friendly error messages with Toast
- [ ] Validate all form inputs with Zod
- [ ] Handle edge cases:
  - 0 players available
  - Not enough eligible players for premium positions
  - Conflicting rules
  - API failures (Claude rate limits, Supabase downtime)

#### Loading States & UX
- [ ] Skeleton components for all data loading
- [ ] Optimistic updates where appropriate
- [ ] Empty states for all lists (roster, games, rules)
- [ ] Mobile responsiveness testing on real devices
- [ ] Confirmation dialogs for destructive actions
- [ ] Loading spinners for API calls

#### Deployment
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy to production
- [ ] Test on real mobile devices (iOS Safari, Android Chrome)
- [ ] Create example team with sample data
- [ ] Performance testing (Lighthouse)

**Deliverable:** Production-ready MVP deployed to Vercel

---

## ⚙️ Setup Required (Before Continuing Development)

### 1. Create Supabase Project (5 minutes)
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Save database password, project URL, and API keys
```

### 2. Link Local Project to Supabase
```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Push database schema
npx supabase db push

# Generate TypeScript types
mkdir -p types
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
```

### 3. Get Claude API Key (2 minutes)
```bash
# 1. Go to https://console.anthropic.com
# 2. Create API key
# 3. Copy key
```

### 4. Configure Environment Variables
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with your values:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
# ANTHROPIC_API_KEY=sk-ant-...
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Restart Development Server
```bash
# Kill existing server
# Then restart
npm run dev
```

---

## 📈 Progress Overview

### Completed: ~99%
- [x] Foundation & Infrastructure (Week 1) - **100%**
  - Project setup, dependencies, database schema
  - Authentication system, dashboard layout
  - UI component library

- [x] Team & Roster Management (Week 2) - **100%**
  - Roster CRUD with player dialog
  - 14 specific player ratings (batting, fielding, mental, pitching)
  - Position eligibility toggles (P, C, SS, 1B)
  - Position strengths with drag-drop ordering (10 positions)
  - Coach notes text field

- [x] Rules & Games Setup (Week 2-3) - **100%**
  - Rule Groups (replaces optimization modes)
  - Rules management with drag-drop priority
  - Group tabs for organizing rules
  - Games list with upcoming/past filters
  - Game detail page with roster setup
  - Player availability, pitching limits, restrictions

- [x] AI Integration & Lineup Generation (Week 3-4) - **100%**
  - Two-phase generation (batting order → defensive positions)
  - Interactive lineup grid with position dropdowns
  - Position auto-swap when selecting taken positions
  - Inning locking (click header to lock/unlock)
  - Claude API integration with phased prompts
  - **Remaining:** Test with real API key (ANTHROPIC_API_KEY)

- [x] GameChanger CSV Import (Week 4-5) - **100%**
  - CSV parser with papaparse
  - Player matching by jersey number and name
  - Import UI with drag-drop upload and preview
  - API endpoints for import and clear operations

- [x] Multi-Team Support (Week 5) - **100%**
  - Team-scoped URL structure (`/dashboard/[teamId]/...`)
  - Team switcher dropdown in header
  - Team management settings page
  - Roster import from CSV during team creation
  - Auth flow (password reset, email change)

### In Progress: ~2%
- [ ] Polish & Deployment (Week 5) - **0%**

### MVP Feature Checklist

**P0 Features (Must Have)**
- [x] Team Setup
- [x] Roster Management
- [x] Subjective Ratings (14 specific ratings, 1-5 scale)
- [x] Position Eligibility (P, C, SS, 1B flags)
- [x] Position Strengths (ordered list with drag-drop)
- [x] Coach Notes (free-form text per player)
- [x] Team Rules (with drag-drop priority)
- [x] Rule Groups (user-defined, replaces hardcoded modes)
- [x] Game Creation
- [x] Game Roster (availability, pitching limits, restrictions)
- [x] Lineup Generation (AI) - needs API key testing
- [x] Lineup Review (batting order, defense grid, rule compliance)
- [x] Position Editing (click cell to change position, auto-swap)
- [x] Inning Locking (click header to lock/unlock entire inning)

**P1 Features (Should Have - Included in MVP)**
- [x] GameChanger CSV Import
- [x] Multi-Team Support (team switcher, management, CSV roster import)
- [x] Auth Flow (password reset, email change)

**Out of Scope (Post-MVP)**
- ❌ Google OAuth
- ❌ Error monitoring (Sentry)
- ❌ Analytics (Posthog)
- ❌ Lineup history/versioning
- ❌ PWA/offline mode
- ❌ Screenshot OCR import
- ❌ Native mobile apps

---

## 🎯 Success Criteria

MVP is complete when:
- ✅ Coach can sign up and create team in < 5 minutes
- ✅ Coach can add roster and set ratings in < 10 minutes
- ✅ Lineup generation completes in < 10 seconds
- ✅ Generated lineups satisfy all team rules 100% of time
- ✅ CSV import works with real GameChanger exports
- ✅ All features work on mobile Safari and Chrome
- ✅ App is deployed to production on Vercel
- ✅ No TypeScript errors
- ✅ No console errors in production

---

## 📚 Reference Documentation

- **Build Plan:** `/lineup_ai_build_plan.md` - Complete technical specification
- **AI Prompts:** `/lineup_mvp_prompt.md` - Claude API prompt templates
- **Implementation Plan:** `/.claude/plans/ticklish-shimmying-cookie.md` - Detailed build phases
- **Setup Guide:** `/README.md` - Getting started instructions

---

## 🔄 Next Session

**Immediate Next Steps:**
1. Add `ANTHROPIC_API_KEY` to `.env.local` and test end-to-end lineup generation
2. Start Phase 6: Polish & Deployment
   - Error boundaries for all major sections
   - Loading skeletons and empty states
   - Mobile responsiveness testing
   - Deploy to Vercel

**Current Development Environment:**
- Using Supabase local development with Docker
- Run `npx supabase start` to start local database
- Run `npm run dev` to start Next.js dev server
- Access app at http://localhost:3000

**What's Working:**
- **Marketing landing page** at `/` for new visitors
- Full authentication flow (login/signup/password reset/email change)
- **Multi-team support** with team switcher and management
- **Roster import from CSV** during team creation or on roster page
- Roster management with 14 player ratings + position strengths + coach notes
- Rules management with drag-drop priority and rule groups
- Games management with upcoming/past filtering
- Game detail page with two-phase lineup generation
- Interactive defensive grid with position editing
- Position auto-swap when selecting a taken position
- Inning locking (click header to lock/unlock)
- **Regeneration with feedback** - provide instructions for AI adjustments
- **Multi-inning selection** - checkbox-based inning selection for regeneration
- GameChanger CSV import with player matching
- **Team Insights** - AI-powered team analysis on dashboard
- **Dismissible Getting Started** - Can hide and restore the onboarding guide
- **Game creation validation** - Blocks games until player data exists (ratings or GameChanger stats)

**Recent Changes (February 1, 2026 - v1.7.5):**
- **Simplified Regeneration Modal:**
  - Removed inning selection checkboxes — all unlocked positions are now regenerated every time
  - Updated dialog description to clarify behavior
  - Simplified Regenerate button (no inning count display)
  - Added `GenerationLoading` feedback during regeneration in the complete phase (rotating messages, elapsed timer, cancel button)

**Previous Changes (v1.7.4 - February 1, 2026):**
- **Removed Coach Ratings from Stats & Team Analysis Prompts:**
  - Stats analysis now based purely on GameChanger statistics (no subjective coach ratings)
  - Removed `player_ratings` DB query and `ratings` field from player data in `/api/stats/analyze`
  - Updated prompt text: "based on their GameChanger statistics" (was "based on their statistics and coach ratings")
  - Removed "Coach subjective ratings (1-5 scale)" from `STATS_ANALYSIS_SYSTEM_PROMPT` inputs
  - Removed "Mental: Baseball IQ, Focus, Composure" category (purely coach-rated, no GameChanger equivalent)
  - Team analysis unaffected — already receives aggregate stats + player summaries from player analysis

**Previous Changes (v1.7.3 - February 1, 2026):**
- **Upgraded AI Model:**
  - Replaced `claude-sonnet-4-20250514` with `claude-sonnet-4-5-20250929` across all 5 API calls
  - Affects: lineup generation, batting order, defensive positions, stats analysis, team analysis

**Previous Changes (v1.7.2 - February 1, 2026):**
- **Conditional Marketing Site Pricing Text:**
  - Hero and CTA sections show dynamic text based on `BILLING_ENABLED` env var
  - Billing enabled: "14-Day Free Trial. No Credit Card Needed. $10/month after. Unlimited Teams."
  - Billing disabled/unset: "Free during beta. No credit card required."
  - `billingEnabled` prop added to `HeroSection` and `CTASection` components

**Previous Changes (v1.7.1 - February 1, 2026):**
- Stripe Billing Production Fixes (webhook redirect, current_period_end, cancellation detection, resubscription via Portal)
- Email Confirmation Flow (success message on login, token_hash verification, Suspense boundary)

**Previous Changes (v1.7.0 - January 27, 2026):**
- **Stripe Billing Integration:**
  - $10/month subscription with 14-day free trial (no credit card required)
  - Profiles table with billing fields (stripe_customer_id, subscription_status, trial_ends_at)
  - Middleware billing access check (redirects expired trials to /subscribe)
  - Stripe customer creation on signup via auth callback
  - Subscribe page with trial status and feature list
  - Billing APIs: create-checkout, create-portal, webhook handler
  - Billing settings page showing subscription status and next billing/access date
  - Feature flag: BILLING_ENABLED=true/false for instant rollback
  - Webhook updates subscription_status and subscription_period_end

**Previous Changes (v1.6.0 - January 26, 2026):**
- **Dashboard - Anthropic Light Mode:**
  - Applied warm Anthropic aesthetic to the dashboard (light mode variant)
  - New CSS variables: cream background (#faf9f6), terracotta primary (#d97757)
  - Warm charcoal text, warm gray borders and muted text
  - Header uses card background with terracotta active nav states
  - Mobile menu updated with matching hover/active styles
  - All shadcn/ui components automatically inherit new palette

**Previous Changes (v1.5.0 - January 26, 2026):**
- **Marketing Site Redesign - Anthropic Design Language:**
  - Complete visual overhaul with dark, minimalist, tech-centric aesthetic
  - New color palette: Dark slate backgrounds, cream text, terracotta accents
  - Fluid typography with responsive `clamp()`-based sizing
  - New animations: `fade-in-up`, `text-reveal`, `scale-in`, `glow-pulse`
  - Hero section: Dot grid texture, vignette effect, glowing CTAs
  - All sections updated: Header, Features, Control, Showcase, How It Works, CTA, Footer
  - All 6 example components restyled for dark theme

**Previous Changes (v1.4.0 - January 26, 2026):**
- **Marketing Page Feature Showcase:**
  - New "See It In Action" section with 6 interactive example tabs
  - Example components: Lineup Grid, Batting Order, Defense, Player Insights, Team Insights, Roster Setup
  - All examples use mock data to demonstrate app features
- **"You Set the Strategy" Control Section:**
  - Interactive mockup of game setup dropdowns (Rule Group, Game Priority, Data Weighting)
  - Shows coaches exactly how they configure AI lineup generation
  - Lock feature callout emphasizing coach control
- **Updated Marketing Messaging:**
  - Hero: "Your Lineup Assistant" with value prop badges
  - Features: Now focused on AI power and data integration (6 cards)
  - How It Works: Added time estimates (~1 min, ~5 sec)
  - CTA: Added benefit checkmarks

**Previous Changes (v1.3.0 - January 26, 2026):**
- **Marketing Landing Page:**
  - New public landing page at `/` with hero, features, how-it-works, and CTA sections
  - `(marketing)` route group keeps marketing pages separate from app
  - Responsive design with mobile-first layout
  - Sticky header with Peanut Manager branding

**Previous Changes (v1.2.7 - January 25, 2026):**
- **Fixed Roster Page State Not Updating After Mutations:**
  - Adding, updating, or importing players now immediately updates the UI
  - Removed `router.refresh()` in favor of local state updates with `setPlayers()`
  - Import callback now receives and adds imported player objects to state

**Previous Changes (v1.2.6 - January 25, 2026):**
- **Fixed Team Switcher 404 on Game Detail Page:**
  - Switching teams while on `/dashboard/[teamId]/games/[gameId]` no longer causes 404
  - Now navigates to `/dashboard/[newTeamId]/games` instead of preserving the game ID

**Previous Changes (v1.2.5 - January 25, 2026):**
- **Dynamic Data Weighting Unavailable Message:**
  - Message now indicates which specific data type is missing (coach ratings, GameChanger stats, or both)

**Previous Changes (v1.2.4 - January 25, 2026):**
- **Fixed Data Weighting Dropdown Visibility:**
  - Dropdown now only appears when BOTH GameChanger data AND coach ratings exist

**Previous Changes (v1.2.3 - January 25, 2026):**
- **Auto-scroll to Generation Loading Feedback:**
  - GenerationLoading component now scrolls into view when it mounts
  - Uses smooth scroll behavior with `block: 'center'` for optimal visibility
  - Prevents users from thinking the system is stuck when loading indicator appears below viewport

**Previous Changes (v1.2.2 - January 24, 2026):**
- **Game Creation Validation Gate:**
  - Blocks game creation when no lineup data exists
  - Requires either: GameChanger stats imported OR all players have at least 1 rating
  - Shows warning card with links to Roster (with progress) and Stats pages
  - Prevents coaches from creating games before setting up player data

**Previous Changes (v1.2.1 - January 24, 2026):**
- **Rule Group Dropdown UX Improvement:**
  - Replaced amber warning with subtle info note when no rule groups exist
  - Uses muted styling with dashed border (matches Data Weighting style)
  - Inline link to create rule groups instead of button
  - Generate button now enabled even without rule groups

**Previous Changes (v1.2.0 - January 24, 2026):**
- **Fixed Duplicate Players in Batting Order:**
  - AI sometimes returned the same player multiple times
  - Added deduplication logic using Set<string> to track seen player IDs
- **Fixed Empty Defensive Positions:**
  - AI sometimes left positions unfilled (e.g., 6 empty despite 8 locked)
  - Added explicit requirements in AI prompts that ALL 9 positions must be filled
  - Added post-processing validation to fill missing positions with unassigned players
- **Enforced Pitcher Re-entry Rule:**
  - Baseball rule: once a pitcher is pulled, they cannot return to pitch
  - Added PITCHER RULE to AI prompts explaining the constraint
  - Added post-processing validation that tracks pitcher status and auto-swaps if violated

**Previous Changes (v1.1.0 - January 23, 2026):**
- Mobile hamburger menu for navigation
- Rebrand to "Peanut Manager" with Pacifico font
- Example rules section on Rules page

**Previous Changes (v1.0.0 - January 22, 2026):**
- Team Dashboard with AI-powered team insights
- Dismissible Getting Started guide
- Stats page shows when AI analysis was last generated
- Fixed blank positions after lineup generation (name fallback matching)

**Previous Changes (v0.99.0):**
- **Regeneration Feedback System:**
  - Coaches can now provide feedback when regenerating defensive positions
  - Text field for instructions like "Move Jake to outfield" or "Cole should pitch inning 3"
  - AI receives current lineup context along with feedback for targeted adjustments
- **Multi-Inning Selection:**
  - Replaced single dropdown with checkboxes for each inning
  - "Select All" checkbox for quick full regeneration
  - Grid layout (3 columns) for compact display
  - Select specific innings to regenerate instead of "from inning X onward"

**Previous Changes (v0.98.0):**
- **UI Simplification:**
  - Removed unused team fields: League Name, Team Description
  - Removed team-level Innings Per Game (now only at game level)
  - Removed game Location/Field input
  - Simplified TeamContext for AI prompts (only name and age_group)

---

**Last Updated:** February 1, 2026
**Version:** 1.7.5 (Simplify regeneration modal, add regeneration loading feedback)
