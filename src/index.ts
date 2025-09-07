#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { pathToFileURL } from 'url';

import { JiuyangongsheApiClient } from './services/jiuyangongshe-api.js';
import { ArticleRankingTool } from './tools/article-ranking.js';
import { TimelineEventsTool } from './tools/timeline-events.js';

class JiucaiStockMcpServer {
  private server: Server;
  private apiClient: JiuyangongsheApiClient;
  private articleRankingTool: ArticleRankingTool;
  private timelineEventsTool: TimelineEventsTool;

  constructor() {
    this.server = new Server(
      {
        name: 'jiucai-stock-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 初始化API客户端和工具
    this.apiClient = new JiuyangongsheApiClient();
    this.articleRankingTool = new ArticleRankingTool(this.apiClient);
    this.timelineEventsTool = new TimelineEventsTool(this.apiClient);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          this.articleRankingTool.getToolDefinition(),
          this.timelineEventsTool.getToolDefinition(),
        ],
      };
    });

    // 执行工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_article_ranking':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.articleRankingTool.execute(args), null, 2),
                },
              ],
            };

          case 'get_timeline_events':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.timelineEventsTool.execute(args), null, 2),
                },
              ],
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知工具: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '执行工具时发生未知错误';
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: errorMessage,
                tool: name,
                timestamp: new Date().toISOString()
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // 优雅关闭处理
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// 启动服务器
async function main() {
  try {
    const server = new JiucaiStockMcpServer();
    await server.run();
  } catch (error) {
    console.error('MCP服务器启动失败:', error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('启动错误:', error);
    process.exit(1);
  });
}

export { JiucaiStockMcpServer };