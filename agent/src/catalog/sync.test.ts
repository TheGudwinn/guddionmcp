import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { indexProjects } from './sync.js';
import { openCatalogDb, getProject } from './index.js';

describe('indexProjects', () => {
  let root: string;
  let dbPath: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'guddion-sync-'));
    mkdirSync(join(root, 'projects', 'demo'), { recursive: true });
    writeFileSync(join(root, 'projects', 'demo', 'README.md'), 'demo project');
    dbPath = join(root, 'catalog.db');
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('scans and persists projects, returning the count indexed', () => {
    const count = indexProjects([join(root, 'projects')], dbPath);
    expect(count).toBe(1);

    const db = openCatalogDb(dbPath);
    const project = getProject(db, 'demo');
    db.close();

    expect(project?.readmeExcerpt).toBe('demo project');
  });

  it('re-running updates existing rows instead of duplicating them', () => {
    indexProjects([join(root, 'projects')], dbPath);
    writeFileSync(join(root, 'projects', 'demo', 'README.md'), 'updated');
    const count = indexProjects([join(root, 'projects')], dbPath);
    expect(count).toBe(1);

    const db = openCatalogDb(dbPath);
    const project = getProject(db, 'demo');
    db.close();
    expect(project?.readmeExcerpt).toBe('updated');
  });
});
