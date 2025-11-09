<template>
  <div class="app-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view />
    </div>

    <!-- 底部标签栏 - 仅在主要页面显示 -->
    <AppTabBar v-if="shouldShowTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAIStore } from "@/stores/ai";
import { useThemeStore } from "@/stores/theme";
import AppTabBar from "@/components/common/AppTabBar.vue";

const route = useRoute();
const aiStore = useAIStore();
const themeStore = useThemeStore();

// 定义需要显示底部导航栏的页面
const tabBarRoutes = ["Home", "Categories", "NoteCreate", "Search", "Profile"];

// 判断是否显示底部导航栏
const shouldShowTabBar = computed(() => {
  return tabBarRoutes.includes(route.name as string);
});

onMounted(() => {
  // 加载主题设置
  themeStore.loadSettings();

  // 尝试加载AI设置（如果尚未加载，store 内部会自动跳过）
  aiStore.fetchSettings().catch((error: any) => {
    console.error("MainLayout: 加载AI设置失败:", error);
  });
});
</script>