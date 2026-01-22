-- Migration: Add scouting report to games table
-- Stores coach's scouting notes about the opposing team

ALTER TABLE games ADD COLUMN scouting_report TEXT;

COMMENT ON COLUMN games.scouting_report IS 'Scouting notes about the opposing team for AI lineup optimization';
