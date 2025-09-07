import { HttpClient } from '../utils/http-client.js';
import {
  ArticleRankingResponse,
  TimelineEventsResponse,
  ArticleRankingItem,
  TimelineEvent,
  ArticleRankingResponseSchema,
  TimelineEventsResponseSchema
} from './types.js';
import { z } from 'zod';

/**
 * 韭研公社API客户端
 * 
 * 提供对韭研公社API的封装调用，包含文章排行榜和时间轴事件接口。
 * 注意：基于实际API测试结果，不同接口支持的参数有所不同。
 */
export class JiuyangongsheApiClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({
      baseURL: 'https://app.jiuyangongshe.com/jystock-app/api',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 获取文章排行榜数据
   * 基于实际API测试，rank-board接口不支持任何参数，返回固定的排行榜数据
   */
  async getArticleRanking(): Promise<ArticleRankingResponse> {
    try {
      // rank-board接口不支持任何参数，直接调用
      const response = await this.httpClient.post<any>('/v1/article/rank-board', {});

      // 检查API响应格式 - 注意实际API使用 errCode 字符串
      if (response.errCode !== "0" && response.errCode !== 0) {
        throw new Error(`API错误: ${response.message || response.msg || '请求失败'}`);
      }

      // 验证响应数据结构 - 实际API返回 hot_article_list
      const rawData = response.data?.hot_article_list || response.data?.list || response.data || [];
      if (!Array.isArray(rawData)) {
        throw new Error('API返回的数据格式不正确，期望数组类型');
      }

      // 转换原始数据为标准格式
      const articles: ArticleRankingItem[] = this.transformArticleData(rawData);

      const result = {
        success: true,
        message: `成功获取 ${articles.length} 篇文章的排行榜数据`,
        data: {
          articles,
          total: articles.length,
          timestamp: new Date().toISOString()
        }
      };

      // 验证返回数据格式
      return ArticleRankingResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`参数验证失败: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw new Error(`获取文章排行榜失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取时间轴事件数据
   * 基于实际API测试，news接口仅支持limit参数来控制返回数量
   */
  async getTimelineEvents(params: { limit?: number }): Promise<TimelineEventsResponse> {
    try {
      const requestData: any = {
        limit: Math.min(params.limit || 20, 100) // 限制最大值
      };

      const response = await this.httpClient.post<any>('/v1/timeline/news', requestData);

      // 检查API响应格式 - 注意实际API使用 errCode 字符串
      if (response.errCode !== "0" && response.errCode !== 0) {
        throw new Error(`API错误: ${response.message || response.msg || '请求失败'}`);
      }

      // 验证响应数据结构
      const rawData = response.data?.list || response.data || [];
      if (!Array.isArray(rawData)) {
        throw new Error('API返回的数据格式不正确，期望数组类型');
      }

      // 转换原始数据为标准格式
      const events: TimelineEvent[] = this.transformTimelineData(rawData);
      
      // 生成洞察分析
      const insights = this.generateInsights(events);

      const result = {
        success: true,
        message: `成功获取 ${events.length} 个财经事件`,
        data: {
          events,
          insights
        }
      };

      // 验证返回数据格式
      return TimelineEventsResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`参数验证失败: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw new Error(`获取时间轴事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 转换文章数据格式
   * 处理多种可能的API响应字段名
   */
  private transformArticleData(rawData: any[]): ArticleRankingItem[] {
    return rawData.map((item: any) => ({
      id: item.article_id || item.id || item.articleId || item.aid || String(Math.random()),
      title: item.title || item.articleTitle || item.name || '',
      author: item.author || item.userName || item.nickname || item.user?.name || '',
      authorId: item.user_id || item.authorId || item.userId || item.uid || item.user?.id || '',
      hotScore: Number(item.hotScore || item.heat || item.score || item.hot || 0),
      publishTime: this.formatApiDate(item.publishTime || item.createTime || item.publishedAt || item.time),
      url: item.url || item.link || `/a/${item.article_id || item.id || item.articleId}`,
      category: this.formatCategory(item.category || item.categoryName || item.type),
      viewCount: Number(item.viewCount || item.readCount || item.views || 0),
      commentCount: Number(item.commentCount || item.replyCount || item.comments || 0),
      likeCount: Number(item.likeCount || item.praiseCount || item.likes || item.thumbs || 0)
    }));
  }

  /**
   * 转换时间轴事件数据格式
   */
  private transformTimelineData(rawData: any[]): TimelineEvent[] {
    return rawData.map((item: any) => ({
      id: item.id || item.eventId || String(Math.random()),
      title: item.title || item.eventTitle || item.name || '',
      date: this.formatApiDate(item.date || item.eventDate || item.time || item.createTime),
      eventType: this.formatEventType(item.eventType || item.type || item.category),
      description: item.description || item.content || item.summary || item.detail || '',
      relatedStocks: this.extractStockCodes(item.relatedStocks || item.stocks || item.title || item.content || ''),
      importance: this.determineImportance(item.importance || item.level || item.priority),
      url: item.url || item.link || `/timeline/${item.id || item.eventId}`
    }));
  }

  /**
   * 格式化API返回的日期
   */
  private formatApiDate(dateValue: any): string {
    if (!dateValue) return new Date().toISOString();
    
    // 处理时间戳
    if (typeof dateValue === 'number') {
      return new Date(dateValue > 1000000000000 ? dateValue : dateValue * 1000).toISOString();
    }
    
    // 处理字符串日期
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
    
    return new Date().toISOString();
  }

  /**
   * 格式化分类名称
   */
  private formatCategory(category: any): string {
    if (!category) return '未分类';
    
    const categoryMap: Record<string, string> = {
      'stock': '个股研究',
      'industry': '题材行业', 
      'news': '资讯荟萃',
      'memo': '纪要转载'
    };
    
    return categoryMap[String(category)] || String(category);
  }

  /**
   * 格式化事件类型
   */
  private formatEventType(type: any): 'all' | 'earnings' | 'policy' | 'merger' | 'investment' {
    if (!type) return 'all';
    
    const typeStr = String(type).toLowerCase();
    if (typeStr.includes('earnings') || typeStr.includes('财报')) return 'earnings';
    if (typeStr.includes('policy') || typeStr.includes('政策')) return 'policy';
    if (typeStr.includes('merger') || typeStr.includes('并购')) return 'merger';
    if (typeStr.includes('investment') || typeStr.includes('投资')) return 'investment';
    
    return 'all';
  }

  /**
   * 从文本中提取股票代码
   */
  private extractStockCodes(text: string): string[] {
    if (!text) return [];
    
    // 匹配6位数字股票代码 (A股)
    const stockPattern = /\b\d{6}\b/g;
    const matches = text.match(stockPattern) || [];
    return [...new Set(matches)]; // 去重
  }

  /**
   * 判断事件重要程度
   */
  private determineImportance(level?: string | number): 'low' | 'medium' | 'high' {
    if (!level) return 'medium';
    
    if (typeof level === 'string') {
      const levelStr = level.toLowerCase();
      if (levelStr.includes('high') || levelStr.includes('重要') || levelStr.includes('重大')) return 'high';
      if (levelStr.includes('low') || levelStr.includes('一般') || levelStr.includes('普通')) return 'low';
    }
    
    if (typeof level === 'number') {
      if (level >= 8) return 'high';
      if (level <= 3) return 'low';
    }
    
    return 'medium';
  }

  /**
   * 生成时间轴事件洞察分析
   */
  private generateInsights(events: TimelineEvent[]): {
    summary: {
      totalEvents: number;
      highImportanceCount: number;
      mostMentionedStocks: Array<{ stock: string; mentions: number }>;
    };
  } {
    const totalEvents = events.length;
    const highImportanceCount = events.filter(e => e.importance === 'high').length;
    
    // 统计股票提及次数
    const stockMentions: Record<string, number> = {};
    events.forEach(event => {
      const relatedStocks = event.relatedStocks || [];
      relatedStocks.forEach(stock => {
        stockMentions[stock] = (stockMentions[stock] || 0) + 1;
      });
    });
    
    const mostMentionedStocks = Object.entries(stockMentions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([stock, mentions]) => ({ stock, mentions }));

    return {
      summary: {
        totalEvents,
        highImportanceCount,
        mostMentionedStocks
      }
    };
  }
}