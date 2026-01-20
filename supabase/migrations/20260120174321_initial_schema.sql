-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  league_name TEXT,
  age_group TEXT,
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
  season TEXT,
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

-- Supplemental Metrics
CREATE TABLE player_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
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
  tc INT DEFAULT 0,
  po INT DEFAULT 0,
  a INT DEFAULT 0,
  e INT DEFAULT 0,
  dp INT DEFAULT 0,
  innings_by_position JSONB,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Season Aggregated Stats (views)
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

-- Team Rules
CREATE TABLE team_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  priority INT DEFAULT 0,
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
  status TEXT DEFAULT 'scheduled',
  our_score INT,
  their_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Day Roster
CREATE TABLE game_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  pitching_innings_available INT DEFAULT 0,
  restrictions TEXT,
  UNIQUE(game_id, player_id)
);

-- Game Preferences
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
  optimization_mode TEXT,
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
  adjustments JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id)
);

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamechanger_batting ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamechanger_fielding ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own teams"
  ON teams FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage players on their teams"
  ON players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = players.team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage player_ratings" ON player_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM players p JOIN teams t ON p.team_id = t.id
      WHERE p.id = player_ratings.player_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage position_eligibility" ON position_eligibility
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM players p JOIN teams t ON p.team_id = t.id
      WHERE p.id = position_eligibility.player_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage player_metrics" ON player_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM players p JOIN teams t ON p.team_id = t.id
      WHERE p.id = player_metrics.player_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage gamechanger_batting" ON gamechanger_batting
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM players p JOIN teams t ON p.team_id = t.id
      WHERE p.id = gamechanger_batting.player_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage gamechanger_fielding" ON gamechanger_fielding
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM players p JOIN teams t ON p.team_id = t.id
      WHERE p.id = gamechanger_fielding.player_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage team_rules" ON team_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_rules.team_id AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage games" ON games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = games.team_id AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage game_roster" ON game_roster
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM games g JOIN teams t ON g.team_id = t.id
      WHERE g.id = game_roster.game_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage game_preferences" ON game_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM games g JOIN teams t ON g.team_id = t.id
      WHERE g.id = game_preferences.game_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage lineups" ON lineups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM games g JOIN teams t ON g.team_id = t.id
      WHERE g.id = lineups.game_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage game_state" ON game_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM games g JOIN teams t ON g.team_id = t.id
      WHERE g.id = game_state.game_id AND t.created_by = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_player_ratings_player_id ON player_ratings(player_id);
CREATE INDEX idx_position_eligibility_player_id ON position_eligibility(player_id);
CREATE INDEX idx_player_metrics_player_id ON player_metrics(player_id);
CREATE INDEX idx_gamechanger_batting_player_id ON gamechanger_batting(player_id);
CREATE INDEX idx_gamechanger_fielding_player_id ON gamechanger_fielding(player_id);
CREATE INDEX idx_team_rules_team_id ON team_rules(team_id);
CREATE INDEX idx_games_team_id ON games(team_id);
CREATE INDEX idx_game_roster_game_id ON game_roster(game_id);
CREATE INDEX idx_game_roster_player_id ON game_roster(player_id);
CREATE INDEX idx_game_preferences_game_id ON game_preferences(game_id);
CREATE INDEX idx_lineups_game_id ON lineups(game_id);
CREATE INDEX idx_game_state_game_id ON game_state(game_id);
