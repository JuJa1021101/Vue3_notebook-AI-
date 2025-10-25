<template>
  <div
    class="note-card bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer relative transition-colors"
  >
    <!-- 删除按钮 - 放在最上层，右上角 -->
    <button
      class="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded z-10 transition-colors"
      @click.stop="handleDelete"
    >
      <i class="fas fa-ellipsis-v text-gray-400 dark:text-gray-500"></i>
    </button>

    <!-- 标题和内容区域 -->
    <div class="flex items-start mb-3">
      <div :class="note.imageUrl ? 'flex-1 pr-3' : 'flex-1 pr-8'">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
          {{ note.title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {{ note.content }}
        </p>
      </div>
      <!-- 图片 - 右上角，在删除按钮下方 -->
      <img
        v-if="note.imageUrl"
        :src="note.imageUrl"
        class="w-16 h-16 rounded-lg ml-2 mt-6 flex-shrink-0"
        :alt="note.title"
      />
    </div>

    <!-- 底部信息区域 -->
    <div class="flex items-center justify-between mt-3">
      <!-- 分类标签 - 左下角 -->
      <span
        class="text-white text-xs px-2 py-1 rounded-full"
        :style="{ backgroundColor: note.categoryColor }"
      >
        {{ note.categoryName }}
      </span>
      <!-- 日期 - 右下角 -->
      <span class="text-xs text-gray-400 dark:text-gray-500">{{
        note.createdAt
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from "@/types/note";

interface Props {
  note: Note;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [note: Note];
}>();

const handleDelete = () => {
  emit("delete", props.note);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>