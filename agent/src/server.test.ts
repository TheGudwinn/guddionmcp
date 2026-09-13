import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createServer, registerCoreTools } from './server.js';

describe('createServer', () => {
  it('builds an MCP server without throwing', () => {
    expect(() => createServer({ catalogDbPath: './catalog.db' })).not.toThrow();
  });
});

describe('registerCoreTools', () => {
  it('lets a consumer register additional tools on the same server afterward', () => {
    const server = new McpServer({ name: 'test-consumer', version: '0.0.1' });

    expect(() => registerCoreTools(server, { catalogDbPath: './catalog.db' })).not.toThrow();

    expect(() =>
      server.registerTool(
        'extra_tool',
        { title: 'Extra', description: 'A consumer-defined tool', inputSchema: {} },
        async () => ({ content: [{ type: 'text', text: 'ok' }] })
      )
    ).not.toThrow();
  });

  it('surfaces a synchronous error if a consumer tries to reuse a core tool name', () => {
    const server = new McpServer({ name: 'test-consumer', version: '0.0.1' });
    registerCoreTools(server, { catalogDbPath: './catalog.db' });

    expect(() =>
      server.registerTool(
        'search_projects',
        { title: 'Duplicate', description: 'Should collide', inputSchema: {} },
        async () => ({ content: [{ type: 'text', text: 'x' }] })
      )
    ).toThrow();
  });
});
