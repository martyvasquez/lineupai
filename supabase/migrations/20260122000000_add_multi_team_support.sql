-- Add team description for AI context
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN teams.description IS 'Free-form description for AI context (e.g., 12U travel ball in competitive league)';

-- Index for faster team lookups by user
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
