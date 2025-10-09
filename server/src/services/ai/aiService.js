/**
 * AI 服务 - 业务逻辑层
 */

const QwenService = require('./qwenService');
const { buildPrompt } = require('../../utils/ai/promptTemplates');
const { sequelize } = require('../../config/database');

class AIService {
  constructor() {
    this.qwenService = new QwenService();
  }

  /**
   * 智能续写
   */
  async continue(userId, content, options = {}) {
    return await this.processAI(userId, 'continue', content, options);
  }

  /**
   * 格式优化
   */
  async format(userId, content, options = {}) {
    return await this.processAI(userId, 'format', content, options);
  }

  /**
   * 排版美化
   */
  async beautify(userId, content, options = {}) {
    return await this.processAI(userId, 'beautify', content, options);
  }

  /**
   * 内容润色
   */
  async polish(userId, content, options = {}) {
    return await this.processAI(userId, 'polish', content, options);
  }

  /**
   * 生成摘要
   */
  async summarize(userId, content, options = {}) {
    return await this.processAI(userId, 'summarize', content, options);
  }

  /**
   * 内容扩写
   */
  async expand(userId, content, options = {}) {
    return await this.processAI(userId, 'expand', content, options);
  }

  /**
   * 处理 AI 请求（核心方法）
   */
  async processAI(userId, action, content, options = {}) {
    const startTime = Date.now();

    try {
      // 1. 检查限流
      const canProceed = await this.checkRateLimit(userId);
      if (!canProceed) {
        return {
          success: false,
          message: '请求过于频繁，请稍后再试'
        };
      }

      // 2. 获取用户设置
      const userSettings = await this.getUserSettings(userId);

      // 3. 合并选项
      const finalOptions = {
        language: options.language || userSettings.default_language || 'zh',
        length: options.length || userSettings.default_length || 'medium',
        style: options.style || userSettings.default_style || 'professional',
        maxTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        streamEnabled: options.streamEnabled !== undefined ? options.streamEnabled : userSettings.stream_enabled
      };

      // 4. 构建 Prompt
      const prompt = buildPrompt(action, content, finalOptions);

      // 5. 调用 AI API（根据设置选择流式或非流式）
      const result = await this.qwenService.complete(prompt, finalOptions);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 6. 记录使用日志
      await this.logUsage({
        userId,
        noteId: options.noteId || null,
        action,
        inputLength: content.length,
        outputLength: result.result?.length || 0,
        tokensUsed: result.tokensUsed || 0,
        cost: this.calculateCost(result.tokensUsed || 0),
        provider: 'siliconflow',
        model: result.model || this.qwenService.model,
        success: result.success,
        errorMessage: result.error || null,
        processingTime
      });

      // 7. 保存到历史记录
      if (result.success && options.saveHistory !== false) {
        await this.saveHistory({
          userId,
          noteId: options.noteId || null,
          action,
          originalContent: content,
          resultContent: result.result,
          options: finalOptions,
          tokensUsed: result.tokensUsed || 0
        });
      }

      // 8. 返回结果
      if (result.success) {
        return {
          success: true,
          data: {
            result: result.result,
            tokensUsed: result.tokensUsed,
            processingTime
          }
        };
      } else {
        return {
          success: false,
          message: result.error || 'AI 处理失败'
        };
      }
    } catch (error) {
      console.error('AIService.processAI error:', error);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 记录失败日志
      await this.logUsage({
        userId,
        noteId: options.noteId || null,
        action,
        inputLength: content.length,
        outputLength: 0,
        tokensUsed: 0,
        cost: 0,
        provider: 'siliconflow',
        model: this.qwenService.model,
        success: false,
        errorMessage: error.message,
        processingTime
      });

      return {
        success: false,
        message: '服务器错误，请稍后再试'
      };
    }
  }

