<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="$router.back()" class="text-gray-600 dark:text-gray-400">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            我的收藏
          </h1>
        </div>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ total }} 篇
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="notes.length === 0"
        class="flex flex-col items-center justify-center py-20"
      >
        <i class="fas fa-star text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 text-center">
          还没有收藏的笔记<br />点击笔记上的星标即可收藏
        </p>
      </div>

      <!-- Notes Grid -->
      <div v-else class="grid grid-cols-1 gap-3">
        <div
          v-for="note in notes"
          :key="note.id"
          @click="handleNoteClick(note)"
        >
          <NoteCard
            :note="formatNote(note)"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NoteCard from '@/components/note/NoteCard.vue'
import { getFavoritedNotes, type Note } from '@/api/note'
import { toast } from '@/utils/toast'

const router = useRouter()
const loading = ref(false)
const notes = ref<Note[]>([])
const total = ref(0)

// 加载收藏笔记
const loadFavorites = async () => {
  loading.value = true
  try {
    const response = await getFavoritedNotes({ limit: 100 })
    if (response.data.success) {
      notes.value = response.data.data.notes
      total.value = response.data.data.total
    }
  } catch (error) {
    console.error('加载收藏笔记失败:', error)
    toast.error('加载收藏笔记失败')
  } finally {
    loading.value = false
  }
}

// 格式化笔记数据
const formatNote = (note: Note) => {
  return {
    id: note.id.toString(),
    title: note.title,
    content: note.content_text || '',
    imageUrl: note.thumbnail_url,
    categoryId: note.category_id.toString(),
    categoryName: note.category?.name || '未分类',
    categoryColor: note.category?.color || '#667eea',
    tags: note.tags?.map(t => t.name) || [],
    createdAt: new Date(note.created_at).toLocaleDateString('zh-CN'),
    updatedAt: new Date(note.updated_at).toLocaleDateString('zh-CN')
  }
}

// 点击笔记
const handleNoteClick = (note: Note) => {
  router.push(`/main/notes/${note.id}`)
}

// 删除笔记
const handleDelete = () => {
  // 这里可以添加删除逻辑
  toast.info('删除功能待实现')
}

onMounted(() => {
  loadFavorites()
})
</script>
