import { openCatalogDb, searchProjects as searchProjectsInDb } from '../catalog/index.js';

export function searchProjectsTool(dbPath: string, query: string): string {
  const db = openCatalogDb(dbPath);
  try {
    const rows = searchProjectsInDb(db, query);
    if (rows.length === 0) return `No projects match "${query}".`;
    return rows.map((r) => `- ${r.name} (${r.language ?? 'unknown'}) — ${r.path}`).join('\n');
  } finally {
    db.close();
  }
}
