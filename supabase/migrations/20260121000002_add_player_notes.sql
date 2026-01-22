-- Migration: Add notes column to players table
-- Stores coach's notes about each player

ALTER TABLE players ADD COLUMN notes TEXT;

COMMENT ON COLUMN players.notes IS 'Free-form coach notes about the player';
