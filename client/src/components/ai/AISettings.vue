<template>
  <div class="ai-settings-modal" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>AI 助手设置</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载设置中...</p>
        </div>

        <div v-else>
          <div class="form-group">
            <label>默认续写长度</label>
            <select v-model="formData.default_length">
              <option value="short">短（50-100字）</option>
              <option value="medium">中（100-300字）</option>
              <option value="long">长（300-500字）</option>
            </select>
          </div>

          <div class="form-group">
            <label>默认写作风格</label>
            <select v-model="formData.default_style">
              <option value="formal">正式</option>
              <option value="casual">轻松</option>
              <option value="professional">专业</option>
              <option value="creative">创意</option>
            </select>
          </div>

          <div class="form-group">
            <label>默认语言</label>
            <select v-model="formData.default_language">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
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

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
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

    console.log("💾 保存 AI 设置:", settingsToSave);
    const success = await aiStore.updateSettings(settingsToSave);
    console.log("📝 保存结果:", success);

    if (success) {
      toast.success("设置已保存");
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
      formData.value.stream_enabled =
        aiStore.settings.stream_enabled === true ||
        aiStore.settings.stream_enabled === 1;

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
    background: white;
    border-radius: 12px;
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
      border-bottom: 1px solid #e9ecef;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 4px;
        transition: color 0.3s;

        &:hover {
          color: #333;
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
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        p {
          margin: 0;
          color: #666;
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
          color: #333;
        }

        select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s;

          &:focus {
            outline: none;
            border-color: #667eea;
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
      border-top: 1px solid #e9ecef;

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;

        &.btn-secondary {
          background: #f8f9fa;
          color: #666;

          &:hover {
            background: #e9ecef;
          }
        }

        &.btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
