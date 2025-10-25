<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          全部笔记
        </h1>
        <div class="flex items-center space-x-2">
          <button
            @click="showFilterModal = true"
            class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-colors"
          >
            <i class="fas fa-filter text-gray-600 dark:text-gray-300"></i>
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        共 {{ filteredNotes.length }} 篇笔记
      </p>
    </div>

    <!-- Filter Bar -->
    <div
      v-if="activeFilters.length > 0"
      class="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center space-x-2 overflow-x-auto">
        <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
          >筛选条件:</span
        >
        <div
          v-for="filter in activeFilters"
          :key="filter.key"
          class="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full whitespace-nowrap"
        >
          {{ filter.label }}
          <button @click="removeFilter(filter.key)" class="ml-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button
          @click="clearAllFilters"
          class="text-xs text-gray-500 dark:text-gray-400 underline whitespace-nowrap"
        >
          清除全部
        </button>
      </div>
    </div>

    <!-- Notes List -->
    <div class="p-4">
      <!-- 使用统一的NoteCard组件 -->
      <div class="space-y-3">
        <NoteCard
          v-for="note in filteredNotes"
          :key="note.id"
          :note="convertToNoteCardFormat(note)"
          @click="$router.push(`/main/notes/${note.id}`)"
          @delete="showDeleteMenu"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredNotes.length === 0"
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
        开始创建你的第一篇笔记吧
      </p>
      <button
        @click="$router.push('/main/notes/new')"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        创建笔记
      </button>
    </div>

    <!-- Filter Modal -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showFilterModal = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-96 overflow-y-auto transition-colors"
        @click.stop
      >
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              筛选笔记
            </h3>
            <button @click="showFilterModal = false">
              <i class="fas fa-times text-gray-400 dark:text-gray-500"></i>
            </button>
          </div>
        </div>

        <div class="p-4 space-y-4">
          <!-- Category Filter -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">分类</h4>
            <div class="space-y-2">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  :value="category.id"
                  v-model="selectedCategories"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  category.name
                }}</span>
              </label>
            </div>
          </div>

          <!-- Date Filter -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              时间范围
            </h4>
            <div class="space-y-2">
              <label
                v-for="period in datePeriods"
                :key="period.key"
                class="flex items-center space-x-2"
              >
                <input
                  type="radio"
                  :value="period.key"
                  v-model="selectedDatePeriod"
                  class="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  period.label
                }}</span>
              </label>
            </div>
          </div>

          <!-- Sort Options -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              排序方式
            </h4>
            <div class="space-y-2">
              <label
                v-for="sort in sortOptions"
                :key="sort.key"
                class="flex items-center space-x-2"
              >
                <input
                  type="radio"
                  :value="sort.key"
                  v-model="selectedSort"
                  class="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  sort.label
                }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex space-x-3">
            <button
              @click="resetFilters"
              class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors"
            >
              重置
            </button>
            <button
              @click="applyFilters"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg"
            >
              应用
            </button>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getNotes, deleteNote } from "@/api/note";
import type { Note } from "@/api/note";
import { getCategories } from "@/api/category";
import type { Category } from "@/api/category";
import NoteCard from "@/components/note/NoteCard.vue";
import { toast } from "@/utils/toast";

const route = useRoute();

const showFilterModal = ref(false);

const selectedCategories = ref<string[]>([]);
const selectedDatePeriod = ref("");
const selectedSort = ref("updatedAt");

// 定义本地使用的Note类型（兼容模板）
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
  imageUrl?: string; // 添加缩略图字段
}

// 定义本地使用的Category类型（兼容模板）
interface LocalCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

const notes = ref<LocalNote[]>([]);
const categories = ref<LocalCategory[]>([]);
const showDeleteConfirm = ref(false);
const noteToDelete = ref<LocalNote | null>(null);
const deleting = ref(false);

const datePeriods = [
  { key: "", label: "全部时间" },
  { key: "today", label: "今天" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "今年" },
];

const sortOptions = [
  { key: "updatedAt", label: "最近更新" },
  { key: "createdAt", label: "创建时间" },
  { key: "title", label: "标题" },
];

