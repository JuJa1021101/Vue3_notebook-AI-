/**
 * AI 助手 API
 */

import request from '@/utils/request';

export interface AIOptions {
  length?: 'short' | 'medium' | 'long';
  style?: 'formal' | 'casual' | 'professional' | 'creative';
  language?: 'zh' | 'en';
  noteId?: number;
  saveHistory?: boolean;
}

export interface AIRequest {
  content: string;
  options?: AIOptions;
}

export interface AIResponse {
  success: boolean;
  data?: {
    result: string;
    tokensUsed?: number;
    processingTime?: number;
  };
  message?: string;
}

export interface AISettings {
  provider: string;
  model: string;
  default_length: 'short' | 'medium' | 'long';
  default_style: 'formal' | 'casual' | 'professional' | 'creative';
  default_language: 'zh' | 'en';
  stream_enabled: boolean;
}

export interface AIStats {
  today: {
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    avg_time: number;
  };
  month: {
    total_requests: number;
    total_tokens: number;
    total_cost: number;
  };
  rateLimit: {
    hourly_count: number;
    daily_count: number;
  };
  limits: {
    hourly: number;
    daily: number;
  };
}

/**
 * AI 助手 API
 */
export const aiAPI = {
  /**
   * 智能续写
   */
  continue: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/continue', data);
    return response.data;
  },

  /**
   * 格式优化
   */
  format: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/format', data);
    return response.data;
  },

  /**
   * 排版美化
   */
  beautify: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/beautify', data);
    return response.data;
  },

  /**
   * 内容润色
   */
  polish: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/polish', data);
    return response.data;
  },

  /**
   * 生成摘要
   */
  summarize: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/summarize', data);
    return response.data;
  },

  /**
   * 内容扩写
   */
  expand: async (data: AIRequest): Promise<AIResponse> => {
    const response = await request.post('/ai/expand', data);
    return response.data;
  },

  /**
   * 获取 AI 设置
   */
  getSettings: async (): Promise<{ success: boolean; data: AISettings }> => {
    const response = await request.get('/ai/settings');
    return response.data;
  },

  /**
   * 更新 AI 设置
   */
  updateSettings: async (data: Partial<AISettings>): Promise<{ success: boolean; message: string }> => {
    const response = await request.put('/ai/settings', data);
    return response.data;
  },

  /**
   * 获取使用统计
   */
  getStats: async (): Promise<{ success: boolean; data: AIStats }> => {
    const response = await request.get('/ai/stats');
    return response.data;
  },
};
