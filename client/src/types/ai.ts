/**
 * AI 相关类型定义
 */

// AI 操作类型
export type AIAction = 'continue' | 'format' | 'beautify' | 'polish' | 'summarize' | 'expand'

// AI 长度选项
export type AILength = 'short' | 'medium' | 'long'

// AI 风格选项
export type AIStyle = 'formal' | 'casual' | 'professional' | 'creative'

// AI 语言选项
export type AILanguage = 'zh' | 'en'

// AI 请求选项
export interface AIRequestOptions {
  length?: AILength
  style?: AIStyle
  language?: AILanguage
  streamEnabled?: boolean
  maxTokens?: number
  temperature?: number
  topP?: number
}

// AI 响应结果
export interface AIResponse {
  success: boolean
  result?: string
  error?: string
  errorCode?: string
  tokensUsed?: number
  promptTokens?: number
  completionTokens?: number
  processingTime?: number
  model?: string
}

// AI 设置
export interface AISettings {
  id?: number
  user_id?: number
  provider: string
  model: string
  default_length: AILength
  default_style: AIStyle
  default_language: AILanguage
  stream_enabled: boolean
  created_at?: string
  updated_at?: string
}

// AI 使用统计
export interface AIUsageStats {
  today: {
    total_requests: number
    total_tokens: number
    total_cost: number
    avg_time: number
  }
  month: {
    total_requests: number
    total_tokens: number
    total_cost: number
  }
  rateLimit: {
    hourly_count: number
    daily_count: number
  }
  limits: {
    hourly: number
    daily: number
  }
  limitInfo?: string | null
  userTier?: string
  isUnlimited?: boolean
}

// AI 使用日志
export interface AIUsageLog {
  id: number
  user_id: number
  action: AIAction
  tokens_used: number
  cost: number
  processing_time: number
  success: boolean
  error_message?: string
  created_at: string
}

// AI 限流信息
export interface AIRateLimit {
  user_id: number
  request_date: string
  hourly_count: number
  daily_count: number
  last_request_at: string
}

// AI 流式响应回调
export type AIStreamCallback = (chunk: string) => void

// AI 错误码
export enum AIErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST = 'BAD_REQUEST',
  API_ERROR = 'API_ERROR',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STREAM_ERROR = 'STREAM_ERROR'
}
