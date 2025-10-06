<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div
      class="animate-spin rounded-full border-b-2"
      :class="spinnerClass"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></div>
    <span v-if="text" class="ml-2 text-sm" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: number;
  color?: "primary" | "white" | "gray";
  text?: string;
  center?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: "primary",
  center: false,
});

const containerClass = computed(() => ({
  "h-full": props.center,
}));

const spinnerClass = computed(() => {
  switch (props.color) {
    case "white":
      return "border-white";
    case "gray":
      return "border-gray-400";
    default:
      return "border-blue-600";
  }
});

const textClass = computed(() => {
  switch (props.color) {
    case "white":
      return "text-white";
    case "gray":
      return "text-gray-500";
    default:
      return "text-gray-700";
  }
});
</script>