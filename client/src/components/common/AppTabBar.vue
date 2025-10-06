<template>
  <div class="tab-bar">
    <div
      v-for="item in tabItems"
      :key="item.name"
      class="nav-item flex flex-col items-center space-y-1 cursor-pointer"
      :class="{ active: $route.name === item.name }"
      @click="navigateTo(item.path)"
    >
      <i :class="item.icon + ' text-xl'"></i>
      <span class="text-xs">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const tabItems = [
  {
    name: "Home",
    path: "/main/home",
    icon: "fas fa-home",
    label: "首页",
  },
  {
    name: "Categories",
    path: "/main/categories",
    icon: "fas fa-folder",
    label: "分类",
  },
  {
    name: "NoteCreate",
    path: "/main/notes/new",
    icon: "fas fa-plus-circle",
    label: "新建",
  },
  {
    name: "Search",
    path: "/main/search",
    icon: "fas fa-search",
    label: "搜索",
  },
  {
    name: "Profile",
    path: "/main/profile",
    icon: "fas fa-user",
    label: "我的",
  },
];

const navigateTo = (path: string) => {
  router.push(path);
};
</script>