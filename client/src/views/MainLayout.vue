<template>
  <div class="phone-container">
    <div class="phone-screen">
      <!-- iOS状态栏 -->
      <div class="status-bar">
        <div class="flex items-center space-x-1">
          <span>9:41</span>
        </div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-signal text-xs"></i>
          <i class="fas fa-wifi text-xs"></i>
          <i class="fas fa-battery-three-quarters text-xs"></i>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div
        class="flex-1 overflow-hidden"
        style="height: calc(100% - 47px - 83px)"
      >
        <router-view />
      </div>

      <!-- 底部标签栏 -->
      <AppTabBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppTabBar from "@/components/common/AppTabBar.vue";
</script>