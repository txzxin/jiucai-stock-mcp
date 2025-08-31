/**
 * 验证日期格式 (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && date === parsedDate.toISOString().split('T')[0];
}

/**
 * 验证日期范围
 */
export function validateDateRange(startDate?: string, endDate?: string): string | null {
  if (!startDate && !endDate) {
    return null; // 允许不传日期
  }
  
  if (startDate && !validateDate(startDate)) {
    return '开始日期格式无效，请使用 YYYY-MM-DD 格式';
  }
  
  if (endDate && !validateDate(endDate)) {
    return '结束日期格式无效，请使用 YYYY-MM-DD 格式';
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return '开始日期不能晚于结束日期';
    }
    
    // 检查日期范围（不超过1年）
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return '日期范围不能超过1年';
    }
    
    // 检查是否是未来日期
    const now = new Date();
    if (end > now) {
      return '结束日期不能是未来日期';
    }
  }
  
  return null;
}

/**
 * 验证数字范围
 */
export function validateNumberRange(value: number, min: number, max: number, name: string): string | null {
  if (value < min || value > max) {
    return `${name} 必须在 ${min} 到 ${max} 之间`;
  }
  return null;
}

/**
 * 清理和格式化字符串
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // 移除控制字符
    .replace(/\s+/g, ' '); // 合并多个空格
}

/**
 * 验证股票代码格式
 */
export function validateStockCode(code: string): boolean {
  // A股股票代码格式：6位数字
  const stockPattern = /^\d{6}$/;
  return stockPattern.test(code);
}

/**
 * 提取和验证股票代码
 */
export function extractValidStockCodes(text: string): string[] {
  const stockPattern = /\b\d{6}\b/g;
  const matches = text.match(stockPattern) || [];
  return [...new Set(matches)].filter(validateStockCode);
}

/**
 * 安全解析JSON
 */
export function safeJsonParse<T>(text: string, defaultValue: T): T {
  try {
    return JSON.parse(text);
  } catch {
    return defaultValue;
  }
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: string | number): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}