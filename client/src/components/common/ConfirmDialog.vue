<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <!-- 遮罩层 -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleCancel"
        ></div>

        <!-- 弹窗内容 -->
        <div
          class="relative bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden"
        >
          <!-- 图标 -->
          <div v-if="showIcon" class="flex justify-center pt-8 pb-4">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center',
                iconBgClass,
              ]"
            >
              <i :class="['text-2xl', iconClass]"></i>
            </div>
          </div>

          <!-- 内容 -->
          <div class="px-6 pb-8 text-center" :class="{ 'pt-8': !showIcon }">
            <h3 v-if="title" class="text-xl font-semibold text-gray-900 mb-2">
              {{ title }}
            </h3>
            <p class="text-base text-gray-600">{{ message }}</p>
          </div>

          <!-- 按钮组 -->
          <div class="grid grid-cols-2 gap-0 border-t border-gray-100">
            <button
              @click="handleCancel"
              class="py-4 text-base font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors border-r border-gray-100"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'py-4 text-base font-medium transition-colors',
                confirmButtonClass,
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "ConfirmDialog",
});

interface Props {
  modelValue: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "success";
  showIcon?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  confirmText: "确定",
  cancelText: "取消",
  type: "warning",
  showIcon: true,
});

const emit = defineEmits<Emits>();

// 根据类型设置图标和颜色
const iconClass = computed(() => {
  const icons = {
    warning: "fas fa-exclamation-triangle text-yellow-500",
    danger: "fas fa-sign-out-alt text-red-500",
    info: "fas fa-info-circle text-blue-500",
    success: "fas fa-check-circle text-green-500",
  };
  return icons[props.type];
});

const iconBgClass = computed(() => {
  const bgClasses = {
    warning: "bg-yellow-50",
    danger: "bg-red-50",
    info: "bg-blue-50",
    success: "bg-green-50",
  };
  return bgClasses[props.type];
});

const confirmButtonClass = computed(() => {
  const buttonClasses = {
    warning: "text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100",
    danger: "text-red-500 hover:bg-red-50 active:bg-red-100",
    info: "text-blue-600 hover:bg-blue-50 active:bg-blue-100",
    success: "text-green-600 hover:bg-green-50 active:bg-green-100",
  };
  return buttonClasses[props.type];
});

const handleConfirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};
</script>

<script lang="ts">
export default {
  name: "ConfirmDialog",
};
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
}

.dialog-enter-from .relative {
  transform: scale(0.8);
  opacity: 0;
}

.dialog-leave-to .relative {
  transform: scale(0.9);
  opacity: 0;
}

/* 按钮点击效果 */
button:active {
  transform: scale(0.98);
}
</style>
