-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phase VARCHAR(20) DEFAULT 'lobby', -- lobby, gameplay, result
  game_phase VARCHAR(20) DEFAULT 'story_input', -- story_input, guessing, reveal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  local_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, local_id)
);

-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  author_id UUID REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- Create guesses table
CREATE TABLE guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  guessed_author_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, player_id)
);

-- Create indexes for better performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_local_id ON players(local_id);
CREATE INDEX idx_stories_room_id ON stories(room_id);
CREATE INDEX idx_guesses_story_id ON guesses(story_id);

-- Remove duplicate players keeping the oldest one
WITH duplicate_players AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY room_id, local_id ORDER BY created_at ASC) as rn
  FROM players
)
DELETE FROM players 
WHERE id IN (
  SELECT id FROM duplicate_players WHERE rn > 1
);