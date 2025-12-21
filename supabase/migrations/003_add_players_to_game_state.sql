-- ============================================
-- PAPER DUNGEON - ADD PLAYERS TO GAME STATE
-- Migration to store player state in game_state for real-time sync
-- ============================================

-- Add players column to store serialized player state for sync
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]';
