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
import AppTabBar from "@/components/common/AppTabBar.vue";
</script>