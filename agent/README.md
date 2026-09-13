# guddion-mcp

Free, self-hosted MCP agent for Claude Code: search and get briefings on
your local projects, and delegate routine subtasks to a budget-tier model
through your own API key — no code ever leaves your machine.

## Install

```bash
npm install -g guddion-mcp
```

Or run it without installing:

```bash
npx guddion-mcp
```

## Configure

Copy `.env.example`, set `CATALOG_DIRS` to the directories you want indexed.
`delegate_task` only works if you also set `GUDDION_BACKEND_URL`/
`GUDDION_BACKEND_TOKEN` against a running instance of this repo's `backend/`
package — without those, `search_projects`/`get_project_briefing` still work
fully offline.

## Register with Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "guddion": {
      "command": "npx",
      "args": ["guddion-mcp"],
      "env": {
        "CATALOG_DIRS": "/path/to/your/projects"
      }
    }
  }
}
```

## Using it as a library

`guddion-mcp` exports a composable API for anyone building a private
extension (e.g. adding your own internal tools) on top of the same three
core tools, without forking:

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCoreTools } from 'guddion-mcp';

const server = new McpServer({ name: 'my-extended-agent', version: '0.1.0' });
registerCoreTools(server, { catalogDbPath: './catalog.db' });

// register your own additional tools on the same `server` here

await server.connect(new StdioServerTransport());
```
