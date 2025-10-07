<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">帮助与反馈</h1>
        <div class="w-8"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-4 space-y-4">
      <!-- 常见问题 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-question-circle text-blue-500 mr-2"></i>
          常见问题
        </h2>
        <div class="space-y-3">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full text-left flex items-start justify-between"
            >
              <span class="text-sm font-medium text-gray-900 flex-1">{{
                faq.question
              }}</span>
              <i
                :class="
                  expandedFaq === index
                    ? 'fas fa-chevron-up'
                    : 'fas fa-chevron-down'
                "
                class="text-gray-400 text-xs mt-1"
              ></i>
            </button>
            <div
              v-if="expandedFaq === index"
              class="mt-2 text-sm text-gray-600 leading-relaxed"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- 反馈方式 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-envelope text-green-500 mr-2"></i>
          联系我们
        </h2>
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"
            >
              <i class="fas fa-envelope text-blue-500"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900 mb-1">邮箱反馈</h3>
              <p class="text-sm text-gray-600 mb-2">
                遇到问题或有建议？发送邮件给我们
              </p>
              <a
                :href="`mailto:${feedbackEmail}`"
                class="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <span>{{ feedbackEmail }}</span>
                <i class="fas fa-external-link-alt ml-1 text-xs"></i>
              </a>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"
            >
              <i class="fab fa-weixin text-green-500"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900 mb-1">微信反馈</h3>
              <p class="text-sm text-gray-600">
                添加微信公众号获取更多帮助和最新动态
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用指南 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2
          class="text-base font-semibold text-gray-900 mb-3 flex items-center"
        >
          <i class="fas fa-book text-purple-500 mr-2"></i>
          使用指南
        </h2>
        <div class="space-y-2">
          <button
            v-for="guide in guides"
            :key="guide.name"
            @click="handleGuideClick(guide.name)"
            class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <i :class="guide.icon + ' text-gray-400'"></i>
              <span class="text-sm text-gray-900">{{ guide.title }}</span>
            </div>
            <i class="fas fa-chevron-right text-gray-300 text-xs"></i>
          </button>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">当前版本</span>
          <span class="text-sm font-medium text-gray-900">v1.0.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "@/utils/toast";

const router = useRouter();
const feedbackEmail = "1611943029@qq.com";
const expandedFaq = ref<number | null>(null);

const faqs = ref([
  {
    question: "如何创建新笔记？",
    answer:
      "点击首页底部的" +
      "按钮即可创建新笔记。您可以添加标题、内容、选择分类和添加标签。",
  },
  {
    question: "如何同步我的笔记？",
    answer:
      "笔记会自动同步到云端。确保您已登录账号，所有的笔记修改都会实时保存并同步到服务器。",
  },
  {
    question: "如何导出笔记？",
    answer:
      '在个人中心点击"导出"功能，可以将笔记导出为 Markdown 或 PDF 格式。此功能正在开发中，敬请期待。',
  },
  {
    question: "忘记密码怎么办？",
    answer:
      '在登录页面点击"忘记密码"，输入注册邮箱，我们会发送重置密码的链接到您的邮箱。',
  },
  {
    question: "如何删除账号？",
    answer:
      "如需删除账号，请发送邮件至 1611943029@qq.com，我们会在 3 个工作日内处理您的请求。",
  },
]);

const guides = ref([
  {
    name: "quick-start",
    title: "快速入门",
    icon: "fas fa-rocket",
  },
  {
    name: "markdown",
    title: "Markdown 语法",
    icon: "fab fa-markdown",
  },
  {
    name: "shortcuts",
    title: "快捷键说明",
    icon: "fas fa-keyboard",
  },
  {
    name: "privacy",
    title: "隐私与安全",
    icon: "fas fa-shield-alt",
  },
]);

const toggleFaq = (index: number) => {
  expandedFaq.value = expandedFaq.value === index ? null : index;
};

const handleGuideClick = (guideName: string) => {
  toast.info("使用指南功能开发中...");
};
</script>

<style scoped>
button:active {
  transform: scale(0.98);
}
</style>
