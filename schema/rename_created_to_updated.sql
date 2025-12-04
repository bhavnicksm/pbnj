-- Migration: Rename 'created' to 'updated'
-- SQLite doesn't support ALTER TABLE RENAME COLUMN in older versions,
-- so we recreate the table

-- Create new table with updated column name
CREATE TABLE pastes_new (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  language TEXT,
  updated INTEGER NOT NULL,
  expires INTEGER,
  filename TEXT
);

-- Copy data from old table
INSERT INTO pastes_new (id, code, language, updated, expires, filename)
SELECT id, code, language, created, expires, filename FROM pastes;

-- Drop old table
DROP TABLE pastes;

-- Rename new table
ALTER TABLE pastes_new RENAME TO pastes;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_updated ON pastes(updated DESC);
