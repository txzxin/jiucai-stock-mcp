import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { JiuyangongsheApiClient } from '../services/jiuyangongshe-api.js';
import { TimelineEventsRequestSchema } from '../services/types.js';

export class TimelineEventsTool {
  private apiClient: JiuyangongsheApiClient;

  constructor(apiClient: JiuyangongsheApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取MCP工具定义
   */
  getToolDefinition(): Tool {
    return {
      name: 'get_timeline_events',
      description: '获取韭研公社财经事件时间轴数据，用于分析重要财经事件和投资机会',
      inputSchema: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: '开始日期，格式：YYYY-MM-DD',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$'
          },
          endDate: {
            type: 'string',
            description: '结束日期，格式：YYYY-MM-DD',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$'
          },
          eventType: {
            type: 'string',
            enum: ['all', 'earnings', 'policy', 'merger', 'investment'],
            description: '事件类型：all=全部，earnings=财报，policy=政策，merger=并购，investment=投资',
            default: 'all'
          },
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
   */
  async execute(args: unknown): Promise<any> {
    try {
      // 验证参数
      const validatedArgs = TimelineEventsRequestSchema.parse(args);
      
      // 日期验证
      if (validatedArgs.startDate && validatedArgs.endDate) {
        const startDate = new Date(validatedArgs.startDate);
        const endDate = new Date(validatedArgs.endDate);
        
        if (startDate > endDate) {
          throw new Error('开始日期不能晚于结束日期');
        }
        
        // 检查日期范围是否合理（不超过1年）
        const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          throw new Error('日期范围不能超过1年');
        }
      }
      
      // 调用API
      const response = await this.apiClient.getTimelineEvents(validatedArgs);
      
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
          queryParams: validatedArgs,
          timestamp: new Date().toISOString()
        },
        metadata: {
          eventType: validatedArgs.eventType,
          dateRange: {
            start: validatedArgs.startDate,
            end: validatedArgs.endDate
          },
          dataSource: '韭研公社',
          apiEndpoint: '/v1/timeline/events'
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