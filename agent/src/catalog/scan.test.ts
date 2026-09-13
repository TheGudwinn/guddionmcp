import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanProjects } from './scan.js';

describe('scanProjects', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'guddion-scan-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('finds a project directory, reads its README, and guesses language by file count', () => {
    const projDir = join(root, 'my-proj');
    mkdirSync(projDir);
    writeFileSync(join(projDir, 'README.md'), '# My Proj\n\nDoes a thing.');
    writeFileSync(join(projDir, 'a.ts'), '');
    writeFileSync(join(projDir, 'b.ts'), '');
    writeFileSync(join(projDir, 'c.py'), '');

    const records = scanProjects([root]);

    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('my-proj');
    expect(records[0].path).toBe(projDir);
    expect(records[0].readmeExcerpt).toContain('My Proj');
    expect(records[0].language).toBe('TypeScript');
    expect(records[0].lastCommit).toBeNull();
    expect(records[0].branch).toBeNull();
  });

  it('skips non-directory entries and returns empty for an empty root', () => {
    writeFileSync(join(root, 'stray-file.txt'), 'hi');
    expect(scanProjects([root])).toHaveLength(0);
  });

  it('returns empty for a directory that does not exist, without throwing', () => {
    expect(scanProjects([join(root, 'does-not-exist')])).toEqual([]);
  });

  it('truncates the README excerpt to 500 characters', () => {
    const projDir = join(root, 'big-readme');
    mkdirSync(projDir);
    writeFileSync(join(projDir, 'README.md'), 'x'.repeat(1000));

    const [record] = scanProjects([root]);
    expect(record.readmeExcerpt).toHaveLength(500);
  });

  it('returns null language when no recognized extensions are present', () => {
    const projDir = join(root, 'no-code');
    mkdirSync(projDir);
    writeFileSync(join(projDir, 'notes.txt'), 'hi');

    const [record] = scanProjects([root]);
    expect(record.language).toBeNull();
  });
});
