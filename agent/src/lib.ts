export { createServer, registerCoreTools } from './server.js';
export type { AgentConfig } from './server.js';

export { openCatalogDb, upsertProjects, searchProjects, getProject } from './catalog/index.js';
export type { ProjectRow } from './catalog/index.js';

export { scanProjects } from './catalog/scan.js';
export type { ProjectRecord } from './catalog/scan.js';

export { indexProjects } from './catalog/sync.js';

export { searchProjectsTool } from './tools/searchProjects.js';
export { getProjectBriefingTool } from './tools/getProjectBriefing.js';
export { delegateTask } from './tools/delegateTask.js';
export type { DelegateTaskResult } from './tools/delegateTask.js';
