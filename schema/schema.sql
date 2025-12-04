-- D1 Database Schema for pbnj.sh
-- Run this with: wrangler d1 execute pbnj-db --remote --file=./schema/schema.sql

CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  language TEXT,
  created INTEGER NOT NULL,
  expires INTEGER,
  views INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_created ON pastes(created DESC);
