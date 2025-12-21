-- ============================================
-- PAPER DUNGEON - ADD DECK COLUMNS
-- Migration to add deck building fields to game_players
-- ============================================

-- Add deck column to store selected card IDs during deck building
ALTER TABLE game_players
ADD COLUMN IF NOT EXISTS deck JSONB DEFAULT NULL;

-- Add deck_confirmed column to track when player has finalized their deck
ALTER TABLE game_players
ADD COLUMN IF NOT EXISTS deck_confirmed BOOLEAN DEFAULT false;
