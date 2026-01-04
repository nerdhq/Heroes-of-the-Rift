-- ============================================
-- ADD RESOLVE PHASE TO GAME STATE
-- For simultaneous action resolution in online mode
-- ============================================

-- Drop the old constraint and add the new one with RESOLVE phase
ALTER TABLE game_state DROP CONSTRAINT IF EXISTS valid_phase;

ALTER TABLE game_state ADD CONSTRAINT valid_phase CHECK (
  phase IN ('DRAW', 'SELECT', 'TARGET_SELECT', 'AGGRO', 'PLAYER_ACTION', 'RESOLVE', 'MONSTER_ACTION', 'DEBUFF_RESOLUTION', 'END_TURN')
);
