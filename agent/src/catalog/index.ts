import { createRequire } from 'node:module';
import type { DatabaseSync } from 'node:sqlite';
import type { ProjectRecord } from './scan.js';

// Static `import ... from 'node:sqlite'` gets mis-resolved as a bare
// "sqlite" package by Vite/Vitest's dependency transform (its builtin-module
// list predates this Node API) — createRequire bypasses that transform
// entirely and resolves it the same way plain Node module resolution would.
// (The type-only import above is erased at compile time, so it never hits
// that transform.)
const require = createRequire(import.meta.url);
const { DatabaseSync: DatabaseSyncCtor } = require('node:sqlite') as typeof import('node:sqlite');

export interface ProjectRow extends ProjectRecord {
  id: number;
  syncedAt: string;
}

export function openCatalogDb(path: string): DatabaseSync {
  const db = new DatabaseSyncCtor(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      readme_excerpt TEXT,
      last_commit TEXT,
      branch TEXT,
      language TEXT,
      synced_at TEXT NOT NULL
    );
  `);
  return db;
}

export function upsertProjects(db: DatabaseSync, records: ProjectRecord[]): void {
  const stmt = db.prepare(`
    INSERT INTO projects (name, path, readme_excerpt, last_commit, branch, language, synced_at)
    VALUES (@name, @path, @readmeExcerpt, @lastCommit, @branch, @language, @syncedAt)
    ON CONFLICT(path) DO UPDATE SET
      name = excluded.name,
      readme_excerpt = excluded.readme_excerpt,
      last_commit = excluded.last_commit,
      branch = excluded.branch,
      language = excluded.language,
      synced_at = excluded.synced_at
  `);
  const syncedAt = new Date().toISOString();
  db.exec('BEGIN');
  try {
    for (const item of records) {
      stmt.run({ ...item, syncedAt });
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function toRow(raw: Record<string, unknown>): ProjectRow {
  return {
    id: raw.id as number,
    name: raw.name as string,
    path: raw.path as string,
    readmeExcerpt: raw.readme_excerpt as string | null,
    lastCommit: raw.last_commit as string | null,
    branch: raw.branch as string | null,
    language: raw.language as string | null,
    syncedAt: raw.synced_at as string,
  };
}

export function searchProjects(db: DatabaseSync, query: string): ProjectRow[] {
  const like = `%${query}%`;
  const rows = db
    .prepare(`SELECT * FROM projects WHERE name LIKE ? OR readme_excerpt LIKE ? ORDER BY name`)
    .all(like, like) as Record<string, unknown>[];
  return rows.map(toRow);
}

export function getProject(db: DatabaseSync, name: string): ProjectRow | undefined {
  const row = db.prepare(`SELECT * FROM projects WHERE name = ?`).get(name) as Record<string, unknown> | undefined;
  return row ? toRow(row) : undefined;
}
