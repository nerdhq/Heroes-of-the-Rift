-- ============================================
-- PAPER DUNGEON - INITIAL SCHEMA
-- Online Multiplayer Database Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- GAMES TABLE
-- ============================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  max_players INTEGER DEFAULT 5 CHECK (max_players >= 1 AND max_players <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winner_status TEXT,

  CONSTRAINT valid_status CHECK (status IN ('waiting', 'class_select', 'deck_building', 'in_progress', 'completed', 'abandoned'))
);

-- Indexes for games
CREATE INDEX idx_games_code ON games(code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_host ON games(host_id);

-- RLS Policies for games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update game"
  ON games FOR UPDATE USING (auth.uid() = host_id);

-- ============================================
-- GAME PLAYERS TABLE
-- ============================================
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  player_index INTEGER NOT NULL,
  class_type TEXT,
  hero_name TEXT,
  is_ready BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, user_id),
  UNIQUE(game_id, player_index),

  CONSTRAINT valid_class_type CHECK (
    class_type IS NULL OR
    class_type IN ('warrior', 'rogue', 'paladin', 'mage', 'priest', 'bard', 'archer', 'barbarian')
  )
);

-- Indexes for game_players
CREATE INDEX idx_game_players_game ON game_players(game_id);
CREATE INDEX idx_game_players_user ON game_players(user_id);

-- RLS Policies for game_players
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game players"
  ON game_players FOR SELECT USING (true);

CREATE POLICY "Users can join games"
  ON game_players FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player data"
  ON game_players FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Host can remove players or players can leave"
  ON game_players FOR DELETE USING (
    auth.uid() IN (SELECT host_id FROM games WHERE id = game_id)
    OR auth.uid() = user_id
  );

-- ============================================
-- GAME STATE TABLE
-- ============================================
CREATE TABLE game_state (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,

  -- Core game state
  phase TEXT NOT NULL DEFAULT 'DRAW',
  current_player_index INTEGER NOT NULL DEFAULT 0,
  turn INTEGER NOT NULL DEFAULT 1,
  round INTEGER NOT NULL DEFAULT 1,
  max_rounds INTEGER NOT NULL DEFAULT 6,

  -- Environment and monsters (JSONB for flexibility)
  environment JSONB,
  monsters JSONB NOT NULL DEFAULT '[]',

  -- Selection state
  selected_card_id TEXT,
  selected_target_id TEXT,
  drawn_cards JSONB DEFAULT '[]',

  -- Game log
  log JSONB DEFAULT '[]',

  -- State version for optimistic concurrency control
  version INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_action_at TIMESTAMPTZ DEFAULT NOW(),
  turn_started_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_phase CHECK (
    phase IN ('DRAW', 'SELECT', 'TARGET_SELECT', 'AGGRO', 'PLAYER_ACTION', 'MONSTER_ACTION', 'DEBUFF_RESOLUTION', 'END_TURN')
  )
);

