<template>
  <div
    class="ai-floating-button"
    @click="togglePanel"
    :class="{ active: showPanel }"
  >
    <i class="fas fa-magic"></i>
    <span class="tooltip">AI 助手</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAIStore } from "@/stores/ai";

const aiStore = useAIStore();

const showPanel = computed(() => aiStore.showPanel);

const togglePanel = () => {
  aiStore.togglePanel();
};
</script>

<style scoped lang="less">
.ai-floating-button {
  position: fixed;
  right: 30px;
  bottom: 100px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;

  /* 深色模式 */
  :global(.dark) & {
    background: #4b5563;
    box-shadow: 0 4px 12px rgba(75, 85, 99, 0.4);
  }

  i {
    font-size: 24px;
    transition: transform 0.3s;
  }

  .tooltip {
    position: absolute;
    right: 70px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);

    :global(.dark) & {
      box-shadow: 0 6px 20px rgba(75, 85, 99, 0.5);
    }

    .tooltip {
      opacity: 1;
    }

    i {
      transform: rotate(15deg);
    }
  }

  &:active {
    transform: scale(0.95);
  }

  &.active {
    filter: brightness(1.1);

    i {
      transform: rotate(180deg);
    }
  }
}

@media (max-width: 768px) {
  .ai-floating-button {
    right: 20px;
    bottom: 80px;
    width: 48px;
    height: 48px;

    i {
      font-size: 20px;
    }

    .tooltip {
      display: none;
    }
  }
}
</style>
