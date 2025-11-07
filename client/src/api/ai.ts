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
  limitInfo?: {
    tier: string;
    description: string;
    isUnlimited: boolean;
    hourly: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
      warningLevel: 'safe' | 'warning' | 'danger';
      display: string;
    };
    daily: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
      warningLevel: 'safe' | 'warning' | 'danger';
      display: string;
    };
    maxTokens: number;
  };
  userTier?: string;
  isUnlimited?: boolean;
}

/**
 * 流式响应统计信息
 */
export interface StreamStats {
  tokensUsed?: number;
  processingTime?: number;
}

/**
 * 创建流式请求（带重连和错误处理）
 */
const createStreamRequest = async (
  url: string,
  data: AIRequest,
  onChunk?: (chunk: string) => void,
  onStats?: (stats: StreamStats) => void
): Promise<void> => {
  const token = localStorage.getItem('token');
  const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  // 重连配置
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒
  const REQUEST_TIMEOUT = 90000; // 90秒

  let retryCount = 0;

  const attemptRequest = async (): Promise<void> => {
    let timeoutId: number | undefined;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    try {
      // 创建超时控制
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT);

      const response = await fetch(`${baseURL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      // 清除超时
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // 按行处理数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));

              if (jsonData.done) {
                if (jsonData.error) {
                  throw new Error(jsonData.error);
                }

                // 发送统计信息
                if (onStats && (jsonData.tokensUsed || jsonData.processingTime)) {
                  onStats({
                    tokensUsed: jsonData.tokensUsed,
                    processingTime: jsonData.processingTime,
                  });
                }

                return;
              } else if (jsonData.chunk && onChunk) {
                onChunk(jsonData.chunk);
              }
            } catch (e) {
              // 忽略解析错误，但记录日志
              console.debug('解析数据行失败:', line, e);
            }
          }
        }
      }
    } catch (error: any) {
      // 清理资源
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (reader) {
        try {
          await reader.cancel();
        } catch (e) {
          console.debug('取消 reader 失败:', e);
        }
      }

      // 判断是否需要重连
      const isNetworkError = error.name === 'AbortError' ||
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('fetch');

      if (isNetworkError && retryCount < MAX_RETRIES) {
        retryCount++;
        console.warn(`流式请求失败，${RETRY_DELAY}ms 后进行第 ${retryCount} 次重试...`);

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        return attemptRequest();
      }

      // 不重连或重连失败，抛出错误
      console.error('流式请求失败:', error);
      throw new Error(error.message || '流式请求失败');
    }
  };

  return attemptRequest();
};

/**
 * AI 助手 API
 */
export const aiAPI = {
  /**
   * 智能续写
   */
  continue: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/continue', data, onChunk, onStats);
      return { success: true };
    }
    const response = await request.post('/ai/continue', data);
    return response.data;
  },

  /**
   * 格式优化
   */
  format: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/format', data, onChunk, onStats);
      return { success: true };
    }
    const response = await request.post('/ai/format', data);
    return response.data;
  },

  /**
   * 排版美化
   */
  beautify: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/beautify', data, onChunk, onStats);
      return { success: true };
    }
    const response = await request.post('/ai/beautify', data);
    return response.data;
  },

  /**
   * 内容润色
   */
  polish: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/polish', data, onChunk, onStats);
      return { success: true };
    }
    const response = await request.post('/ai/polish', data);
    return response.data;
  },

  /**
   * 生成摘要
   */
  summarize: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/summarize', data, onChunk, onStats);
      return { success: true };
    }
    const response = await request.post('/ai/summarize', data);
    return response.data;
  },

  /**
   * 内容扩写
   */
  expand: async (data: AIRequest, onChunk?: (chunk: string) => void, onStats?: (stats: StreamStats) => void): Promise<AIResponse> => {
    if (data.options?.streamEnabled && onChunk) {
      await createStreamRequest('/api/ai/expand', data, onChunk, onStats);
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
