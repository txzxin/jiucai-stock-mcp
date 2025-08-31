import { z } from 'zod';

// 文章排行榜相关类型
export const ArticleRankingRequestSchema = z.object({
  timeRange: z.enum(['day', 'week', 'month']).optional().default('day'),
  category: z.enum(['all', 'stock', 'industry', 'news', 'memo']).optional().default('all'),
  limit: z.number().min(1).max(100).optional().default(20)
});

export const ArticleRankingItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  authorId: z.string(),
  hotScore: z.number(),
  publishTime: z.string(),
  url: z.string(),
  category: z.string(),
  viewCount: z.number().optional(),
  commentCount: z.number().optional(),
  likeCount: z.number().optional()
});

export const ArticleRankingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    articles: z.array(ArticleRankingItemSchema),
    total: z.number(),
    timestamp: z.string()
  })
});;

// 时间轴事件相关类型
export const TimelineEventsRequestSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventType: z.enum(['all', 'earnings', 'policy', 'merger', 'investment']).optional().default('all'),
  limit: z.number().min(1).max(100).optional().default(20)
});

export const TimelineEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  eventType: z.string(),
  description: z.string().optional(),
  relatedStocks: z.array(z.string()).optional(),
  importance: z.enum(['low', 'medium', 'high']).optional(),
  url: z.string().optional()
});

export const TimelineEventsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    events: z.array(TimelineEventSchema),
    insights: z.object({
      summary: z.object({
        totalEvents: z.number(),
        highImportanceCount: z.number(),
        mostMentionedStocks: z.array(z.object({
          stock: z.string(),
          mentions: z.number()
        }))
      })
    })
  })
});;

// 通用API响应类型
export const BaseResponseSchema = z.object({
  errCode: z.number(),
  msg: z.string(),
  data: z.any(),
  serverTime: z.number().optional()
});

// 导出类型
export type ArticleRankingRequest = z.infer<typeof ArticleRankingRequestSchema>;
export type ArticleRankingItem = z.infer<typeof ArticleRankingItemSchema>;
export type ArticleRankingResponse = z.infer<typeof ArticleRankingResponseSchema>;

export type TimelineEventsRequest = z.infer<typeof TimelineEventsRequestSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type TimelineEventsResponse = z.infer<typeof TimelineEventsResponseSchema>;

export type BaseResponse = z.infer<typeof BaseResponseSchema>;