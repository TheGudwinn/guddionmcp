import { scanProjects } from './scan.js';
import { openCatalogDb, upsertProjects } from './index.js';

export function indexProjects(dirs: string[], dbPath: string): number {
  const records = scanProjects(dirs);
  const db = openCatalogDb(dbPath);
  try {
    upsertProjects(db, records);
  } finally {
    db.close();
  }
  return records.length;
}
