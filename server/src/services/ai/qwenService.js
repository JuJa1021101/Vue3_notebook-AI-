/**
 * 硅基流动 - 通义千问 API 服务
 */

const axios = require('axios');

class QwenService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.QWEN_API_KEY;
    this.baseURL = config.baseURL || process.env.QWEN_BASE_URL || 'https://api.siliconflow.cn/v1';
    this.model = config.model || process.env.QWEN_MODEL || 'Qwen/Qwen2-1.5B-Instruct';
    this.timeout = config.timeout || parseInt(process.env.AI_REQUEST_TIMEOUT || '90000');

    if (!this.apiKey) {
      throw new Error('QWEN_API_KEY is required');
    }

    console.log('🤖 QwenService 初始化:');
    console.log('  - 模型:', this.model, '(快速响应模型)');
    console.log('  - 超时:', this.timeout, 'ms');
    console.log('  - Max Tokens:', process.env.QWEN_MAX_TOKENS || '1024');
    console.log('  - API Key:', this.apiKey ? '✅ 已配置' : '❌ 未配置');
  }

  /**
   * 完成文本生成（非流式）
   * @param {string} prompt - Prompt 文本
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 响应结果
   */
  async complete(prompt, options = {}) {
    const startTime = Date.now();

    try {
      console.log('🚀 开始 AI 请求:', {
        model: options.model || this.model,
        promptLength: prompt.length,
        maxTokens: options.maxTokens || 2048,
        timeout: this.timeout
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.8,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 提取结果
      const result = response.data.choices[0].message.content;
      const usage = response.data.usage;

      console.log('✅ AI 请求成功:', {
        processingTime: processingTime + 'ms',
        tokensUsed: usage.total_tokens,
        resultLength: result.length
      });

      return {
        success: true,
        result,
        tokensUsed: usage.total_tokens,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        processingTime,
        model: response.data.model
      };
    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.error('❌ QwenService.complete error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        processingTime: processingTime + 'ms'
      });

      // 处理不同类型的错误
      let errorMessage = error.message;
      let errorCode = 'UNKNOWN_ERROR';

      if (error.response) {
        // API 返回错误
        errorMessage = error.response.data?.error?.message || error.response.statusText;
        errorCode = error.response.status === 401 ? 'UNAUTHORIZED' :
          error.response.status === 429 ? 'RATE_LIMIT_EXCEEDED' :
            error.response.status === 400 ? 'BAD_REQUEST' :
              'API_ERROR';
        console.error('  API 错误详情:', error.response.data);
      } else if (error.code === 'ECONNABORTED') {
        // 超时错误
        errorMessage = `请求超时（${this.timeout}ms），请稍后重试`;
        errorCode = 'TIMEOUT';
        console.error('  超时时间:', this.timeout, 'ms');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络设置';
        errorCode = 'NETWORK_ERROR';
        console.error('  网络错误代码:', error.code);
      }

      return {
        success: false,
        error: errorMessage,
        errorCode,
        processingTime
      };
    }
  }

  /**
   * 流式文本生成
   * @param {string} prompt - Prompt 文本
   * @param {Object} options - 选项
   * @param {Function} onChunk - 接收数据块的回调函数
   * @returns {Promise<Object>} 响应结果
   */
  async streamComplete(prompt, options = {}, onChunk) {
    const startTime = Date.now();
    let fullContent = '';
    let tokensUsed = 0;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.8,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: this.timeout
        }
      );

      // 处理流式响应
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;

                if (content) {
                  fullContent += content;
                  if (onChunk) {
                    onChunk(content);
                  }
                }

                // 获取 token 使用信息（如果有）
                if (data.usage) {
                  tokensUsed = data.usage.total_tokens;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        response.data.on('end', () => {
          const endTime = Date.now();
          const processingTime = endTime - startTime;

          resolve({
            success: true,
            result: fullContent,
            tokensUsed,
            processingTime
          });
        });

        response.data.on('error', (error) => {
          const endTime = Date.now();
          const processingTime = endTime - startTime;

          reject({
            success: false,
            error: error.message,
            errorCode: 'STREAM_ERROR',
            processingTime
          });
        });
      });
    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.error('QwenService.streamComplete error:', error.message);

      return {
        success: false,
        error: error.message,
        errorCode: 'STREAM_INIT_ERROR',
        processingTime
      };
    }
  }

  /**
   * 测试 API 连接
   * @returns {Promise<boolean>} 是否连接成功
   */
  async testConnection() {
    try {
      const result = await this.complete('你好', { maxTokens: 10 });
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

module.exports = QwenService;
