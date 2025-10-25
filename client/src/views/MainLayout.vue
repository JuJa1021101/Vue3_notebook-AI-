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

onMounted(async () => {
  // 加载主题设置
  themeStore.loadSettings();

  // 确保AI设置已加载（如果尚未加载）
  if (!aiStore.settings) {
    try {
      await aiStore.fetchSettings();
      console.log("MainLayout: AI设置加载成功:", aiStore.settings);
    } catch (error) {
      console.error("MainLayout: 加载AI设置失败:", error);
    }
  }
});
</script>