# Peanut Manager - Youth Baseball Lineup Optimizer

AI-powered lineup generation for youth baseball and softball coaches using GameChanger statistics, subjective ratings, and team-specific rules.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** Claude API (Anthropic)
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in project details:
   - Project name: `baseball-lineups` (or your choice)
   - Database password: (save this securely!)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Get Supabase API Keys

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### 3. Link Local Project to Supabase

```bash
# Link your local project to Supabase
npx supabase link --project-ref <your-project-ref>

# The project-ref is in your Project URL:
# https://<project-ref>.supabase.co
```

### 4. Run Database Migrations

```bash
# Push the schema to your Supabase database
npx supabase db push
```

This will create all the tables, views, Row Level Security policies, and indexes.

### 5. Generate TypeScript Types

```bash
# Generate TypeScript types from your database schema
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
```

### 6. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ANTHROPIC_API_KEY=sk-ant-your-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 7. Get Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/log in
3. Go to **API Keys**
4. Create a new API key
5. Copy and add to `.env.local`

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
baseball-lineups/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main app pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── shared/            # Shared components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── ai/                # Claude AI integration
│   ├── parsers/           # GameChanger CSV parsing & player matching
│   ├── hooks/             # React hooks
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Utility functions (cn)
├── types/                 # TypeScript types
├── supabase/
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## Development Workflow

1. Make changes to code
2. Test locally with `npm run dev`
3. Run type checking with `npm run lint`
4. Build for production with `npm run build`

## Database Migrations

When you need to modify the database schema:

```bash
# Create a new migration
npx supabase migration new <migration-name>

# Edit the migration file in supabase/migrations/

# Apply the migration
npx supabase db push

# Regenerate TypeScript types
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy!

## Features

### MVP (P0)
- ✅ Team setup and roster management
- ✅ Subjective player ratings (1-5 scale)
- ✅ Position eligibility flags
- ✅ Team rules (natural language)
- ✅ Game creation and roster availability
- ✅ AI-powered lineup generation
- ✅ Lineup review and manual override
- ✅ GameChanger CSV import

### Post-MVP (P1)
- Mid-game adjustments
- Lineup history
- Multi-team support
- Google OAuth

## Support

For issues or questions:
- Check the [implementation plan](/.claude/plans/)
- Review the [build plan](./lineup_ai_build_plan.md)
- Check the [AI prompt template](./lineup_mvp_prompt.md)

## License

Proprietary
