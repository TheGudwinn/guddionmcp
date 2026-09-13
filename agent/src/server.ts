import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchProjectsTool } from './tools/searchProjects.js';
import { getProjectBriefingTool } from './tools/getProjectBriefing.js';
import { delegateTask } from './tools/delegateTask.js';

export interface AgentConfig {
  catalogDbPath: string;
}

/**
 * Registers the three core tools onto a server the caller controls. Exported
 * standalone (not just via createServer) so a private extension can build
 * its own McpServer, call this, then register additional tools of its own
 * on the same instance before connecting a transport.
 */
export function registerCoreTools(server: McpServer, config: AgentConfig): void {
  server.registerTool(
    'search_projects',
    {
      title: 'Search projects',
      description: 'Full-text search over the local project catalog by name or README content.',
      inputSchema: { query: z.string() },
    },
    async ({ query }) => ({
      content: [{ type: 'text', text: searchProjectsTool(config.catalogDbPath, query) }],
    })
  );

  server.registerTool(
    'get_project_briefing',
    {
      title: 'Get project briefing',
      description: 'Formatted summary of one project from the local catalog: purpose, language, git state.',
      inputSchema: { project: z.string() },
    },
    async ({ project }) => ({
      content: [{ type: 'text', text: getProjectBriefingTool(config.catalogDbPath, project) }],
    })
  );

  server.registerTool(
    'delegate_task',
    {
      title: 'Delegate task',
      description: 'Sends a routine subtask to the configured backend for execution on a budget-tier model.',
      inputSchema: { prompt: z.string(), hint: z.string().optional() },
    },
    async ({ prompt, hint }) => {
      const result = await delegateTask(prompt, { hint });
      return { content: [{ type: 'text', text: result.output }] };
    }
  );
}

/** Convenience wrapper for standalone use: a fresh server with just the core tools. */
export function createServer(config: AgentConfig): McpServer {
  const server = new McpServer({ name: 'guddion-mcp', version: '0.1.0' });
  registerCoreTools(server, config);
  return server;
}
