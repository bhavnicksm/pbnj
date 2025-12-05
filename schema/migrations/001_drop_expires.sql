-- Migration: Remove unused expires column
-- Run with: npx wrangler d1 execute pbnj-db --remote --file=schema/migrations/001_drop_expires.sql

ALTER TABLE pastes DROP COLUMN expires;
