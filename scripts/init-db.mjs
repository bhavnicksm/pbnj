#!/usr/bin/env node

import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Database path - configurable via environment variable
const dbPath = process.env.DATABASE_PATH || join(projectRoot, 'data', 'pbnj.db');

console.log(`Initializing database at: ${dbPath}`);

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

// Create or open the database
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Read and execute schema
const schemaPath = join(projectRoot, 'schema', 'schema.sql');
if (existsSync(schemaPath)) {
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Schema applied successfully');
} else {
  console.error(`Schema file not found at: ${schemaPath}`);
  process.exit(1);
}

db.close();
console.log('Database initialized successfully!');
