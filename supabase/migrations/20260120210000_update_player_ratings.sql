-- Update player_ratings table with new subjective rating categories
-- Drop old columns
ALTER TABLE player_ratings DROP COLUMN IF EXISTS batting;
ALTER TABLE player_ratings DROP COLUMN IF EXISTS infield;
ALTER TABLE player_ratings DROP COLUMN IF EXISTS outfield;
ALTER TABLE player_ratings DROP COLUMN IF EXISTS pitching;
ALTER TABLE player_ratings DROP COLUMN IF EXISTS catching;

-- Add new rating columns (1-5 scale)
ALTER TABLE player_ratings ADD COLUMN plate_discipline INT CHECK (plate_discipline BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN contact_ability INT CHECK (contact_ability BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN run_speed INT CHECK (run_speed BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN batting_power INT CHECK (batting_power BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN fielding_hands INT CHECK (fielding_hands BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN fielding_throw_accuracy INT CHECK (fielding_throw_accuracy BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN fielding_arm_strength INT CHECK (fielding_arm_strength BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN baseball_iq INT CHECK (baseball_iq BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN attention INT CHECK (attention BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN fly_ball_ability INT CHECK (fly_ball_ability BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN pitch_control INT CHECK (pitch_control BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN pitch_velocity INT CHECK (pitch_velocity BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN pitch_composure INT CHECK (pitch_composure BETWEEN 1 AND 5);
ALTER TABLE player_ratings ADD COLUMN catcher_ability INT CHECK (catcher_ability BETWEEN 1 AND 5);
