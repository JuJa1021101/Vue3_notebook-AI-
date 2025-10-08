/**
 * AI 助手类型定义
 */

/**
 * AI 操作类型
 * @typedef {'continue' | 'format' | 'beautify' | 'polish' | 'summarize' | 'expand'} AIAction
 */

/**
 * 续写长度
 * @typedef {'short' | 'medium' | 'long'} AILength
 */

/**
 * 写作风格
 * @typedef {'formal' | 'casual' | 'professional' | 'creative'} AIStyle
 */

/**
 * 语言
 * @typedef {'zh' | 'en'} AILanguage
 */

/**
 * AI 请求选项
 * @typedef {Object} AIOptions
 * @property {AILength} [length] - 续写长度
 * @property {AIStyle} [style] - 写作风格
 * @property {AILanguage} [language] - 语言
 * @property {number} [maxTokens] - 最大 token 数
 * @property {number} [temperature] - 温度参数
 */

/**
 * AI 请求
 * @typedef {Object} AIRequest
 * @property {AIAction} action - 操作类型
 * @property {string} content - 内容
 * @property {string} [context] - 上下文
 * @property {AIOptions} [options] - 选项
 */

/**
 * AI 响应
 * @typedef {Object} AIResponse
 * @property {boolean} success - 是否成功
 * @property {Object} [data] - 数据
 * @property {string} data.result - 结果内容
 * @property {number} [data.tokensUsed] - 使用的 token 数
 * @property {number} [data.processingTime] - 处理时间（毫秒）
 * @property {string} [message] - 消息
 */

/**
 * AI 设置
 * @typedef {Object} AISettings
 * @property {number} userId - 用户 ID
 * @property {string} provider - 服务商
 * @property {string} model - 模型
 * @property {AILength} defaultLength - 默认长度
 * @property {AIStyle} defaultStyle - 默认风格
 * @property {AILanguage} defaultLanguage - 默认语言
 * @property {boolean} streamEnabled - 是否启用流式输出
 */

module.exports = {};
