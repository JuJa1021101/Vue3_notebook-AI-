<template>
  <div class="ai-settings-modal" @click.self="close">
    <div class="modal-content bg-white dark:bg-gray-800 transition-colors">
      <div class="modal-header border-gray-200 dark:border-gray-700">
        <h3 class="text-gray-900 dark:text-white">AI 助手设置</h3>
        <button
          class="close-btn text-gray-400 dark:text-gray-500"
          @click="close"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner border-gray-200 dark:border-gray-700"></div>
          <p class="text-gray-600 dark:text-gray-300">加载设置中...</p>
        </div>

        <div v-else>
          <div class="form-group">
            <label class="text-gray-900 dark:text-white">默认续写长度</label>
            <select
              v-model="formData.default_length"
              class="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="short">短（50-200字）</option>
              <option value="medium">中（200-500字）</option>
              <option value="long">长（500-800字）</option>
            </select>
          </div>

          <div class="form-group">
            <label class="text-gray-900 dark:text-white">默认写作风格</label>
            <select
              v-model="formData.default_style"
              class="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="formal">正式</option>
              <option value="casual">轻松</option>
              <option value="professional">专业</option>
              <option value="creative">创意</option>
            </select>
          </div>

          <div class="form-group">
            <label class="text-gray-900 dark:text-white">默认语言</label>
            <select
              v-model="formData.default_language"
              class="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label text-gray-900 dark:text-white">
              <input
                type="checkbox"
                v-model="formData.stream_enabled"
                :true-value="true"
                :false-value="false"
              />
              <span>启用流式输出（打字机效果）</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer border-gray-200 dark:border-gray-700">
        <button
          class="btn btn-secondary bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          @click="close"
        >
          取消
        </button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAIStore } from "@/stores/ai";
import { toast } from "@/utils/toast";

const aiStore = useAIStore();
const emit = defineEmits<{ close: [] }>();

const saving = ref(false);
const loading = ref(true);

// 使用 computed 直接从 store 获取数据，确保响应式
const formData = ref({
  default_length: "medium" as "short" | "medium" | "long",
  default_style: "professional" as
    | "formal"
    | "casual"
    | "professional"
    | "creative",
  default_language: "zh" as "zh" | "en",
  stream_enabled: true,
});

const close = () => {
  emit("close");
};

const save = async () => {
  saving.value = true;
  try {
    // 确保 stream_enabled 是布尔值
    const settingsToSave = {
      default_length: formData.value.default_length,
      default_style: formData.value.default_style,
      default_language: formData.value.default_language,
      stream_enabled: Boolean(formData.value.stream_enabled), // 强制转换为布尔值
    };

    console.log("💾 准备保存 AI 设置:", settingsToSave);
    console.log("💾 各字段类型:", {
      default_length: typeof settingsToSave.default_length,
      default_style: typeof settingsToSave.default_style,
      default_language: typeof settingsToSave.default_language,
      stream_enabled: typeof settingsToSave.stream_enabled,
    });

    const success = await aiStore.updateSettings(settingsToSave);
    console.log("📝 保存结果:", success);

    if (success) {
      toast.success("设置已保存");
      // 等待一下确保数据同步
      await new Promise((resolve) => setTimeout(resolve, 500));
      close();
    } else {
      toast.error("保存失败，请重试");
    }
  } catch (error) {
    console.error("❌ 保存失败:", error);
    toast.error("保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  console.log("🔧 AISettings 组件挂载");
  loading.value = true;

  try {
    await aiStore.fetchSettings();
    console.log("📋 获取到的设置:", aiStore.settings);

    if (aiStore.settings) {
      // 确保所有值都正确赋值
      formData.value.default_length =
        aiStore.settings.default_length || "medium";
      formData.value.default_style =
        aiStore.settings.default_style || "professional";
      formData.value.default_language =
        aiStore.settings.default_language || "zh";
      formData.value.stream_enabled = Boolean(aiStore.settings.stream_enabled);

      console.log("📝 表单初始化:", formData.value);
      console.log(
        "🔘 stream_enabled 类型:",
        typeof formData.value.stream_enabled,
        "值:",
        formData.value.stream_enabled
      );
    }
  } catch (error) {
    console.error("❌ 加载设置失败:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="less">
.ai-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  .modal-content {
    border-radius: 10px;
    width: 100%;
    max-width: 500px;
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
      min-height: 300px;

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 16px;

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid;
          border-top: 3px solid #5b7ff2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }

      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;

          &:focus {
            outline: none;
            border-color: #5b7ff2;
          }
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          span {
            font-weight: normal;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;

        &.btn-secondary {
          &:hover {
            @apply bg-gray-200 dark:bg-gray-600;
          }
        }

        &.btn-primary {
          background: linear-gradient(120deg, #5b7ff2 0%, #4a68d6 100%);
          color: white;

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(91, 127, 242, 0.3);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
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

@media (max-width: 768px) {
  .ai-settings-modal {
    padding: 0;

    .modal-content {
      max-width: 100%;
      max-height: 100vh;
      border-radius: 0;
    }
  }
}
</style>
