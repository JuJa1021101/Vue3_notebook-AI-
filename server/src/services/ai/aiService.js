/**
 * AI 服务 - 业务逻辑层
 */

const QwenService = require('./qwenService');
const { buildPrompt } = require('../../utils/ai/promptTemplates');
const { sequelize } = require('../../config/database');
const { getUserLimits, isLimitExceeded, formatLimitInfo } = require('../../config/aiLimits');

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
      const rateLimitResult = await this.checkRateLimit(userId);
      if (!rateLimitResult.canProceed) {
        return {
          success: false,
          message: rateLimitResult.message || '已达到使用限制，请升级会员以继续使用 AI 功能'
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
      const rateLimitResult = await this.checkRateLimit(userId);
      if (!rateLimitResult.canProceed) {
        ctx.status = 429;
        ctx.body = {
          success: false,
          message: rateLimitResult.message || '已达到使用限制，请升级会员以继续使用 AI 功能'
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

        console.log('✅ 流式处理完成:', {
          tokensUsed,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          processingTime: processingTime + 'ms',
          contentLength: fullContent.length
        });

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
        console.error('❌ 流式处理失败:', result.error);

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
      console.error('❌ AIService.processAIStream error:', {
        message: error.message,
        stack: error.stack
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      try {
        // 发送错误信号
        ctx.res.write(`data: ${JSON.stringify({
          done: true,
          error: error.message || '服务器错误'
        })}\n\n`);
        ctx.res.end();
      } catch (writeError) {
        console.error('❌ 发送错误信号失败:', writeError.message);
      }

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
   * @returns {Object} { canProceed: boolean, message: string }
   */
  async checkRateLimit(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentHour = new Date().getHours();

      // 获取用户信息和限制配置
      const userInfo = await this.getUserInfo(userId);
      const limits = getUserLimits(userInfo);

      // 如果是无限制用户，直接通过
      if (limits.isUnlimited) {
        return { canProceed: true };
      }

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
        return { canProceed: true };
      }

      const record = rows[0];

      // 检查小时限制
      const lastRequestTime = new Date(record.last_request_at);
      const lastRequestHour = lastRequestTime.getHours();

      if (lastRequestHour !== currentHour) {
        // 新的小时，重置小时计数
        const newDailyCount = record.daily_count + 1;

        // 检查每日限制
        if (isLimitExceeded(newDailyCount, limits.daily)) {
          console.warn(`⚠️ 用户 ${userId} 超过每日限制: ${newDailyCount}/${limits.daily}`);
          return {
            canProceed: false,
            message: `今日使用次数已达上限（${limits.daily}次），请明天再试或升级会员`
          };
        }

        await sequelize.query(
          'UPDATE ai_rate_limits SET hourly_count = 1, daily_count = ? WHERE id = ?',
          {
            replacements: [newDailyCount, record.id]
          }
        );
        return { canProceed: true };
      }

      // 同一小时内，检查小时和每日限制
      if (isLimitExceeded(record.hourly_count, limits.hourly)) {
        console.warn(`⚠️ 用户 ${userId} 超过小时限制: ${record.hourly_count}/${limits.hourly}`);
        return {
          canProceed: false,
          message: `本小时使用次数已达上限（${limits.hourly}次），请稍后再试或升级会员`
        };
      }

      if (isLimitExceeded(record.daily_count, limits.daily)) {
        console.warn(`⚠️ 用户 ${userId} 超过每日限制: ${record.daily_count}/${limits.daily}`);
        return {
          canProceed: false,
          message: `今日使用次数已达上限（${limits.daily}次），请明天再试或升级会员`
        };
      }

      // 更新计数
      await sequelize.query(
        'UPDATE ai_rate_limits SET hourly_count = hourly_count + 1, daily_count = daily_count + 1 WHERE id = ?',
        {
          replacements: [record.id]
        }
      );

      return { canProceed: true };
    } catch (error) {
      console.error('checkRateLimit error:', error);
      // 出错时允许请求（避免阻塞用户）
      return { canProceed: true };
    }
  }

  /**
   * 获取用户信息（包括等级和订阅状态）
   */
  async getUserInfo(userId) {
    try {
      const rows = await sequelize.query(
        'SELECT id, tier, is_subscribed, subscription_expiry FROM users WHERE id = ?',
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (rows && rows.length > 0) {
        const user = rows[0];
        return {
          id: user.id,
          tier: user.tier || 'free',
          isSubscribed: Boolean(user.is_subscribed),
          subscriptionExpiry: user.subscription_expiry
        };
      }

      // 默认返回免费用户
      return {
        id: userId,
        tier: 'free',
        isSubscribed: false,
        subscriptionExpiry: null
      };
    } catch (error) {
      console.error('getUserInfo error:', error);
      // 出错时返回免费用户配置
      return {
        id: userId,
        tier: 'free',
        isSubscribed: false,
        subscriptionExpiry: null
      };
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
