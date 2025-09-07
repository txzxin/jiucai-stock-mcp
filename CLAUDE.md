# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Workflow
```bash
npm install          # Install dependencies
npm run build        # Build production version using tsup
npm run dev          # Development mode with file watching
npm start            # Run the built MCP server
npm test             # Run Jest tests
```

### Quality Assurance
```bash
npx tsc --noEmit     # TypeScript type checking without output - run before commits
npm run test         # Run all tests before task completion
```

### MCP Server Testing
```bash
npm run build        # Required before testing MCP integration
node dist/index.js   # Start MCP server in stdio mode for testing
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides access to 韭研公社 stock data APIs. The architecture follows a layered pattern:

### Core Components
- **Server**: `JiucaiStockMcpServer` class in `src/index.ts` - main MCP server implementation
- **API Client**: `JiuyangongsheApiClient` in `src/services/` - handles external API communications
- **Tools**: Individual tool classes in `src/tools/` implementing MCP tool interface
- **Utilities**: HTTP client and validators in `src/utils/`

### MCP Tools Available
1. **get_article_ranking** - Retrieves hot articles ranking from 韭研公社
2. **get_timeline_events** - Gets financial events timeline data

### Technology Stack
- **TypeScript 5.0+** with strict compiler options and ESM modules
- **MCP SDK 0.5.0** for Model Context Protocol server implementation
- **node-fetch 3.x** for HTTP requests with timeout handling
- **Zod 3.22+** for runtime type validation and schema definitions
- **tsup** for modern TypeScript bundling

### Key Patterns
- **Dependency Injection**: API client is injected into tool constructors
- **Type Safety**: Zod schemas provide runtime validation alongside TypeScript interfaces
- **Error Handling**: Comprehensive error responses with structured JSON format
- **Signal Handling**: Graceful shutdown on SIGINT/SIGTERM signals

### File Structure
```
src/
├── index.ts                    # MCP server main entry point
├── services/
│   ├── jiuyangongshe-api.ts   # API client for 韭研公社
│   └── types.ts               # Type definitions
├── tools/
│   ├── article-ranking.ts     # Article ranking tool implementation
│   └── timeline-events.ts     # Timeline events tool implementation
└── utils/
    ├── http-client.ts         # HTTP client utilities
    └── validators.ts          # Data validation utilities
```

## Development Guidelines

### Adding New MCP Tools
1. Create tool class in `src/tools/` implementing `getToolDefinition()` and `execute()` methods
2. Register tool in `JiucaiStockMcpServer.setupToolHandlers()` method
3. Add tool to the tools array in `ListToolsRequestSchema` handler
4. Add case in `CallToolRequestSchema` switch statement

### Extending API Client
1. Add new API methods in `src/services/jiuyangongshe-api.ts`
2. Define response types in `src/services/types.ts`
3. Create Zod validation schemas for runtime type checking
4. Use consistent error handling and timeout patterns

### Testing MCP Integration
The server runs in stdio mode and communicates via JSON-RPC. Build the project first, then test with Claude Desktop or other MCP clients using the configuration:

```json
{
  "mcpServers": {
    "jiucai-stock": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {}
    }
  }
}
```