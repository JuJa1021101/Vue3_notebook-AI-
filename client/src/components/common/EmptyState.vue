<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div
      class="w-20 h-20 rounded-full flex items-center justify-center mb-4"
      :class="iconBgClass"
    >
      <i :class="icon + ' text-2xl'" :class="iconClass"></i>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-500 mb-6 max-w-sm">{{ description }}</p>
    <button
      v-if="actionText"
      @click="$emit('action')"
      class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  type?: "default" | "search" | "error" | "success";
}

const props = withDefaults(defineProps<Props>(), {
  icon: "fas fa-inbox",
  type: "default",
});

defineEmits<{
  action: [];
}>();

const iconBgClass = computed(() => {
  switch (props.type) {
    case "search":
      return "bg-blue-100";
    case "error":
      return "bg-red-100";
    case "success":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case "search":
      return "text-blue-500";
    case "error":
      return "text-red-500";
    case "success":
      return "text-green-500";
    default:
      return "text-gray-400";
  }
});
</script>