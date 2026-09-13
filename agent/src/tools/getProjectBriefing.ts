import { openCatalogDb, getProject } from '../catalog/index.js';

export function getProjectBriefingTool(dbPath: string, name: string): string {
  const db = openCatalogDb(dbPath);
  try {
    const project = getProject(db, name);
    if (!project) return `No project named "${name}" in the catalog. Run a sync first.`;
    return [
      `# ${project.name}`,
      `Path: ${project.path}`,
      `Language: ${project.language ?? 'unknown'}`,
      `Branch: ${project.branch ?? 'unknown'}`,
      `Last commit: ${project.lastCommit ?? 'unknown'}`,
      '',
      project.readmeExcerpt ?? '(no README found)',
    ].join('\n');
  } finally {
    db.close();
  }
}
