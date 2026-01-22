-- Migration: Add Rule Groups
-- Replace optimization modes with user-defined rule groups

-- Create rule_groups table
CREATE TABLE rule_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Create index for team_id lookups
CREATE INDEX idx_rule_groups_team_id ON rule_groups(team_id);

-- Add rule_group_id column to team_rules (nullable to support migration)
ALTER TABLE team_rules ADD COLUMN rule_group_id UUID REFERENCES rule_groups(id) ON DELETE CASCADE;

-- Create index for rule_group_id lookups
CREATE INDEX idx_team_rules_rule_group_id ON team_rules(rule_group_id);

-- Add rule_group_id column to lineups (keep optimization_mode for backward compatibility)
ALTER TABLE lineups ADD COLUMN rule_group_id UUID REFERENCES rule_groups(id) ON DELETE SET NULL;

-- Create index for lineups rule_group_id
CREATE INDEX idx_lineups_rule_group_id ON lineups(rule_group_id);

-- Enable Row Level Security on rule_groups
ALTER TABLE rule_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rule_groups
-- Users can view rule groups for teams they created
CREATE POLICY "Users can view their team's rule groups"
  ON rule_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = rule_groups.team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Users can insert rule groups for teams they created
CREATE POLICY "Users can create rule groups for their teams"
  ON rule_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = rule_groups.team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Users can update rule groups for teams they created
CREATE POLICY "Users can update their team's rule groups"
  ON rule_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = rule_groups.team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Users can delete rule groups for teams they created
CREATE POLICY "Users can delete their team's rule groups"
  ON rule_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = rule_groups.team_id
      AND teams.created_by = auth.uid()
    )
  );
