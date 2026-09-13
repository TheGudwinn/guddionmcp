#!/usr/bin/env node
import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { indexProjects } from './catalog/sync.js';

const catalogDbPath = process.env.CATALOG_DB_PATH ?? './catalog.db';
const catalogDirs = (process.env.CATALOG_DIRS ?? '')
  .split(';')
  .map((d) => d.trim())
  .filter(Boolean);

// stdout is reserved for the MCP protocol — all diagnostics go to stderr.
if (catalogDirs.length > 0) {
  const count = indexProjects(catalogDirs, catalogDbPath);
  console.error(`[guddion-mcp] indexed ${count} project(s) from ${catalogDirs.length} director(y/ies)`);
} else {
  console.error('[guddion-mcp] CATALOG_DIRS not set — skipping catalog index on startup');
}

const server = createServer({ catalogDbPath });
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[guddion-mcp] MCP server connected over stdio');
