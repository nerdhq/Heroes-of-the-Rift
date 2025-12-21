-- ============================================
-- PAPER DUNGEON - ADD ACTION MESSAGES
-- Migration for syncing action messages across players
-- ============================================

-- Add action_messages column for syncing floating action text
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS action_messages JSONB DEFAULT '[]';