-- RLS Policies for game_state
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game players can view state"
  ON game_state FOR SELECT USING (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Game players can update state"
  ON game_state FOR UPDATE USING (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Game players can insert state"
  ON game_state FOR INSERT WITH CHECK (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

-- ============================================
-- PLAYER STATE TABLE
-- ============================================
CREATE TABLE player_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  game_player_id UUID REFERENCES game_players(id) ON DELETE CASCADE NOT NULL,

  -- Player stats
  hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  shield INTEGER NOT NULL DEFAULT 0,
  base_aggro INTEGER NOT NULL DEFAULT 0,
  dice_aggro INTEGER NOT NULL DEFAULT 0,
  resource INTEGER NOT NULL DEFAULT 0,
  max_resource INTEGER NOT NULL,
  gold INTEGER NOT NULL DEFAULT 0,

  -- Status flags
  is_alive BOOLEAN NOT NULL DEFAULT true,
  is_stealth BOOLEAN NOT NULL DEFAULT false,
  has_taunt BOOLEAN NOT NULL DEFAULT false,
  is_stunned BOOLEAN NOT NULL DEFAULT false,
  accuracy_penalty INTEGER NOT NULL DEFAULT 0,

  -- Buffs/Debuffs (JSONB arrays)
  buffs JSONB DEFAULT '[]',
  debuffs JSONB DEFAULT '[]',

  -- Cards (JSONB arrays)
  deck JSONB NOT NULL DEFAULT '[]',
  discard JSONB DEFAULT '[]',
  hand JSONB DEFAULT '[]',

  UNIQUE(game_id, game_player_id)
);

-- Indexes for player_state
CREATE INDEX idx_player_state_game ON player_state(game_id);
CREATE INDEX idx_player_state_player ON player_state(game_player_id);

-- RLS Policies for player_state
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game players can view all player states"
  ON player_state FOR SELECT USING (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Game players can update player states"
  ON player_state FOR UPDATE USING (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Game players can insert player states"
  ON player_state FOR INSERT WITH CHECK (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

-- ============================================
-- GAME ACTIONS TABLE (Audit Trail)
-- ============================================
CREATE TABLE game_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB,
  state_version INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game_actions
CREATE INDEX idx_game_actions_game ON game_actions(game_id);
CREATE INDEX idx_game_actions_created ON game_actions(created_at);

-- RLS Policies for game_actions
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game players can view actions"
  ON game_actions FOR SELECT USING (
    game_id IN (SELECT game_id FROM game_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Players can insert own actions"
  ON game_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate unique 6-character game code
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Create a new game
CREATE OR REPLACE FUNCTION create_game(p_max_players INTEGER DEFAULT 5)
RETURNS UUID AS $$
DECLARE
  v_game_id UUID;
  v_code TEXT;
  v_attempts INTEGER := 0;
BEGIN
  -- Generate unique code
  LOOP
    v_code := generate_game_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM games WHERE code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique game code';
    END IF;
  END LOOP;

  -- Create game
  INSERT INTO games (code, host_id, max_players)
  VALUES (v_code, auth.uid(), p_max_players)
  RETURNING id INTO v_game_id;

  -- Add host as first player
  INSERT INTO game_players (game_id, user_id, player_index)
  VALUES (v_game_id, auth.uid(), 0);

  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join an existing game
CREATE OR REPLACE FUNCTION join_game(p_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_game_id UUID;
  v_max_players INTEGER;
  v_current_players INTEGER;
  v_player_index INTEGER;
BEGIN
  -- Find game
  SELECT id, max_players INTO v_game_id, v_max_players
  FROM games
  WHERE code = UPPER(p_code) AND status = 'waiting';

  IF v_game_id IS NULL THEN
    RAISE EXCEPTION 'Game not found or not accepting players';
  END IF;

  -- Check if already in game
  IF EXISTS (SELECT 1 FROM game_players WHERE game_id = v_game_id AND user_id = auth.uid()) THEN
    RETURN v_game_id;
  END IF;

  -- Check player count
  SELECT COUNT(*) INTO v_current_players FROM game_players WHERE game_id = v_game_id;

  IF v_current_players >= v_max_players THEN
    RAISE EXCEPTION 'Game is full';
  END IF;

  -- Get next player index
  SELECT COALESCE(MAX(player_index) + 1, 0) INTO v_player_index
  FROM game_players WHERE game_id = v_game_id;

  -- Join game
  INSERT INTO game_players (game_id, user_id, player_index)
  VALUES (v_game_id, auth.uid(), v_player_index);

  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit a game action with turn validation
CREATE OR REPLACE FUNCTION submit_game_action(
  p_game_id UUID,
  p_action_type TEXT,
  p_action_data JSONB,
  p_expected_version INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_current_player_index INTEGER;
  v_player_index INTEGER;
  v_phase TEXT;
  v_current_version INTEGER;
BEGIN
  -- Get current game state with lock
  SELECT current_player_index, phase, version
  INTO v_current_player_index, v_phase, v_current_version
  FROM game_state
  WHERE game_id = p_game_id
  FOR UPDATE;

  -- Version check (optimistic concurrency)
  IF v_current_version != p_expected_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'State has changed',
      'current_version', v_current_version
    );
  END IF;

  -- Get player index for current user
  SELECT player_index INTO v_player_index
  FROM game_players
  WHERE game_id = p_game_id AND user_id = auth.uid();

  IF v_player_index IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not in game');
  END IF;

  -- Check if it's this player's turn (for turn-sensitive actions)
  IF p_action_type IN ('select_card', 'confirm_target', 'use_special_ability') THEN
    IF v_player_index != v_current_player_index THEN
      RETURN jsonb_build_object('success', false, 'error', 'Not your turn');
    END IF;

    -- Phase validation
    IF p_action_type = 'select_card' AND v_phase NOT IN ('SELECT') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid phase for action');
    END IF;

    IF p_action_type = 'confirm_target' AND v_phase NOT IN ('TARGET_SELECT') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid phase for action');
    END IF;
  END IF;

  -- Log the action
  INSERT INTO game_actions (game_id, user_id, action_type, action_data, state_version)
  VALUES (p_game_id, auth.uid(), p_action_type, p_action_data, v_current_version);

  -- Increment version
  UPDATE game_state
  SET version = version + 1, last_action_at = NOW()
  WHERE game_id = p_game_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_version', v_current_version + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REALTIME CONFIGURATION
-- ============================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE player_state;
