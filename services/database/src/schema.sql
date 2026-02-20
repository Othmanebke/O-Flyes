-- O-Flyes database schema
-- Run this once against your PostgreSQL instance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT,
  provider      TEXT NOT NULL DEFAULT 'local', -- 'local' | 'google'
  plan          TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  country          TEXT NOT NULL,
  continent        TEXT,
  climate          TEXT,          -- 'tropical' | 'arid' | 'temperate' | 'cold' | 'polar'
  avg_daily_budget NUMERIC(10,2), -- USD per person per day
  best_periods     TEXT[],        -- e.g. ['june', 'july', 'august']
  tags             TEXT[],        -- e.g. ['beach', 'mountains', 'city']
  image_url        TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trips (saved by users)
CREATE TABLE IF NOT EXISTS trips (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  start_date     DATE,
  end_date       DATE,
  budget         NUMERIC(10,2),
  status         TEXT NOT NULL DEFAULT 'planned', -- 'planned' | 'booked' | 'completed'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL, -- 'user' | 'assistant'
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed a few sample destinations
INSERT INTO destinations (name, country, continent, climate, avg_daily_budget, best_periods, tags, description)
VALUES
  ('Bali',       'Indonesia', 'Asia',    'tropical',  60,  ARRAY['april','may','june','july','august','september'], ARRAY['beach','temple','surf'], 'Island paradise with lush rice terraces, temples, and world-class surf.'),
  ('Reykjavik',  'Iceland',   'Europe',  'cold',      150, ARRAY['june','july','august','december','january'],      ARRAY['aurora','hiking','geysers'], 'Land of fire and ice – perfect for aurora borealis and dramatic landscapes.'),
  ('Barcelona',  'Spain',     'Europe',  'temperate', 100, ARRAY['april','may','june','september','october'],       ARRAY['city','beach','architecture'], 'Vibrant city with iconic Gaudí architecture, tapas, and Mediterranean beaches.'),
  ('Marrakech',  'Morocco',   'Africa',  'arid',      50,  ARRAY['march','april','october','november'],             ARRAY['culture','souks','desert'], 'The Red City – immersive souks, palaces, and gateway to the Sahara.'),
  ('Kyoto',      'Japan',     'Asia',    'temperate', 90,  ARRAY['march','april','november'],                       ARRAY['temple','cherry-blossom','culture'], 'Ancient capital with thousands of temples, zen gardens, and geisha districts.')
ON CONFLICT DO NOTHING;
