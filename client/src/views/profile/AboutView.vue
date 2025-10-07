<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">关于我们</h1>
        <div class="w-8"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-4 space-y-4">
      <!-- Logo & Name -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <i class="fas fa-sticky-note text-white text-3xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">智本集</h2>
        <p class="text-sm text-gray-500 mb-1">版本 v1.0.0</p>
        <p class="text-xs text-gray-400">记录生活，分享思考</p>
      </div>

      <!-- 产品介绍 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-info-circle text-blue-500 mr-2"></i>
          产品介绍
        </h3>
        <p class="text-sm text-gray-600 leading-relaxed mb-3">
          智本集是一款简洁高效的笔记应用，致力于为用户提供优质的记录体验。无论是工作笔记、学习心得还是生活感悟，都能在这里找到合适的记录方式。
        </p>
        <p class="text-sm text-gray-600 leading-relaxed">
          我们相信，好的笔记工具应该简单易用，让用户专注于内容本身。通过云端同步、智能分类、标签管理等功能，帮助您更好地整理和回顾知识。
        </p>
      </div>

      <!-- 核心功能 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-star text-yellow-500 mr-2"></i>
          核心功能
        </h3>
        <div class="space-y-3">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex items-start space-x-3"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: feature.color + '20' }"
            >
              <i :class="feature.icon" :style="{ color: feature.color }"></i>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900 mb-1">
                {{ feature.title }}
              </h4>
              <p class="text-xs text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 开发团队 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-users text-green-500 mr-2"></i>
          开发团队
        </h3>
        <p class="text-sm text-gray-600 leading-relaxed mb-3">
          我们是一支充满热情的开发团队，专注于打造优质的笔记应用。团队成员来自不同背景，但都对产品设计和用户体验有着共同的追求。
        </p>
        <div class="flex items-center space-x-2 text-xs text-gray-500">
          <i class="fas fa-map-marker-alt"></i>
          <span>中国</span>
        </div>
      </div>

      <!-- 技术栈 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-code text-purple-500 mr-2"></i>
          技术栈
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tech in techStack"
            :key="tech"
            class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-envelope text-red-500 mr-2"></i>
          联系我们
        </h3>
        <div class="space-y-2">
          <div class="flex items-center space-x-3">
            <i class="fas fa-envelope text-gray-400 w-5"></i>
            <a
              :href="`mailto:${contactEmail}`"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              {{ contactEmail }}
            </a>
          </div>
          <div class="flex items-center space-x-3">
            <i class="fab fa-github text-gray-400 w-5"></i>
            <span class="text-sm text-gray-600">GitHub (即将开源)</span>
          </div>
        </div>
      </div>

      <!-- 法律信息 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="space-y-2">
          <button
            @click="handleLegalClick('terms')"
            class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span class="text-sm text-gray-900">用户协议</span>
            <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
          </button>
          <button
            @click="handleLegalClick('privacy')"
            class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span class="text-sm text-gray-900">隐私政策</span>
            <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
          </button>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="text-center py-4">
        <p class="text-xs text-gray-400 mb-1">
          © 2025 智本集. All rights reserved.
        </p>
        <p class="text-xs text-gray-400">Made with ❤️ in China</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { toast } from "@/utils/toast";

const router = useRouter();
const contactEmail = "1611943029@qq.com";

const features = [
  {
    title: "云端同步",
    description: "多设备实时同步，数据永不丢失",
    icon: "fas fa-cloud",
    color: "#3b82f6",
  },
  {
    title: "Markdown 支持",
    description: "支持 Markdown 语法，让写作更高效",
    icon: "fab fa-markdown",
    color: "#10b981",
  },
  {
    title: "智能分类",
    description: "灵活的分类和标签系统，轻松管理笔记",
    icon: "fas fa-folder",
    color: "#f59e0b",
  },
  {
    title: "富文本编辑",
    description: "支持图片、列表、代码块等多种格式",
    icon: "fas fa-edit",
    color: "#8b5cf6",
  },
  {
    title: "快速搜索",
    description: "强大的搜索功能，快速找到所需内容",
    icon: "fas fa-search",
    color: "#ef4444",
  },
  {
    title: "数据安全",
    description: "端到端加密，保护您的隐私安全",
    icon: "fas fa-shield-alt",
    color: "#06b6d4",
  },
];

const techStack = [
  "Vue 3",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "MySQL",
  "Vite",
];

const handleLegalClick = (type: string) => {
  toast.info("相关文档正在完善中...");
};
</script>

<style scoped>
button:active {
  transform: scale(0.98);
}
</style>
