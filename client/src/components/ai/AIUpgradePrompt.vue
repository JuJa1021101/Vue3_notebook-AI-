<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
    >
      <!-- 标题 -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ message }}
        </p>

        <!-- 当前等级 -->
        <div
          v-if="aiStore.stats?.limitInfo"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            当前等级
          </div>
          <div class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ aiStore.stats.limitInfo.description }}
          </div>
          <div class="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <div>每小时限制: {{ aiStore.stats.limitInfo.hourly.limit }} 次</div>
            <div>每日限制: {{ aiStore.stats.limitInfo.daily.limit }} 次</div>
          </div>
        </div>

        <!-- 升级选项 -->
        <div class="space-y-3">
          <div
            v-for="tier in upgradeTiers"
            :key="tier.id"
            class="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
            :class="{
              'border-blue-500 dark:border-blue-400': selectedTier === tier.id,
            }"
            @click="selectedTier = tier.id"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ tier.name }}
              </div>
              <div class="text-blue-600 dark:text-blue-400 font-bold">
                {{ tier.price }}
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div>• 每小时 {{ tier.hourly }} 次</div>
              <div>• 每日 {{ tier.daily }} 次</div>
              <div
                v-if="tier.features"
                class="text-xs text-gray-500 dark:text-gray-400 mt-2"
              >
                {{ tier.features }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-3">
        <button
          @click="close"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          稍后再说
        </button>
        <button
          @click="upgrade"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          立即升级
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAIStore } from "@/stores/ai";

interface Props {
  show: boolean;
  title?: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "使用次数已达上限",
  message: "您的 AI 使用次数已达到当前等级的限制，升级会员以获得更多使用次数。",
});

const emit = defineEmits<{
  close: [];
  upgrade: [tier: string];
}>();

const aiStore = useAIStore();
const selectedTier = ref("basic");

const upgradeTiers = [
  {
    id: "basic",
    name: "基础会员",
    price: "¥9.9/月",
    hourly: 30,
    daily: 200,
    features: "适合个人用户",
  },
  {
    id: "pro",
    name: "专业会员",
    price: "¥29.9/月",
    hourly: 100,
    daily: 1000,
    features: "适合重度用户",
  },
  {
    id: "enterprise",
    name: "企业版",
    price: "联系客服",
    hourly: "无限制",
    daily: "无限制",
    features: "适合团队使用",
  },
];

const close = () => {
  emit("close");
};

const upgrade = () => {
  emit("upgrade", selectedTier.value);
};
</script>
