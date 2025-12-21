-- ============================================
-- PAPER DUNGEON - ADD PLAYER SELECTIONS
-- Migration for simultaneous play mode
-- ============================================

-- Add player_selections column for tracking each player's card/target selection
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS player_selections JSONB DEFAULT '[]';
