-- Add team_analysis column to teams table for AI-generated team-level insights
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_analysis JSONB;

-- Add analyzed_at timestamp to track when team analysis was last generated
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_analyzed_at TIMESTAMPTZ;

-- Add stats_imported_at to track when GameChanger stats were last imported
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stats_imported_at TIMESTAMPTZ;

COMMENT ON COLUMN teams.team_analysis IS 'AI-generated team-level analysis including strengths, weaknesses, and practice recommendations';
COMMENT ON COLUMN teams.team_analyzed_at IS 'Timestamp of when the team analysis was last generated';
COMMENT ON COLUMN teams.stats_imported_at IS 'Timestamp of when GameChanger stats were last imported for this team';
