-- ============================================
-- CHAMPIONS TABLE
-- Persistent character progression
-- ============================================

CREATE TABLE champions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Basic info
  name TEXT NOT NULL,
  class_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Progression
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  unspent_stat_points INTEGER NOT NULL DEFAULT 0,

  -- Attributes (6 core stats)
  attributes JSONB NOT NULL DEFAULT '{"STR": 10, "AGI": 10, "CON": 10, "INT": 10, "WIS": 10, "LCK": 10}',

  -- Economy (per-champion)
  gold INTEGER NOT NULL DEFAULT 50,
  owned_cards JSONB NOT NULL DEFAULT '[]',

  -- Lifetime stats
  stats JSONB NOT NULL DEFAULT '{
    "gamesPlayed": 0,
    "gamesWon": 0,
    "monstersKilled": 0,
    "bossesKilled": 0,
    "totalDamageDealt": 0,
    "totalHealingDone": 0,
    "totalGoldEarned": 0,
    "roundsCompleted": 0,
    "deaths": 0
  }',

  CONSTRAINT valid_class_type CHECK (
    class_type IN ('warrior', 'rogue', 'paladin', 'mage', 'priest', 'bard', 'archer', 'barbarian')
  ),
  CONSTRAINT valid_level CHECK (level >= 1),
  CONSTRAINT valid_xp CHECK (xp >= 0),
  CONSTRAINT valid_gold CHECK (gold >= 0)
);

-- Indexes
CREATE INDEX idx_champions_user ON champions(user_id);
CREATE INDEX idx_champions_class ON champions(class_type);

-- RLS Policies
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own champions"
  ON champions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own champions"
  ON champions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own champions"
  ON champions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own champions"
  ON champions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ADD ACTIVE CHAMPION TO PROFILES
-- ============================================

ALTER TABLE profiles
  ADD COLUMN active_champion_id UUID REFERENCES champions(id) ON DELETE SET NULL,
  ADD COLUMN max_champion_slots INTEGER NOT NULL DEFAULT 3;

-- ============================================
-- ADD CHAMPION REFERENCE TO GAME_PLAYERS
-- ============================================

ALTER TABLE game_players
  ADD COLUMN champion_id UUID REFERENCES champions(id);

-- ============================================
-- ADD ATTRIBUTES TO PLAYER_STATE
-- ============================================

ALTER TABLE player_state
  ADD COLUMN champion_id UUID REFERENCES champions(id),
  ADD COLUMN attributes JSONB DEFAULT '{"STR": 10, "AGI": 10, "CON": 10, "INT": 10, "WIS": 10, "LCK": 10}';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Create a new champion
CREATE OR REPLACE FUNCTION create_champion(
  p_name TEXT,
  p_class_type TEXT,
  p_starter_cards JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  v_champion_id UUID;
  v_champion_count INTEGER;
  v_max_slots INTEGER;
BEGIN
  -- Check slot limit
  SELECT COUNT(*), COALESCE(max_champion_slots, 3)
  INTO v_champion_count, v_max_slots
  FROM champions c
  RIGHT JOIN profiles p ON p.id = auth.uid()
  WHERE c.user_id = auth.uid()
  GROUP BY p.max_champion_slots;

  IF v_champion_count >= v_max_slots THEN
    RAISE EXCEPTION 'Maximum champion slots reached';
  END IF;

  -- Create champion
  INSERT INTO champions (user_id, name, class_type, owned_cards)
  VALUES (auth.uid(), p_name, p_class_type, p_starter_cards)
  RETURNING id INTO v_champion_id;

  -- Set as active champion
  UPDATE profiles
  SET active_champion_id = v_champion_id
  WHERE id = auth.uid();

  RETURN v_champion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add XP to champion and handle level ups
CREATE OR REPLACE FUNCTION add_champion_xp(
  p_champion_id UUID,
  p_xp_amount INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_champion champions%ROWTYPE;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_xp_to_next INTEGER;
  v_new_stat_points INTEGER;
  v_levels_gained INTEGER := 0;
BEGIN
  -- Get champion (verify ownership)
  SELECT * INTO v_champion
  FROM champions
  WHERE id = p_champion_id AND user_id = auth.uid();

  IF v_champion IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Champion not found');
  END IF;

  v_new_xp := v_champion.xp + p_xp_amount;
  v_new_level := v_champion.level;
  v_new_xp_to_next := v_champion.xp_to_next_level;
  v_new_stat_points := v_champion.unspent_stat_points;

  -- Process level ups
  WHILE v_new_xp >= v_new_xp_to_next LOOP
    v_new_xp := v_new_xp - v_new_xp_to_next;
    v_new_level := v_new_level + 1;
    v_levels_gained := v_levels_gained + 1;

    -- Calculate XP for next level
    IF v_new_level <= 10 THEN
      v_new_xp_to_next := FLOOR(100 * POWER(1.5, v_new_level - 1));
    ELSIF v_new_level <= 20 THEN
      v_new_xp_to_next := 5000 + 1000 * (v_new_level - 10);
    ELSE
      v_new_xp_to_next := 15000 + 2000 * (v_new_level - 20);
    END IF;

    -- Add stat points for level
    IF v_new_level <= 10 THEN
      v_new_stat_points := v_new_stat_points + 3;
    ELSIF v_new_level <= 20 THEN
      v_new_stat_points := v_new_stat_points + 2;
    ELSE
      v_new_stat_points := v_new_stat_points + 1;
    END IF;
  END LOOP;

  -- Update champion
  UPDATE champions
  SET
    xp = v_new_xp,
    level = v_new_level,
    xp_to_next_level = v_new_xp_to_next,
    unspent_stat_points = v_new_stat_points
  WHERE id = p_champion_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'xp_to_next_level', v_new_xp_to_next,
    'levels_gained', v_levels_gained,
    'unspent_stat_points', v_new_stat_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allocate a stat point
CREATE OR REPLACE FUNCTION allocate_stat_point(
  p_champion_id UUID,
  p_stat TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_champion champions%ROWTYPE;
  v_current_value INTEGER;
  v_cost INTEGER;
  v_new_attributes JSONB;
BEGIN
  -- Validate stat name
  IF p_stat NOT IN ('STR', 'AGI', 'CON', 'INT', 'WIS', 'LCK') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid stat');
  END IF;

  -- Get champion (verify ownership)
  SELECT * INTO v_champion
  FROM champions
  WHERE id = p_champion_id AND user_id = auth.uid();

  IF v_champion IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Champion not found');
  END IF;

  -- Get current stat value
  v_current_value := (v_champion.attributes->>p_stat)::INTEGER;

  -- Check hard cap
  IF v_current_value >= 99 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stat at maximum');
  END IF;

  -- Calculate cost (soft cap at 50)
  IF v_current_value >= 50 THEN
    v_cost := 2;
  ELSE
    v_cost := 1;
  END IF;

  -- Check points
  IF v_champion.unspent_stat_points < v_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough stat points');
  END IF;

  -- Update attributes
  v_new_attributes := v_champion.attributes || jsonb_build_object(p_stat, v_current_value + 1);

  UPDATE champions
  SET
    attributes = v_new_attributes,
    unspent_stat_points = unspent_stat_points - v_cost
  WHERE id = p_champion_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_value', v_current_value + 1,
    'remaining_points', v_champion.unspent_stat_points - v_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for champions
ALTER PUBLICATION supabase_realtime ADD TABLE champions;