const activeFilters = computed(() => {
  const filters = [];

  if (selectedCategories.value.length > 0) {
    const categoryNames = categories.value
      .filter((c) => selectedCategories.value.includes(c.id))
      .map((c) => c.name);
    filters.push({
      key: "categories",
      label: `分类: ${categoryNames.join(", ")}`,
    });
  }

  if (selectedDatePeriod.value) {
    const period = datePeriods.find((p) => p.key === selectedDatePeriod.value);
    if (period) {
      filters.push({
        key: "date",
        label: `时间: ${period.label}`,
      });
    }
  }

  return filters;
});

const filteredNotes = computed(() => {
  let filtered = [...notes.value];

  // 分类筛选
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((note) =>
      selectedCategories.value.includes(note.categoryId)
    );
  }

  // 时间筛选
  if (selectedDatePeriod.value) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter((note) => {
      const noteDate = new Date(note.updatedAt);

      switch (selectedDatePeriod.value) {
        case "today":
          return noteDate >= today;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return noteDate >= weekStart;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return noteDate >= monthStart;
        case "year":
          const yearStart = new Date(today.getFullYear(), 0, 1);
          return noteDate >= yearStart;
        default:
          return true;
      }
    });
  }

  // 排序
  filtered.sort((a, b) => {
    switch (selectedSort.value) {
      case "title":
        return a.title.localeCompare(b.title);
      case "createdAt":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  return filtered;
});

onMounted(() => {
  loadNotes();
  loadCategories();

  // 处理URL参数
  const categoryId = route.query.categoryId as string;
  if (categoryId) {
    selectedCategories.value = [categoryId];
  }
});

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

const loadNotes = async () => {
  try {
    const response = await getNotes({
      sort_by: "created_at",
      sort_order: "DESC",
      limit: 100,
    });

    if (response.data.success) {
      // 转换数据格式以适配现有的模板
      notes.value = response.data.data.notes.map((note) => ({
        id: note.id.toString(),
        title: note.title,
        content: extractText(note.content),
        categoryId: note.category_id.toString(),
        categoryName: note.category?.name || "",
        categoryColor: note.category?.color || "#667eea",
        tags: note.tags?.map((t) => t.name) || [],
        createdAt: formatDate(note.created_at),
        updatedAt: formatDate(note.updated_at),
        imageUrl: note.thumbnail_url, // 添加缩略图
      }));
    } else {
      console.error("获取笔记列表失败:", response.data.message);
    }
  } catch (error: any) {
    console.error("加载笔记失败:", error);
  }
};

const loadCategories = async () => {
  try {
    const response = await getCategories();
    if (response.data.success) {
      // 转换数据格式
      categories.value = response.data.data.map((cat) => ({
        id: cat.id.toString(),
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        noteCount: cat.note_count,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));
    } else {
      console.error("获取分类列表失败:", response.data.message);
    }
  } catch (error: any) {
    console.error("加载分类失败:", error);
  }
};

const removeFilter = (filterKey: string) => {
  switch (filterKey) {
    case "categories":
      selectedCategories.value = [];
      break;
    case "date":
      selectedDatePeriod.value = "";
      break;
  }
};

const clearAllFilters = () => {
  selectedCategories.value = [];
  selectedDatePeriod.value = "";
};

const resetFilters = () => {
  clearAllFilters();
  selectedSort.value = "updatedAt";
};

const applyFilters = () => {
  showFilterModal.value = false;
};

// 转换数据格式以适配NoteCard组件
const convertToNoteCardFormat = (note: LocalNote) => {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    categoryId: note.categoryId,
    categoryName: note.categoryName,
    categoryColor: note.categoryColor,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    imageUrl: note.imageUrl, // 使用笔记的缩略图
  };
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
      // 从列表中移除已删除的笔记
      notes.value = notes.value.filter((n) => n.id !== noteToDelete.value?.id);

      // 显示成功提示
      toast.success("笔记已删除");

      // 关闭对话框
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>