/**
 * AI 控制器
 */

const AIService = require('../../services/ai/aiService');
const { sequelize } = require('../../config/database');
const { getUserLimits, formatLimitInfo } = require('../../config/aiLimits');
const { validateContent, handleAIRequest } = require('../../utils/aiControllerHelper');
const logger = require('../../utils/logger');

const aiService = new AIService();

class AIController {
  /**
   * 智能续写
   */
  async continue(ctx) {
    const { content, options = {} } = ctx.request.body;

    // 验证参数
    const validationError = validateContent(content);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }

    await handleAIRequest(ctx, aiService, 'continue', content, options);
  }

  /**
   * 格式优化
   */
  async format(ctx) {
    const { content, options = {} } = ctx.request.body;
    const validationError = validateContent(content);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }
    await handleAIRequest(ctx, aiService, 'format', content, options);
  }

  /**
   * 排版美化
   */
  async beautify(ctx) {
    const { content, options = {} } = ctx.request.body;
    const validationError = validateContent(content);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }
    await handleAIRequest(ctx, aiService, 'beautify', content, options);
  }

  /**
   * 内容润色
   */
  async polish(ctx) {
    const { content, options = {} } = ctx.request.body;
    const validationError = validateContent(content);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }
    await handleAIRequest(ctx, aiService, 'polish', content, options);
  }

  /**
   * 生成摘要
   */
  async summarize(ctx) {
    const { content, options = {} } = ctx.request.body;
    const validationError = validateContent(content, 100);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }
    await handleAIRequest(ctx, aiService, 'summarize', content, options);
  }

  /**
   * 内容扩写
   */
  async expand(ctx) {
    const { content, options = {} } = ctx.request.body;
    const validationError = validateContent(content);
    if (validationError) {
      ctx.status = validationError.status;
      ctx.body = validationError.body;
      return;
    }
    await handleAIRequest(ctx, aiService, 'expand', content, options);
  }

  /**
   * 获取 AI 设置
   */
  async getSettings(ctx) {
    try {
      const userId = ctx.state.user.id;
      logger.debug('获取 AI 设置，用户ID:', userId);

      if (!userId) {
        logger.error('用户ID为空');
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '用户未认证'
        };
        return;
      }

      const settings = await aiService.getUserSettings(userId);
      logger.debug('成功获取设置:', settings);

      ctx.body = {
        success: true,
        data: settings
      };
    } catch (error) {
      logger.error('AIController.getSettings error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误: ' + error.message
      };
    }
  }

  /**
   * 更新 AI 设置
   */
  async updateSettings(ctx) {
    try {
      const userId = ctx.state.user.id;
      logger.debug('更新 AI 设置，用户ID:', userId);

      if (!userId) {
        logger.error('用户ID为空');
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '用户未认证'
        };
        return;
      }

      const settings = ctx.request.body;

      // 验证设置
      const validLengths = ['short', 'medium', 'long'];
      const validStyles = ['formal', 'casual', 'professional', 'creative'];
      const validLanguages = ['zh', 'en'];

      if (settings.default_length && !validLengths.includes(settings.default_length)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '无效的长度设置'
        };
        return;
      }

      if (settings.default_style && !validStyles.includes(settings.default_style)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '无效的风格设置'
        };
        return;
      }

      if (settings.default_language && !validLanguages.includes(settings.default_language)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '无效的语言设置'
        };
        return;
      }

      logger.debug('接收到的设置数据:', settings);

      // 首先检查用户是否有设置记录
      const existingSettings = await sequelize.query(
        'SELECT id FROM ai_settings WHERE user_id = ?',
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      // 如果没有记录，先创建默认记录
      if (!existingSettings || existingSettings.length === 0) {
        logger.info('用户没有设置记录，创建默认记录');
        await sequelize.query(
          `INSERT INTO ai_settings (user_id, provider, model, default_length, default_style, default_language, stream_enabled)
           VALUES (?, 'siliconflow', 'Qwen/Qwen2.5-7B-Instruct', 'medium', 'professional', 'zh', TRUE)`,
          {
            replacements: [userId]
          }
        );
      }

      // 更新设置
      const updateFields = [];
      const values = [];

      if ('default_length' in settings && settings.default_length) {
        updateFields.push('default_length = ?');
        values.push(settings.default_length);
      }

      if ('default_style' in settings && settings.default_style) {
        updateFields.push('default_style = ?');
        values.push(settings.default_style);
      }

      if ('default_language' in settings && settings.default_language) {
        updateFields.push('default_language = ?');
        values.push(settings.default_language);
      }

      if ('stream_enabled' in settings) {
        updateFields.push('stream_enabled = ?');
        values.push(settings.stream_enabled ? 1 : 0);
      }

      if (updateFields.length > 0) {
        values.push(userId);

        await sequelize.query(
          `UPDATE ai_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
          {
            replacements: values,
            type: sequelize.QueryTypes.UPDATE
          }
        );

        logger.debug('设置更新成功');
      }

      ctx.body = {
        success: true,
        message: '设置已更新'
      };
    } catch (error) {
      logger.error('AIController.updateSettings error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误: ' + error.message
      };
    }
  }

  /**
   * 获取使用统计
   */
  async getUsageStats(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 获取今日使用情况
      const todayStatsResult = await sequelize.query(
        `SELECT 
          COALESCE(COUNT(*), 0) as total_requests,
          COALESCE(SUM(tokens_used), 0) as total_tokens,
          COALESCE(SUM(cost), 0) as total_cost,
          COALESCE(AVG(processing_time), 0) as avg_time
         FROM ai_usage_logs
         WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );
      const todayStats = todayStatsResult[0] || { total_requests: 0, total_tokens: 0, total_cost: 0, avg_time: 0 };

      // 获取本月使用情况
      const monthStatsResult = await sequelize.query(
        `SELECT 
          COALESCE(COUNT(*), 0) as total_requests,
          COALESCE(SUM(tokens_used), 0) as total_tokens,
          COALESCE(SUM(cost), 0) as total_cost
         FROM ai_usage_logs
         WHERE user_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`,
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );
      const monthStats = monthStatsResult[0] || { total_requests: 0, total_tokens: 0, total_cost: 0 };

      // 获取用户信息和限制配置
      const userInfo = await aiService.getUserInfo(userId);
      const limits = getUserLimits(userInfo);

      // 获取限流信息
      const today = new Date().toISOString().split('T')[0];
      const rateLimitResult = await sequelize.query(
        'SELECT * FROM ai_rate_limits WHERE user_id = ? AND request_date = ?',
        {
          replacements: [userId, today],
          type: sequelize.QueryTypes.SELECT
        }
      );
      const rateLimit = rateLimitResult.length > 0 ? rateLimitResult[0] : { hourly_count: 0, daily_count: 0 };

      // 格式化限制信息
      const limitInfo = formatLimitInfo(limits, rateLimit);

      ctx.body = {
        success: true,
        data: {
          today: todayStats,
          month: monthStats,
          rateLimit: rateLimit,
          limits: {
            hourly: limits.hourly,
            daily: limits.daily
          },
          limitInfo: limitInfo,
          userTier: limits.tier,
          isUnlimited: limits.isUnlimited
        }
      };
    } catch (error) {
      logger.error('AIController.getUsageStats error:', error);

      // 返回默认值而不是错误，避免影响前端显示
      ctx.body = {
        success: true,
        data: {
          today: { total_requests: 0, total_tokens: 0, total_cost: 0, avg_time: 0 },
          month: { total_requests: 0, total_tokens: 0, total_cost: 0 },
          rateLimit: { hourly_count: 0, daily_count: 0 },
          limits: {
            hourly: 30,
            daily: 200
          },
          limitInfo: null,
          userTier: 'free',
          isUnlimited: false
        }
      };
    }
  }
}

module.exports = new AIController();
