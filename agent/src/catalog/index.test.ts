import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { openCatalogDb, upsertProjects, searchProjects, getProject } from './index.js';

describe('catalog db', () => {
  let dir: string;
  let dbPath: string;
  let db: DatabaseSync;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'guddion-catalog-'));
    dbPath = join(dir, 'catalog.db');
    db = openCatalogDb(dbPath);
  });

  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('upserts and searches by name', () => {
    upsertProjects(db, [
      { name: 'guddion-mcp', path: 'D:/Projects/guddion-mcp', readmeExcerpt: 'MCP agent', lastCommit: 'abc1 init', branch: 'main', language: 'TypeScript' },
      { name: 'other-thing', path: 'D:/Projects/other-thing', readmeExcerpt: 'unrelated', lastCommit: null, branch: null, language: 'Python' },
    ]);

    const results = searchProjects(db, 'guddion');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('guddion-mcp');
    expect(results[0].language).toBe('TypeScript');
  });

  it('searches by readme content too', () => {
    upsertProjects(db, [
      { name: 'proj-a', path: 'D:/Projects/proj-a', readmeExcerpt: 'handles billing exports', lastCommit: null, branch: null, language: null },
    ]);
    const results = searchProjects(db, 'billing');
    expect(results).toHaveLength(1);
  });

  it('upsert is idempotent on path and updates fields', () => {
    upsertProjects(db, [{ name: 'proj', path: 'D:/p', readmeExcerpt: 'v1', lastCommit: null, branch: null, language: null }]);
    upsertProjects(db, [{ name: 'proj', path: 'D:/p', readmeExcerpt: 'v2', lastCommit: 'def2 update', branch: 'main', language: 'Go' }]);

    const project = getProject(db, 'proj');
    expect(project?.readmeExcerpt).toBe('v2');
    expect(project?.lastCommit).toBe('def2 update');

    const all = searchProjects(db, 'proj');
    expect(all).toHaveLength(1);
  });

  it('getProject returns undefined for an unknown name', () => {
    expect(getProject(db, 'nope')).toBeUndefined();
  });
});
