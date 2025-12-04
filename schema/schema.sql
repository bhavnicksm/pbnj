-- D1 Database Schema for pbnj.sh
-- Run this with: wrangler d1 execute pbnj-db --remote --file=./schema/schema.sql

CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  language TEXT,
  updated INTEGER NOT NULL,
  expires INTEGER,
  filename TEXT
);

CREATE INDEX IF NOT EXISTS idx_updated ON pastes(updated DESC);
