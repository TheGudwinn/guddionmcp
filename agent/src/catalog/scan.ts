import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface ProjectRecord {
  name: string;
  path: string;
  readmeExcerpt: string | null;
  lastCommit: string | null;
  branch: string | null;
  language: string | null;
}

const README_EXCERPT_LENGTH = 500;

const EXTENSION_LANGUAGE: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.cs': 'C#',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.cpp': 'C++',
  '.c': 'C',
};

function readReadmeExcerpt(dir: string): string | null {
  for (const name of ['README.md', 'readme.md', 'README.MD']) {
    try {
      const content = readFileSync(join(dir, name), 'utf8');
      return content.slice(0, README_EXCERPT_LENGTH);
    } catch {
      continue;
    }
  }
  return null;
}

function runGit(dir: string, args: string[]): string | null {
  try {
    const out = execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function guessLanguage(dir: string): string | null {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const dotIndex = entry.lastIndexOf('.');
    if (dotIndex <= 0) continue;
    const lang = EXTENSION_LANGUAGE[entry.slice(dotIndex)];
    if (lang) counts.set(lang, (counts.get(lang) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [lang, count] of counts) {
    if (count > bestCount) {
      best = lang;
      bestCount = count;
    }
  }
  return best;
}

export function scanProjects(dirs: string[]): ProjectRecord[] {
  const records: ProjectRecord[] = [];
  for (const dir of dirs) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      const path = join(dir, name);
      let isDir = false;
      try {
        isDir = statSync(path).isDirectory();
      } catch {
        continue;
      }
      if (!isDir) continue;
      records.push({
        name,
        path,
        readmeExcerpt: readReadmeExcerpt(path),
        lastCommit: runGit(path, ['log', '-1', '--format=%h %s']),
        branch: runGit(path, ['branch', '--show-current']),
        language: guessLanguage(path),
      });
    }
  }
  return records;
}
