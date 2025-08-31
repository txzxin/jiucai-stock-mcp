import fetch, { RequestInit } from 'node-fetch';

export interface HttpClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private retries: number;

  constructor(options: HttpClientOptions) {
    this.baseURL = options.baseURL;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/json',
      'Referer': 'https://www.jiuyangongshe.com/',
      'Origin': 'https://www.jiuyangongshe.com',
      ...options.headers
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // 使用 AbortController 实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      signal: controller.signal
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        // 详细的HTTP状态码错误处理
        if (!response.ok) {
          const errorMessage = this.getHttpErrorMessage(response.status, response.statusText);
          throw new Error(errorMessage);
        }
        
        // 验证响应内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(`API返回了非JSON格式的响应: ${contentType || 'unknown'}, 内容: ${responseText.slice(0, 200)}`);
        }
        
        try {
          const data = await response.json() as T;
          return data;
        } catch (parseError) {
          throw new Error(`JSON解析失败: ${parseError instanceof Error ? parseError.message : '未知解析错误'}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;
        
        // 分类错误类型，确定是否应该重试
        const shouldRetry = this.shouldRetryError(error as Error);
        
        if (!shouldRetry || attempt >= this.retries) {
          break;
        }
        
        // 指数退避重试
        const delay = Math.min(Math.pow(2, attempt) * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`请求失败，已重试 ${this.retries} 次: ${lastError!.message}`);
  }

  /**
   * 获取HTTP错误的详细描述
   */
  private getHttpErrorMessage(status: number, statusText: string): string {
    const errorMap: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权访问',
      403: '访问被禁止',
      404: '接口不存在',
      429: '请求过于频繁',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时'
    };
    
    const message = errorMap[status] || statusText;
    return `HTTP ${status}: ${message}`;
  }

  /**
   * 判断错误是否应该重试
   */
  private shouldRetryError(error: Error): boolean {
    // 超时错误不重试
    if (error.name === 'AbortError') {
      return false;
    }
    
    // 网络错误重试
    if (error.message.includes('ENOTFOUND') || 
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT')) {
      return true;
    }
    
    // HTTP 5xx 错误重试
    if (error.message.includes('HTTP 5')) {
      return true;
    }
    
    // HTTP 429 (rate limit) 重试
    if (error.message.includes('HTTP 429')) {
      return true;
    }
    
    // 其他HTTP 4xx 错误不重试
    if (error.message.includes('HTTP 4')) {
      return false;
    }
    
    // JSON解析错误不重试
    if (error.message.includes('JSON解析失败')) {
      return false;
    }
    
    // 默认重试
    return true;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += `?${query}`;
      }
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }
}