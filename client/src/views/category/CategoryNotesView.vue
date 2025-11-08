<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button
            @click="$router.back()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
          </button>
          <div
            v-if="category"
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :style="{ backgroundColor: category.color }"
          >
            <i :class="category.icon + ' text-white'"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ category?.name || "分类笔记" }}
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              共 {{ notes.length }} 篇笔记
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <i
          class="fas fa-spinner fa-spin text-3xl text-blue-600 dark:text-blue-400 mb-2"
        ></i>
        <p class="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    </div>

    <!-- Notes List -->
    <div v-else class="p-4">
      <div class="space-y-3">
        <NoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @click="$router.push(`/main/notes/${note.id}`)"
          @delete="showDeleteMenu"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && notes.length === 0"
      class="flex flex-col items-center justify-center h-64"
    >
      <div
        class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors"
      >
        <i
          class="fas fa-sticky-note text-2xl text-gray-400 dark:text-gray-500"
        ></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        暂无笔记
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        该分类下还没有笔记
      </p>
      <button
        @click="$router.push('/main/notes/new')"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        创建笔记
      </button>
    </div>

    <!-- Floating Add Button -->
    <button
      @click="$router.push('/main/notes/new')"
      class="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
    >
      <i class="fas fa-plus text-lg"></i>
    </button>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showDeleteConfirm = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm transition-colors"
        @click.stop
      >
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <i class="fas fa-trash text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            删除笔记
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            确定要删除笔记"{{ noteToDelete?.title }}"吗？
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showDeleteConfirm = false"
            :disabled="deleting"
            class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {{ deleting ? "删除中..." : "确定删除" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getNotes, deleteNote } from "@/api/note";
import type { Note as ApiNote } from "@/api/note";
import { getCategoryById } from "@/api/category";
import type { Category } from "@/api/category";
import NoteCard from "@/components/note/NoteCard.vue";
import { toast } from "@/utils/toast";

const route = useRoute();

// 定义本地使用的Note类型（兼容NoteCard组件）
interface LocalNote {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

const loading = ref(false);
const notes = ref<LocalNote[]>([]);
const category = ref<Category | null>(null);
const showDeleteConfirm = ref(false);
const noteToDelete = ref<LocalNote | null>(null);
const deleting = ref(false);

// 格式化时间显示
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return date.toLocaleDateString();
};

// 提取纯文本内容
const extractText = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

// 加载分类信息
const loadCategory = async (categoryId: number) => {
  try {
    const response = await getCategoryById(categoryId);
    if (response.data.success) {
      category.value = response.data.data;
    }
  } catch (error: any) {
    console.error("加载分类信息失败:", error);
    toast.error("加载分类信息失败");
  }
};

// 加载该分类下的笔记
const loadNotes = async (categoryId: number) => {
  try {
    loading.value = true;
    const response = await getNotes({
      category_id: categoryId,
      sort_by: "updated_at",
      sort_order: "DESC",
      limit: 100,
    });

    if (response.data.success) {
      notes.value = response.data.data.notes.map((note: ApiNote) => ({
        id: note.id.toString(),
        title: note.title,
        content: extractText(note.content),
        categoryId: note.category_id.toString(),
        categoryName: note.category?.name || "",
        categoryColor: note.category?.color || "#667eea",
        tags: note.tags?.map((t) => t.name) || [],
        createdAt: formatDate(note.created_at),
        updatedAt: formatDate(note.updated_at),
        imageUrl: note.thumbnail_url,
      }));
    } else {
      toast.error(response.data.message || "获取笔记列表失败");
    }
  } catch (error: any) {
    console.error("加载笔记失败:", error);
    toast.error(error.response?.data?.message || "加载笔记失败");
  } finally {
    loading.value = false;
  }
};

// 显示删除确认对话框
const showDeleteMenu = (note: LocalNote) => {
  noteToDelete.value = note;
  showDeleteConfirm.value = true;
};

// 确认删除笔记
const confirmDelete = async () => {
  if (!noteToDelete.value) return;

  try {
    deleting.value = true;
    const noteId = parseInt(noteToDelete.value.id);
    const response = await deleteNote(noteId);

    if (response.data.success) {
      notes.value = notes.value.filter((n) => n.id !== noteToDelete.value?.id);
      toast.success("笔记已删除");
      showDeleteConfirm.value = false;
      noteToDelete.value = null;
    } else {
      toast.error(response.data.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除笔记失败:", error);
    toast.error(error.response?.data?.message || "删除失败，请重试");
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  const categoryId = route.params.id as string;
  if (categoryId) {
    const id = parseInt(categoryId);
    loadCategory(id);
    loadNotes(id);
  }
});
</script>
