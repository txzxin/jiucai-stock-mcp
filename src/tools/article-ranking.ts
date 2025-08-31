import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiuyangongsheApiClient } from '../services/jiuyangongshe-api.js';
import { ArticleRankingRequestSchema } from '../services/types.js';

export class ArticleRankingTool {
  private apiClient: JiuyangongsheApiClient;

  constructor(apiClient: JiuyangongsheApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取MCP工具定义
   */
  getToolDefinition(): Tool {
    return {
      name: 'get_article_ranking',
      description: '获取韭研公社文章热度排行榜数据，用于分析市场热点和投资者关注度',
      inputSchema: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            description: '时间范围：day=今日，week=本周，month=本月',
            default: 'day'
          },
          category: {
            type: 'string',
            enum: ['all', 'stock', 'industry', 'news', 'memo'],
            description: '文章分类：all=全部，stock=个股研究，industry=题材行业，news=资讯荟萃，memo=纪要转载',
            default: 'all'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: '返回文章数量限制，默认20篇',
            default: 20
          }
        },
        additionalProperties: false
      }
    };
  }

  /**
   * 执行工具调用
   */
  async execute(args: unknown): Promise<any> {
    try {
      // 验证参数
      const validatedArgs = ArticleRankingRequestSchema.parse(args);
      
      // 调用API
      const response = await this.apiClient.getArticleRanking(validatedArgs);
      
      if (!response.success) {
        throw new Error('获取文章排行榜数据失败');
      }

      // 格式化返回结果
      return {
        success: true,
        message: `成功获取 ${response.data.articles.length} 篇文章的排行榜数据`,
        data: {
          articles: response.data.articles,
          total: response.data.total,
          queryParams: validatedArgs,
          timestamp: response.data.timestamp
        },
        metadata: {
          timeRange: validatedArgs.timeRange,
          category: validatedArgs.category,
          dataSource: '韭研公社',
          apiEndpoint: '/v1/article/hot-list'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '获取文章排行榜数据时发生错误'
      };
    }
  }
}