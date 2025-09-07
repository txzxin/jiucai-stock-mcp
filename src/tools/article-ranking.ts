import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiuyangongsheApiClient } from '../services/jiuyangongshe-api.js';

/**
 * 文章热度排行榜工具
 * 
 * 获取韭研公社文章热度排行榜数据，用于分析市场热点和投资者关注度。
 * 注意：rank-board 接口不支持任何参数，返回固定的排行榜数据。
 */
export class ArticleRankingTool {
  private apiClient: JiuyangongsheApiClient;

  constructor(apiClient: JiuyangongsheApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取MCP工具定义
   * 注意：此工具不接受任何参数
   */
  getToolDefinition(): Tool {
    return {
      name: 'get_article_ranking',
      description: '获取韭研公社文章热度排行榜数据，用于分析市场热点和投资者关注度。注意：此接口不支持任何参数，返回固定的排行榜数据。',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
  }

  /**
   * 执行工具调用
   * 注意：忽略所有传入的参数，直接调用API
   */
  async execute(args: unknown): Promise<any> {
    try {
      // 调用API（不传任何参数）
      const response = await this.apiClient.getArticleRanking();
      
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
          timestamp: response.data.timestamp
        },
        metadata: {
          dataSource: '韭研公社',
          apiEndpoint: '/v1/article/rank-board'
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