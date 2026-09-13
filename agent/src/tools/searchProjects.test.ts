import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCatalogDb, upsertProjects } from '../catalog/index.js';
import { searchProjectsTool } from './searchProjects.js';

describe('searchProjectsTool', () => {
  let dir: string;
  let dbPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'guddion-tool-search-'));
    dbPath = join(dir, 'catalog.db');
    const db = openCatalogDb(dbPath);
    upsertProjects(db, [
      { name: 'guddion-mcp', path: 'D:/Projects/guddion-mcp', readmeExcerpt: 'MCP agent', lastCommit: null, branch: null, language: 'TypeScript' },
    ]);
    db.close();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('formats matches as a readable list', () => {
    const text = searchProjectsTool(dbPath, 'guddion');
    expect(text).toContain('guddion-mcp');
    expect(text).toContain('TypeScript');
    expect(text).toContain('D:/Projects/guddion-mcp');
  });

  it('returns a clear message when nothing matches', () => {
    const text = searchProjectsTool(dbPath, 'nonexistent');
    expect(text).toBe('No projects match "nonexistent".');
  });
});
