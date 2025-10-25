<template>
  <div class="ai-preview-modal" @click.self="close">
    <div class="modal-content bg-white dark:bg-gray-800 transition-colors">
      <div class="modal-header border-gray-200 dark:border-gray-700">
        <h3 class="text-gray-900 dark:text-white">AI 处理结果</h3>
        <button
          class="close-btn text-gray-400 dark:text-gray-500"
          @click="close"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" ref="modalBodyRef">
        <div class="preview-container">
          <!-- 原文 -->
          <div class="preview-section">
            <div class="section-header text-gray-600 dark:text-gray-300">
              <i class="fas fa-file-alt text-blue-600 dark:text-blue-400"></i>
              <span>原文</span>
            </div>
            <div
              class="content-box bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors"
            >
              {{ originalContent }}
            </div>
          </div>

          <!-- 分隔符 -->
          <div class="divider">
            <i class="fas fa-arrow-down"></i>
          </div>

          <!-- AI 处理后 -->
          <div class="preview-section">
            <div class="section-header text-gray-600 dark:text-gray-300">
              <i class="fas fa-magic text-blue-600 dark:text-blue-400"></i>
              <span>AI 优化后</span>
              <div v-if="isProcessing" class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
            <div
              class="content-box highlight prose bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-gray-100 transition-colors"
              ref="processedContentRef"
              :class="{ streaming: isProcessing }"
            >
              <!-- 对于格式优化和排版美化操作，使用解析后的Markdown -->
              <template v-if="shouldRenderMarkdown">
                <div v-html="parsedMarkdown"></div>
              </template>
              <!-- 其他操作保持原样显示 -->
              <template v-else>
                {{ processedContent }}
              </template>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="stats" class="stats-info">
          <div class="stat-item">
            <i class="fas fa-clock"></i>
            <span>处理时间: {{ stats.processingTime }}ms</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-coins"></i>
            <span>使用 Tokens: {{ stats.tokensUsed }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer border-gray-200 dark:border-gray-700">
        <button
          class="btn btn-secondary bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          @click="close"
        >
          <i class="fas fa-times"></i>
        </button>
        <button
          class="btn btn-regenerate bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
          @click="regenerate"
        >
          <i class="fas fa-redo"></i>
        </button>
        <button class="btn btn-primary" @click="apply">
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useAIStore } from "@/stores/ai";
import { marked } from "marked";

const aiStore = useAIStore();

const originalContent = computed(() => aiStore.originalContent);
const processedContent = computed(() => aiStore.processedContent);
const isProcessing = computed(() => aiStore.isProcessing);
const currentAction = computed(() => aiStore.currentAction);
const processedContentRef = ref<HTMLElement | null>(null);
const modalBodyRef = ref<HTMLElement | null>(null);

// 判断是否需要渲染Markdown（只针对格式优化和排版美化操作）
const shouldRenderMarkdown = computed(() => {
  return currentAction.value === "format" || currentAction.value === "beautify";
});

// 解析Markdown内容
const parsedMarkdown = computed(() => {
  if (!shouldRenderMarkdown.value || !processedContent.value) {
    return "";
  }
  return marked(processedContent.value);
});

// 监听 processedContent 的变化，自动滚动到底部
watch(processedContent, async () => {
  await nextTick();

  // 1. 滚动内容区域到底部
  if (processedContentRef.value) {
    processedContentRef.value.scrollTo({
      top: processedContentRef.value.scrollHeight,
      behavior: "smooth",
    });
  }

  // 2. 滚动整个模态框body到底部（最右边的滚动条）
  if (modalBodyRef.value) {
    modalBodyRef.value.scrollTo({
      top: modalBodyRef.value.scrollHeight,
      behavior: "smooth",
    });
  }
});

const stats = computed(() => {
  if (!aiStore.result) return null;
  return {
    processingTime: 0, // 从实际响应中获取
    tokensUsed: 0, // 从实际响应中获取
  };
});

const emit = defineEmits<{
  close: [];
  apply: [result: string];
  regenerate: [];
}>();

const close = () => {
  aiStore.closePreview();
  emit("close");
};

const apply = () => {
  // 检查当前操作是否为扩写
  const isExpandAction = aiStore.currentAction === "expand";

  // 如果是扩写操作，则直接使用AI处理后的内容替换原文
  // 如果是续写操作，保持原文与AI处理后内容的拼接逻辑
  // 其他操作保持原有的逻辑不变
  const result = isExpandAction
    ? aiStore.processedContent
    : aiStore.currentAction === "continue"
    ? aiStore.originalContent + aiStore.processedContent
    : aiStore.processedContent;

  emit("apply", result);
  aiStore.closePreview();
};

