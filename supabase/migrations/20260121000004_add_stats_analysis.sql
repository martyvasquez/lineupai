-- Add stats_analysis column to players table for AI-generated analysis
ALTER TABLE players ADD COLUMN IF NOT EXISTS stats_analysis JSONB;

-- Add analyzed_at timestamp to track when analysis was last generated
ALTER TABLE players ADD COLUMN IF NOT EXISTS stats_analyzed_at TIMESTAMPTZ;

COMMENT ON COLUMN players.stats_analysis IS 'AI-generated analysis of player strengths and weaknesses based on GameChanger stats';
COMMENT ON COLUMN players.stats_analyzed_at IS 'Timestamp of when the stats analysis was last generated';
