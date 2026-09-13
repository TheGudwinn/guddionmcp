import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openCatalogDb, upsertProjects } from '../catalog/index.js';
import { getProjectBriefingTool } from './getProjectBriefing.js';

describe('getProjectBriefingTool', () => {
  let dir: string;
  let dbPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'guddion-tool-briefing-'));
    dbPath = join(dir, 'catalog.db');
    const db = openCatalogDb(dbPath);
    upsertProjects(db, [
      { name: 'guddion-mcp', path: 'D:/Projects/guddion-mcp', readmeExcerpt: 'MCP agent for cataloging projects.', lastCommit: 'abc1 init', branch: 'main', language: 'TypeScript' },
    ]);
    db.close();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('formats a full briefing', () => {
    const text = getProjectBriefingTool(dbPath, 'guddion-mcp');
    expect(text).toContain('# guddion-mcp');
    expect(text).toContain('Language: TypeScript');
    expect(text).toContain('Branch: main');
    expect(text).toContain('Last commit: abc1 init');
    expect(text).toContain('MCP agent for cataloging projects.');
  });

  it('returns a clear message for an unknown project', () => {
    const text = getProjectBriefingTool(dbPath, 'ghost');
    expect(text).toContain('No project named "ghost"');
  });
});
