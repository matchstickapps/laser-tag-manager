-- Laser Tag Stats Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_time BIGINT,
  end_time BIGINT,
  status TEXT NOT NULL CHECK (status IN ('created', 'active', 'paused', 'completed')),
  player_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  gun_id TEXT NOT NULL,
  name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  current_session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  stats JSONB NOT NULL DEFAULT '{
    "hp": {"current": 0, "max": 0},
    "ammo": {"current": 0, "max": 0},
    "reloads": "UNLIMITED",
    "tags": 0,
    "deactivations": 0,
    "accuracy": 0,
    "respawns": 0,
    "kdRatio": 0,
    "score": 0
  }'::jsonb,
  history JSONB[] DEFAULT '{}',
  last_updated BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending stats table
CREATE TABLE IF NOT EXISTS pending_stats (
  id TEXT PRIMARY KEY,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  captured_image TEXT NOT NULL,
  extracted_stats JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guns table
CREATE TABLE IF NOT EXISTS guns (
  id TEXT PRIMARY KEY,
  gun_number TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance')) DEFAULT 'available',
  last_used BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_gun_id ON players(gun_id);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(current_session_id);
CREATE INDEX IF NOT EXISTS idx_pending_stats_player_id ON pending_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pending_stats_session_id ON pending_stats(session_id);
CREATE INDEX IF NOT EXISTS idx_pending_stats_status ON pending_stats(status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_guns_qr_code ON guns(qr_code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_stats_updated_at BEFORE UPDATE ON pending_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guns_updated_at BEFORE UPDATE ON guns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE guns ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For now, allowing all operations. In production, you should restrict based on auth.

-- Sessions policies
CREATE POLICY "Enable read access for all users" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON sessions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON sessions
  FOR DELETE USING (true);

-- Players policies
CREATE POLICY "Enable read access for all users" ON players
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON players
  FOR DELETE USING (true);

-- Pending stats policies
CREATE POLICY "Enable read access for all users" ON pending_stats
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON pending_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON pending_stats
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON pending_stats
  FOR DELETE USING (true);

-- Guns policies
CREATE POLICY "Enable read access for all users" ON guns
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON guns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON guns
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON guns
  FOR DELETE USING (true);
