import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiuyangongsheApiClient } from '../services/jiuyangongshe-api.js';

/**
 * 财经事件时间轴工具
 * 
 * 获取韭研公社财经事件时间轴数据，用于分析重要财经事件和投资机会。
 * 注意：news 接口仅支持 limit 参数来控制返回的事件数量。
 */
export class TimelineEventsTool {
  private apiClient: JiuyangongsheApiClient;

  constructor(apiClient: JiuyangongsheApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取MCP工具定义
   * 注意：此工具仅支持 limit 参数
   */
  getToolDefinition(): Tool {
    return {
      name: 'get_timeline_events',
      description: '获取韭研公社财经事件时间轴数据，用于分析重要财经事件和投资机会。注意：此接口仅支持limit参数来控制返回数量。',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: '返回事件数量限制，默认20个',
            default: 20
          }
        },
        additionalProperties: false
      }
    };
  }

  /**
   * 执行工具调用
   * 注意：仅处理 limit 参数，忽略其他所有参数
   */
  async execute(args: unknown): Promise<any> {
    try {
      // 验证参数（仅支持limit）
      const parsedArgs = args as any;
      const limit = parsedArgs?.limit || 20;
      
      // 调用API
      const response = await this.apiClient.getTimelineEvents({ limit });
      
      if (!response.success) {
        throw new Error('获取时间轴事件数据失败');
      }

      // 格式化返回结果
      return {
        success: true,
        message: `成功获取 ${response.data.events.length} 个财经事件`,
        data: {
          events: response.data.events,
          total: response.data.events.length,
          queryParams: { limit },
          timestamp: new Date().toISOString()
        },
        metadata: {
          dataSource: '韭研公社',
          apiEndpoint: '/v1/timeline/news'
        },
        insights: response.data.insights
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '获取时间轴事件数据时发生错误'
      };
    }
  }
}