  /**
   * 处理流式 AI 请求
   */
  async processAIStream(userId, action, content, options = {}, ctx) {
    const startTime = Date.now();

    try {
      // 1. 检查限流
      const canProceed = await this.checkRateLimit(userId);
      if (!canProceed) {
        ctx.status = 429;
        ctx.body = {
          success: false,
          message: '请求过于频繁，请稍后再试'
        };
        return;
      }

      // 2. 获取用户设置
      const userSettings = await this.getUserSettings(userId);

      // 3. 合并选项
      const finalOptions = {
        language: options.language || userSettings.default_language || 'zh',
        length: options.length || userSettings.default_length || 'medium',
        style: options.style || userSettings.default_style || 'professional',
        maxTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7
      };

      // 4. 构建 Prompt
      const prompt = buildPrompt(action, content, finalOptions);

      // 5. 设置 SSE 响应头
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      ctx.status = 200;

      let fullContent = '';
      let tokensUsed = 0;

      // 6. 调用流式 API
      const result = await this.qwenService.streamComplete(prompt, finalOptions, (chunk) => {
        // 实时发送数据块
        fullContent += chunk;
        ctx.res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      if (result.success) {
        tokensUsed = result.tokensUsed || 0;

        // 发送完成信号
        ctx.res.write(`data: ${JSON.stringify({
          done: true,
          tokensUsed,
          processingTime
        })}\n\n`);

        // 记录使用日志
        await this.logUsage({
          userId,
          noteId: options.noteId || null,
          action,
          inputLength: content.length,
          outputLength: fullContent.length,
          tokensUsed,
          cost: this.calculateCost(tokensUsed),
          provider: 'siliconflow',
          model: this.qwenService.model,
          success: true,
          errorMessage: null,
          processingTime
        });

        // 保存到历史记录
        if (options.saveHistory !== false) {
          await this.saveHistory({
            userId,
            noteId: options.noteId || null,
            action,
            originalContent: content,
            resultContent: fullContent,
            options: finalOptions,
            tokensUsed
          });
        }
      } else {
        // 发送错误信号
        ctx.res.write(`data: ${JSON.stringify({
          done: true,
          error: result.error
        })}\n\n`);

        // 记录失败日志
        await this.logUsage({
          userId,
          noteId: options.noteId || null,
          action,
          inputLength: content.length,
          outputLength: 0,
          tokensUsed: 0,
          cost: 0,
          provider: 'siliconflow',
          model: this.qwenService.model,
          success: false,
          errorMessage: result.error,
          processingTime
        });
      }

      ctx.res.end();
    } catch (error) {
      console.error('AIService.processAIStream error:', error);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 发送错误信号
      ctx.res.write(`data: ${JSON.stringify({
        done: true,
        error: error.message
      })}\n\n`);
      ctx.res.end();

      // 记录失败日志
      await this.logUsage({
        userId,
        noteId: options.noteId || null,
        action,
        inputLength: content.length,
        outputLength: 0,
        tokensUsed: 0,
        cost: 0,
        provider: 'siliconflow',
        model: this.qwenService.model,
        success: false,
        errorMessage: error.message,
        processingTime
      });
    }
  }

  /**
   * 检查限流
   */
  async checkRateLimit(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentHour = new Date().getHours();

      // 查询今天的限流记录
      const rows = await sequelize.query(
        'SELECT * FROM ai_rate_limits WHERE user_id = ? AND request_date = ?',
        {
          replacements: [userId, today],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!rows || rows.length === 0) {
        // 创建新记录
        await sequelize.query(
          'INSERT INTO ai_rate_limits (user_id, request_date, hourly_count, daily_count) VALUES (?, ?, 1, 1)',
          {
            replacements: [userId, today]
          }
        );
        return true;
      }

      const record = rows[0];

      // 检查限制
      const hourlyLimit = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '50');
      const dailyLimit = parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '200');

      // 检查小时限制
      const lastRequestTime = new Date(record.last_request_at);
      const lastRequestHour = lastRequestTime.getHours();

      if (lastRequestHour !== currentHour) {
        // 新的小时，重置小时计数
        await sequelize.query(
          'UPDATE ai_rate_limits SET hourly_count = 1, daily_count = daily_count + 1 WHERE id = ?',
          {
            replacements: [record.id]
          }
        );
        return record.daily_count < dailyLimit;
      }

      // 同一小时内
      if (record.hourly_count >= hourlyLimit) {
        return false;
      }

      if (record.daily_count >= dailyLimit) {
        return false;
      }

      // 更新计数
      await sequelize.query(
        'UPDATE ai_rate_limits SET hourly_count = hourly_count + 1, daily_count = daily_count + 1 WHERE id = ?',
        {
          replacements: [record.id]
        }
      );

      return true;
    } catch (error) {
      console.error('checkRateLimit error:', error);
      // 出错时允许请求（避免阻塞用户）
      return true;
    }
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(userId) {
    try {
      const rows = await sequelize.query(
        'SELECT * FROM ai_settings WHERE user_id = ?',
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (rows && rows.length > 0) {
        const settings = rows[0];
        // 将数据库的 TINYINT(1) 转换为布尔值
        return {
          ...settings,
          stream_enabled: Boolean(settings.stream_enabled)
        };
      }

      // 创建默认设置
      await sequelize.query(
        `INSERT INTO ai_settings (user_id, provider, model, default_length, default_style, default_language, stream_enabled)
         VALUES (?, 'siliconflow', 'Qwen/Qwen2.5-7B-Instruct', 'medium', 'professional', 'zh', TRUE)`,
        {
          replacements: [userId]
        }
      );

      return {
        provider: 'siliconflow',
        model: 'Qwen/Qwen2.5-7B-Instruct',
        default_length: 'medium',
        default_style: 'professional',
        default_language: 'zh',
        stream_enabled: true
      };
    } catch (error) {
      console.error('getUserSettings error:', error);
      return {
        default_length: 'medium',
        default_style: 'professional',
        default_language: 'zh'
      };
    }
  }

  /**
   * 记录使用日志
   */
  async logUsage(logData) {
    try {
      await sequelize.query(
        `INSERT INTO ai_usage_logs 
         (user_id, note_id, action, input_length, output_length, tokens_used, cost, provider, model, success, error_message, processing_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            logData.userId,
            logData.noteId,
            logData.action,
            logData.inputLength,
            logData.outputLength,
            logData.tokensUsed,
            logData.cost,
            logData.provider,
            logData.model,
            logData.success,
            logData.errorMessage,
            logData.processingTime
          ]
        }
      );
    } catch (error) {
      console.error('❌ logUsage error:', error.message);
    }
  }

  /**
   * 保存历史记录
   */
  async saveHistory(historyData) {
    try {
      // 设置过期时间（30天后）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await sequelize.query(
        `INSERT INTO ai_history 
         (user_id, note_id, action, original_content, result_content, options, tokens_used, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            historyData.userId,
            historyData.noteId,
            historyData.action,
            historyData.originalContent,
            historyData.resultContent,
            JSON.stringify(historyData.options),
            historyData.tokensUsed,
            expiresAt
          ]
        }
      );
    } catch (error) {
      console.error('❌ saveHistory error:', error.message);
    }
  }

  /**
   * 计算成本
   */
  calculateCost(tokensUsed) {
    // 硅基流动的定价（示例，实际需要根据官方定价调整）
    // 假设：每 1000 tokens 约 ¥0.01
    return (tokensUsed / 1000) * 0.01;
  }
}

module.exports = AIService;
