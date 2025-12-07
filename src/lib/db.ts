import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

// Database path - configurable via environment variable
const dbPath = process.env.DATABASE_PATH || join(projectRoot, 'data', 'pbnj.db');

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create or open the database (schema is initialized by init-db.mjs)
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// D1-compatible database interface
export interface DBResult<T> {
  results: T[];
  success: boolean;
  meta: {
    changes: number;
    last_row_id: number;
  };
}

export interface Database {
  prepare(sql: string): PreparedStatement;
}

interface PreparedStatement {
  bind(...params: unknown[]): BoundStatement;
  first<T = unknown>(): T | null;
  all<T = unknown>(): DBResult<T>;
  run(): { success: boolean; meta: { changes: number; last_row_id: number } };
}

interface BoundStatement {
  first<T = unknown>(): T | null;
  all<T = unknown>(): DBResult<T>;
  run(): { success: boolean; meta: { changes: number; last_row_id: number } };
}

// Export a wrapper that mimics the D1 API for compatibility
export const database: Database = {
  prepare(sql: string) {
    const stmt = db.prepare(sql);
    return {
      bind(...params: unknown[]) {
        return {
          first<T = unknown>(): T | null {
            return stmt.get(...params) as T | null;
          },
          all<T = unknown>(): DBResult<T> {
            const results = stmt.all(...params) as T[];
            return {
              results,
              success: true,
              meta: { changes: 0, last_row_id: 0 },
            };
          },
          run() {
            const info = stmt.run(...params);
            return {
              success: true,
              meta: {
                changes: info.changes,
                last_row_id: Number(info.lastInsertRowid),
              },
            };
          },
        };
      },
      // For queries without parameters
      first<T = unknown>(): T | null {
        return stmt.get() as T | null;
      },
      all<T = unknown>(): DBResult<T> {
        const results = stmt.all() as T[];
        return {
          results,
          success: true,
          meta: { changes: 0, last_row_id: 0 },
        };
      },
      run() {
        const info = stmt.run();
        return {
          success: true,
          meta: {
            changes: info.changes,
            last_row_id: Number(info.lastInsertRowid),
          },
        };
      },
    };
  },
};

export default database;
