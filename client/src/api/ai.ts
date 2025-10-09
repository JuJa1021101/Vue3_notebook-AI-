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
  streamEnabled?: boolean;
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
 * 创建流式请求
 */
const createStreamRequest = async (url: string, data: AIRequest, onChunk?: (chunk: string) => void): Promise<void> => {
  const token = localStorage.getItem('token');
  const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.slice(6));

            if (jsonData.done) {
              if (jsonData.error) {
                throw new Error(jsonData.error);
              }
              return;
            } else if (jsonData.chunk && onChunk) {
              onChunk(jsonData.chunk);
            }
          } catch (e) {
            // 忽略解析错误
            console.debug('解析数据行失败:', line);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('流式请求失败:', error);
    throw error;
  }
};

/**
 * AI 助手 API
 */
export const aiAPI = {
  /**
   * 智能续写
   */
  continue: async (data: AIRequest, onChunk?: (chunk: string) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/continue', data, onChunk);
      return { success: true };
    }
    const response = await request.post('/ai/continue', data);
    return response.data;
  },

  /**
   * 格式优化
   */
  format: async (data: AIRequest, onChunk?: (chunk: string) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/format', data, onChunk);
      return { success: true };
    }
    const response = await request.post('/ai/format', data);
    return response.data;
  },

  /**
   * 排版美化
   */
  beautify: async (data: AIRequest, onChunk?: (chunk: string) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/beautify', data, onChunk);
      return { success: true };
    }
    const response = await request.post('/ai/beautify', data);
    return response.data;
  },

  /**
   * 内容润色
   */
  polish: async (data: AIRequest, onChunk?: (chunk: string) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/polish', data, onChunk);
      return { success: true };
    }
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
  expand: async (data: AIRequest, onChunk?: (chunk: string) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/expand', data, onChunk);
      return { success: true };
    }
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
