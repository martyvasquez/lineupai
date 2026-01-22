-- Migration: Add position strengths to players
-- Stores an ordered array of positions from strongest to weakest

-- Add position_strengths column to players table
-- Stores positions as an ordered array: first element = strongest position
ALTER TABLE players ADD COLUMN position_strengths TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN players.position_strengths IS 'Ordered array of positions from strongest to weakest. E.g., {"SS", "2B", "CF"}';
