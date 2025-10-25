<template>
  <div>
    <transition name="slide-fade">
      <div
        v-if="showPanel"
        class="ai-panel bg-white dark:bg-gray-800 transition-colors"
      >
        <div class="panel-header">
          <h3 class="text-white">
            <i class="fas fa-magic"></i>
            AI 写作助手
          </h3>
          <button class="close-btn" @click="closePanel">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="panel-body">
          <!-- AI 功能列表 -->
          <div class="ai-actions">
            <button
              v-for="action in actions"
              :key="action.id"
              class="action-btn bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors"
              :disabled="isProcessing || !canUseAI"
              @click="handleAction(action.id)"
            >
              <i
                :class="action.icon"
                class="text-blue-600 dark:text-blue-400"
              ></i>
              <div class="action-info">
                <span class="action-name text-gray-900 dark:text-white">{{
                  action.name
                }}</span>
                <span class="action-desc text-gray-500 dark:text-gray-400">{{
                  action.description
                }}</span>
              </div>
            </button>
          </div>

          <!-- 使用统计 -->
          <div
            v-if="stats"
            class="usage-stats bg-gray-50 dark:bg-gray-700 transition-colors"
          >
            <div class="stat-item">
              <span class="stat-label text-gray-600 dark:text-gray-300"
                >今日使用</span
              >
              <span class="stat-value text-blue-600 dark:text-blue-400"
                >{{ remainingQuota.daily }} / {{ stats.limits.daily }}</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label text-gray-600 dark:text-gray-300"
                >本小时</span
              >
              <span class="stat-value text-blue-600 dark:text-blue-400"
                >{{ remainingQuota.hourly }} / {{ stats.limits.hourly }}</span
              >
            </div>
          </div>

          <!-- 设置按钮 -->
          <button
            class="settings-btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
            @click="showSettings = true"
          >
            <i class="fas fa-cog"></i>
            设置
          </button>
        </div>

        <!-- 加载状态 -->
        <div
          v-if="isProcessing"
          class="processing-overlay bg-white/95 dark:bg-gray-800/95"
        >
          <div class="spinner border-gray-200 dark:border-gray-700"></div>
          <p class="text-gray-600 dark:text-gray-300">AI 正在处理中...</p>
        </div>
      </div>
    </transition>

    <!-- 设置对话框 -->
    <AISettings v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAIStore } from "@/stores/ai";
import { AISettings } from "./index";

const aiStore = useAIStore();
const showSettings = ref(false);

const showPanel = computed(() => aiStore.showPanel);
const isProcessing = computed(() => aiStore.isProcessing);
const canUseAI = computed(() => aiStore.canUseAI);
const stats = computed(() => aiStore.stats);
const remainingQuota = computed(() => aiStore.remainingQuota);

const actions = [
  {
    id: "continue",
    name: "智能续写",
    icon: "fas fa-pen-fancy",
    description: "根据上下文继续写作",
  },
  {
    id: "polish",
    name: "内容润色",
    icon: "fas fa-wand-magic-sparkles",
    description: "优化语言表达",
  },
  {
    id: "format",
    name: "格式优化",
    icon: "fas fa-align-left",
    description: "规范文本格式",
  },
  {
    id: "beautify",
    name: "排版美化",
    icon: "fas fa-palette",
    description: "优化段落结构",
  },
  {
    id: "summarize",
    name: "生成摘要",
    icon: "fas fa-list-ul",
    description: "提取核心要点",
  },
  {
    id: "expand",
    name: "内容扩写",
    icon: "fas fa-expand-arrows-alt",
    description: "扩展详细内容",
  },
];

const emit = defineEmits<{
  action: [actionId: string];
}>();

const handleAction = (actionId: string) => {
  emit("action", actionId);
};

const closePanel = () => {
  aiStore.closePanel();
};

onMounted(() => {
  aiStore.fetchStats();
});
</script>

<style scoped lang="less">
.ai-panel {
  position: fixed;
  right: 30px;
  bottom: 170px;
  width: 320px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 998;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #ffe0b2 0%, #ffab91 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }

  .panel-body {
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;

    .ai-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: left;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        i {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }

        .action-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .action-name {
            font-size: 14px;
            font-weight: 500;
          }

          .action-desc {
            font-size: 12px;
          }
        }

        &:hover:not(:disabled) {
          @apply bg-blue-50 dark:bg-blue-900/20;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .usage-stats {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;

        .stat-label {
          font-size: 13px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 600;
        }
      }
    }

    .settings-btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover {
        @apply bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .processing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid;
      @apply border-gray-200 dark:border-gray-700;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .ai-panel {
    right: 20px;
    bottom: 140px;
    width: calc(100vw - 40px);
    max-width: 320px;
  }
}
</style>