const regenerate = () => {
  emit("regenerate");
};
</script>

<style scoped lang="less">
.ai-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;

  .modal-content {
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        transition: color 0.3s;

        &:hover {
          @apply text-gray-900 dark:text-gray-100;
        }
      }
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;

      .preview-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;

        .preview-section {
          width: 100%;
          max-width: 600px;

          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 600;

            .typing-indicator {
              display: flex;
              gap: 4px;
              margin-left: auto;
              align-items: center;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                animation: typing 1.2s infinite ease-in-out;

                &:nth-child(1) {
                  animation-delay: -0.4s;
                }

                &:nth-child(2) {
                  animation-delay: -0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0s;
                }
              }
            }
          }

          @keyframes typing {
            0%,
            80%,
            100% {
              transform: scale(0.7);
              opacity: 0.4;
            }
            40% {
              transform: scale(1.1);
              opacity: 1;
            }
          }

          .content-box {
            padding: 16px;
            border: 1px solid;
            border-radius: 8px;
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
            overflow-x: hidden;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;

            &.highlight {
              transition: scroll-top 0.3s ease;

              &.streaming {
                animation: contentPulse 2s ease-in-out infinite;
              }
            }

            @keyframes contentPulse {
              0%,
              100% {
                box-shadow: 0 0 0 rgba(102, 126, 234, 0.1);
              }
              50% {
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
              }
            }

            /* 自定义滚动条样式 */
            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-track {
              @apply bg-gray-100 dark:bg-gray-700;
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
              @apply bg-gray-400 dark:bg-gray-500;
              border-radius: 3px;

              &:hover {
                @apply bg-gray-500 dark:bg-gray-400;
              }
            }
          }
        }

        .divider {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          font-size: 24px;
          margin: 10px 0;
        }
      }

      .stats-info {
        display: flex;
        gap: 20px;
        padding: 12px 16px;
        @apply bg-gray-50 dark:bg-gray-700;
        border-radius: 8px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          @apply text-gray-600 dark:text-gray-300;

          i {
            @apply text-blue-600 dark:text-blue-400;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;

      .btn {
        width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;

        &.btn-secondary {
          &:hover {
            @apply bg-gray-200 dark:bg-gray-600;
          }
        }

        &.btn-regenerate {
          border: 1px solid;

          &:hover {
            @apply bg-blue-50 dark:bg-blue-900/20;
          }
        }

        &.btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
        }
      }
    }
  }
}

/* Markdown 样式 - 使用更高优先级 */
.ai-preview-modal .prose {
  line-height: 1.75;
  background: transparent !important;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose * {
  background: transparent !important;
}

.ai-preview-modal .prose h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  @apply text-gray-900 dark:text-gray-100;
}

.ai-preview-modal .prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  @apply text-gray-800 dark:text-gray-100;
}

.ai-preview-modal .prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose p {
  margin-bottom: 1rem;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose ul,
.ai-preview-modal .prose ol {
  margin-bottom: 1rem;
  padding-left: 2em;
}

.ai-preview-modal .prose ul {
  list-style-type: disc;
}

.ai-preview-modal .prose ol {
  list-style-type: decimal;
}

.ai-preview-modal .prose li {
  margin-bottom: 0.5rem;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose strong {
  font-weight: 600;
  @apply text-gray-900 dark:text-gray-100;
}

.ai-preview-modal .prose em {
  font-style: italic;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose code {
  @apply bg-gray-100 dark:bg-gray-700;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.875em;
  @apply text-pink-600 dark:text-pink-400;
}

.ai-preview-modal .prose pre {
  @apply bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700;
  border-radius: 4px;
  padding: 1em;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.ai-preview-modal .prose pre code {
  background: transparent !important;
  padding: 0;
  border-radius: 0;
  @apply text-gray-700 dark:text-gray-200;
}

.ai-preview-modal .prose blockquote {
  @apply border-l-4 border-blue-600 dark:border-blue-400;
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  @apply text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800;
  padding: 1em;
  border-radius: 0 4px 4px 0;
}

@media (max-width: 768px) {
  .ai-preview-modal {
    padding: 0;

    .modal-content {
      max-width: 100%;
      max-height: 100vh;
      border-radius: 0;

      .modal-body {
        padding: 16px;

        .preview-container {
          gap: 16px;

          .preview-section {
            max-width: 100%;

            .content-box {
              max-height: 300px;
              font-size: 13px;
              padding: 12px;
            }
          }

          .divider {
            margin: 8px 0;
          }
        }
      }

      .modal-footer {
        flex-wrap: wrap;
        padding: 12px 16px;

        .btn {
          width: 44px;
          height: 44px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
