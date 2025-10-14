<template>
  <div class="app-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view />
    </div>

    <!-- 底部标签栏 -->
    <AppTabBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAIStore } from '@/stores/ai'
import AppTabBar from "@/components/common/AppTabBar.vue";

const aiStore = useAIStore()

onMounted(async () => {
  // 确保AI设置已加载（如果尚未加载）
  if (!aiStore.settings) {
    try {
      await aiStore.fetchSettings()
      console.log('MainLayout: AI设置加载成功:', aiStore.settings)
    } catch (error) {
      console.error('MainLayout: 加载AI设置失败:', error)
    }
  }
})
</script>