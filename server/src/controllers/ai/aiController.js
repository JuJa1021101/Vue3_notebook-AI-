/**
 * AI 控制器
 */

const AIService = require('../../services/ai/aiService');
const { sequelize } = require('../../config/database');

const aiService = new AIService();

class AIController {
  /**
   * 智能续写
   */
  async continue(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 验证参数
      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      if (content.length > 10000) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容过长，请控制在 10000 字以内'
        };
        return;
      }

      // 调用服务
      const result = await aiService.continue(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.continue error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 格式优化
   */
  async format(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      const result = await aiService.format(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.format error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 排版美化
   */
  async beautify(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      const result = await aiService.beautify(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.beautify error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 内容润色
   */
  async polish(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      const result = await aiService.polish(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.polish error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 生成摘要
   */
  async summarize(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      if (content.length < 100) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容太短，无需生成摘要'
        };
        return;
      }

      const result = await aiService.summarize(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.summarize error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 内容扩写
   */
  async expand(ctx) {
    try {
      const { content, options = {} } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!content || typeof content !== 'string') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '内容不能为空'
        };
        return;
      }

      const result = await aiService.expand(userId, content, options);
      ctx.body = result;
    } catch (error) {
      console.error('AIController.expand error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '服务器错误'
      };
    }
  }

  /**
   * 获取 AI 设置
   */
  async getSettings(ctx) {
    try {
      const userId = ctx.state.user.id;
      console.log('📋 获取 AI 设置，用户ID:', userId);

      if (!userId) {
        console.error('❌ 用户ID为空');
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '用户未认证'
        };
        return;
      }

      const settings = await aiService.getUserSettings(userId);
      console.log('✅ 成功获取设置:', settings);

      ctx.body = {
        success: true,
        data: settings
      };
    } catch (error) {
      console.error('❌ AIController.getSettings error:', error);
      console.error('❌ 错误堆栈:', error.stack);
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
      console.log('💾 更新 AI 设置，用户ID:', userId);

      if (!userId) {
        console.error('❌ 用户ID为空');
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

      // 打印接收到的数据
      console.log('📥 接收到的设置数据:', settings);
      console.log('📥 数据类型:', typeof settings);
      console.log('📥 所有键:', Object.keys(settings));
      console.log('👤 用户 ID:', userId);

      // 首先检查用户是否有设置记录
      const existingSettings = await sequelize.query(
        'SELECT id FROM ai_settings WHERE user_id = ?',
        {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('🔍 现有设置记录:', existingSettings);

      // 如果没有记录，先创建默认记录
      if (!existingSettings || existingSettings.length === 0) {
        console.log('⚠️ 用户没有设置记录，创建默认记录');
        await sequelize.query(
          `INSERT INTO ai_settings (user_id, provider, model, default_length, default_style, default_language, stream_enabled)
           VALUES (?, 'siliconflow', 'Qwen/Qwen2.5-7B-Instruct', 'medium', 'professional', 'zh', TRUE)`,
          {
            replacements: [userId]
          }
        );
      }

      // 更新设置 - 简化逻辑，直接更新所有提供的字段
      const updateFields = [];
      const values = [];

      // default_length
      if ('default_length' in settings && settings.default_length) {
        console.log('✅ 添加 default_length:', settings.default_length);
        updateFields.push('default_length = ?');
        values.push(settings.default_length);
      }

      // default_style
      if ('default_style' in settings && settings.default_style) {
        console.log('✅ 添加 default_style:', settings.default_style);
        updateFields.push('default_style = ?');
        values.push(settings.default_style);
      }

      // default_language
      if ('default_language' in settings && settings.default_language) {
        console.log('✅ 添加 default_language:', settings.default_language);
        updateFields.push('default_language = ?');
        values.push(settings.default_language);
      }

      // stream_enabled - 特殊处理，因为可能是 false
      if ('stream_enabled' in settings) {
        console.log('✅ 添加 stream_enabled:', settings.stream_enabled, '类型:', typeof settings.stream_enabled);
        updateFields.push('stream_enabled = ?');
        values.push(settings.stream_enabled ? 1 : 0);
      } else {
        console.log('❌ stream_enabled 不在 settings 中');
      }

      console.log('🔧 准备更新的字段:', updateFields);
      console.log('📝 更新的值:', values);

      if (updateFields.length > 0) {
        values.push(userId); // WHERE 条件的参数

        console.log('🔧 执行 SQL 更新:', {
          userId,
          updateFields: updateFields.join(', '),
          values
        });

        const result = await sequelize.query(
          `UPDATE ai_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
          {
            replacements: values,
            type: sequelize.QueryTypes.UPDATE
          }
        );

        console.log('✅ SQL 更新结果:', result);

        // 验证更新是否成功 - 查询更新后的数据
        const updatedSettings = await sequelize.query(
          'SELECT * FROM ai_settings WHERE user_id = ?',
          {
            replacements: [userId],
            type: sequelize.QueryTypes.SELECT
          }
        );

        console.log('✅ 更新后的设置:', updatedSettings[0]);
      } else {
        console.log('⚠️ 没有字段需要更新');
      }

      ctx.body = {
        success: true,
        message: '设置已更新'
      };
    } catch (error) {
      console.error('❌ AIController.updateSettings error:', error);
      console.error('❌ 错误堆栈:', error.stack);
      console.error('❌ 错误详情:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
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

      ctx.body = {
        success: true,
        data: {
          today: todayStats,
          month: monthStats,
          rateLimit: rateLimit,
          limits: {
            hourly: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '50'),
            daily: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '200')
          }
        }
      };
    } catch (error) {
      console.error('AIController.getUsageStats error:', error);

      // 返回默认值而不是错误，避免影响前端显示
      ctx.body = {
        success: true,
        data: {
          today: { total_requests: 0, total_tokens: 0, total_cost: 0, avg_time: 0 },
          month: { total_requests: 0, total_tokens: 0, total_cost: 0 },
          rateLimit: { hourly_count: 0, daily_count: 0 },
          limits: {
            hourly: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '50'),
            daily: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '200')
          }
        }
      };
    }
  }
}

module.exports = new AIController();
