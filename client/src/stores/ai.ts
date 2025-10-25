/**
 * AI 助手 Store
 */

import { defineStore } from 'pinia';
import { aiAPI, type AIOptions, type AISettings, type AIStats } from '@/api/ai';

export type AIAction = 'continue' | 'format' | 'beautify' | 'polish' | 'summarize' | 'expand';

interface AIState {
  isProcessing: boolean;
  currentAction: AIAction | null;
  result: string | null;
  error: string | null;
  settings: AISettings | null;
  stats: AIStats | null;
  showPanel: boolean;
  showPreview: boolean;
  originalContent: string;
  processedContent: string;
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    isProcessing: false,
    currentAction: null,
    result: null,
    error: null,
    settings: null,
    stats: null,
    showPanel: false,
    showPreview: false,
    originalContent: '',
    processedContent: '',
  }),

  getters: {
    /**
     * 是否可以使用 AI
     */
    canUseAI: (state) => {
      if (!state.stats) return true;
      const { rateLimit, limits } = state.stats;
      return rateLimit.hourly_count < limits.hourly && rateLimit.daily_count < limits.daily;
    },

    /**
     * 剩余配额
     */
    remainingQuota: (state) => {
      if (!state.stats) return { hourly: 0, daily: 0 };
      const { rateLimit, limits } = state.stats;
      return {
        hourly: limits.hourly - rateLimit.hourly_count,
        daily: limits.daily - rateLimit.daily_count,
      };
    },
  },

  actions: {
    /**
     * 智能续写
     */
    async continue(content: string, options?: AIOptions) {
      return await this.processAI('continue', content, options);
    },

    /**
     * 格式优化
     */
    async format(content: string, options?: AIOptions) {
      return await this.processAI('format', content, options);
    },

    /**
     * 排版美化
     */
    async beautify(content: string, options?: AIOptions) {
      return await this.processAI('beautify', content, options);
    },

    /**
     * 内容润色
     */
    async polish(content: string, options?: AIOptions) {
      return await this.processAI('polish', content, options);
    },

    /**
     * 生成摘要
     */
    async summarize(content: string, options?: AIOptions) {
      return await this.processAI('summarize', content, options);
    },

    /**
     * 内容扩写
     */
    async expand(content: string, options?: AIOptions) {
      return await this.processAI('expand', content, options);
    },

    /**
     * 处理 AI 请求（核心方法）
     */
    async processAI(action: AIAction, content: string, options?: AIOptions) {
      this.isProcessing = true;
      this.currentAction = action;
      this.error = null;
      this.originalContent = content;

      try {
        // 检查是否启用流式输出
        const streamEnabled = this.settings?.stream_enabled || false;

        if (streamEnabled) {
          // 使用流式输出
          return await this.processAIStream(action, content, options);
        } else {
          // 使用普通输出
          const apiMethod = aiAPI[action];
          const response = await apiMethod({ content, options });

          if (response.success && response.data) {
            let result = response.data.result;

            // 对于续写和扩写操作，如果 AI 返回的内容包含原文，则去除原文部分
            if (action === 'continue' || action === 'expand') {
              result = this.removeOriginalContent(result, content);
            }

            // 对于格式优化操作，去除说明内容
            if (action === 'format') {
              // 去除开头的说明内容
              const startMatch = result.match(/[：:]\s*\n/);
              if (startMatch && startMatch.index !== undefined) {
                result = result.substring(startMatch.index + 1).trim();
              }

              // 去除结尾的优化说明部分
              const endKeywords = ['优化说明', '如图所示'];
              for (const keyword of endKeywords) {
                const keywordIndex = result.lastIndexOf(keyword);
                if (keywordIndex !== -1) {
                  result = result.substring(0, keywordIndex).trim();
                  break;
                }
              }
            }

            this.result = result;
            this.processedContent = result;
            this.showPreview = true;
            return result;
          } else {
            this.error = response.message || 'AI 处理失败';
            throw new Error(this.error || 'AI 处理失败');
          }
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },

    /**
     * 处理流式 AI 请求
     */
    async processAIStream(action: AIAction, content: string, options?: AIOptions) {
      return new Promise((resolve, reject) => {
        const apiMethod = aiAPI[action];
        let fullResult = '';

        // 调用流式 API
        apiMethod({
          content,
          options: { ...options, streamEnabled: true }
        }, (chunk: string) => {
          // 接收数据块
          fullResult += chunk;
          this.result = fullResult;
          this.processedContent = fullResult;
          this.showPreview = true;
        }).then(() => {
          // 流式输出完成
          let result = fullResult;

          // 对于续写和扩写操作，去除原文部分
          if (action === 'continue' || action === 'expand') {
            result = this.removeOriginalContent(result, content);
          }

          // 对于格式优化操作，去除说明内容
          if (action === 'format' || action === 'beautify') {
            // 只去除明确的说明性前缀（如"格式优化后："、"优化结果："等）
            const prefixPatterns = [
              /^格式优化后[：:]\s*\n/,
              /^优化结果[：:]\s*\n/,
              /^排版美化后[：:]\s*\n/,
              /^以下是优化后的内容[：:]\s*\n/
            ];

            for (const pattern of prefixPatterns) {
              const match = result.match(pattern);
              if (match) {
                result = result.substring(match[0].length).trim();
                break;
              }
            }

            // 去除结尾的优化说明部分（更精确的匹配）
            const endPatterns = [
              /\n\n---\s*\n优化说明[：:][\s\S]*$/,
              /\n\n优化说明[：:][\s\S]*$/,
              /\n\n如图所示[\s\S]*$/
            ];

            for (const pattern of endPatterns) {
              const match = result.match(pattern);
              if (match) {
                result = result.substring(0, match.index).trim();
                break;
              }
            }
          }

          this.result = result;
          this.processedContent = result;
          resolve(result);
        }).catch((error: any) => {
          this.error = error.message || '流式输出失败';
          reject(error);
        });
      });
    },

    /**
     * 去除 AI 返回内容中的原文部分
     */
    removeOriginalContent(aiResult: string, originalContent: string): string {
      // 清理空白字符以便比较
      const cleanOriginal = originalContent.trim();
      const cleanResult = aiResult.trim();

      // 如果 AI 返回的内容以原文开头，则去除原文部分
      if (cleanResult.startsWith(cleanOriginal)) {
        let newContent = cleanResult.substring(cleanOriginal.length).trim();
        // 去除开头的标点符号和换行
        newContent = newContent.replace(/^[，。、；：！？\s\n]+/, '');
        return newContent;
      }

      // 尝试查找原文在返回内容中的位置
      const originalIndex = cleanResult.indexOf(cleanOriginal);
      if (originalIndex !== -1 && originalIndex < 50) {
        // 如果原文在前50个字符内出现，认为是重复了
        let newContent = cleanResult.substring(originalIndex + cleanOriginal.length).trim();
        newContent = newContent.replace(/^[，。、；：！？\s\n]+/, '');
        return newContent;
      }

      // 没有发现重复，返回原结果
      return aiResult;
    },

    /**
     * 获取设置
     */
    async fetchSettings() {
      try {
        const response = await aiAPI.getSettings();
        if (response.success) {
          this.settings = response.data;
        }
      } catch (error) {
        console.error('获取 AI 设置失败:', error);
      }
    },

    /**
     * 更新设置
     */
    async updateSettings(settings: Partial<AISettings>) {
      try {
        console.log('🔄 Store: 更新设置', settings);
        const response = await aiAPI.updateSettings(settings);
        console.log('📡 Store: API 响应', response);
        if (response.success) {
          console.log('✅ Store: 更新成功，重新获取设置');
          await this.fetchSettings();
          console.log('📋 Store: 新设置', this.settings);
          return true;
        }
        console.warn('⚠️ Store: 更新失败', response);
        return false;
      } catch (error) {
        console.error('❌ Store: 更新 AI 设置失败:', error);
        return false;
      }
    },

    /**
     * 获取统计
     */
    async fetchStats() {
      try {
        const response = await aiAPI.getStats();
        if (response.success) {
          this.stats = response.data;
        }
      } catch (error) {
        console.error('获取 AI 统计失败:', error);
      }
    },

    /**
     * 切换面板显示
     */
    togglePanel() {
      this.showPanel = !this.showPanel;
    },

    /**
     * 关闭面板
     */
    closePanel() {
      this.showPanel = false;
    },

    /**
     * 关闭预览
     */
    closePreview() {
      this.showPreview = false;
      this.originalContent = '';
      this.processedContent = '';
    },

    /**
     * 应用结果
     */
    applyResult() {
      this.closePreview();
      return this.processedContent;
    },

    /**
     * 重置状态
     */
    reset() {
      this.isProcessing = false;
      this.currentAction = null;
      this.result = null;
      this.error = null;
      this.showPreview = false;
      this.originalContent = '';
      this.processedContent = '';
    },
  },
});
