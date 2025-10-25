<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-screen flex flex-col overflow-hidden transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="$router.back()" class="p-2 -ml-2">
            <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
          </button>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            回收站
          </h1>
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >({{ deletedNotes.length }})</span
          >
        </div>
        <button
          @click="toggleEditMode"
          class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <i class="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>

    <!-- Edit Mode Toolbar -->
    <div
      v-if="editMode"
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors"
    >
      <div class="flex items-center space-x-4">
        <button
          @click="toggleSelectAll"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {{ isAllSelected ? "取消全选" : "全选" }}
        </button>
        <span class="text-sm text-gray-500 dark:text-gray-400"
          >已选 {{ selectedNotes.length }} 项</span
        >
      </div>
      <button
        @click="handleBatchDelete"
        :disabled="selectedNotes.length === 0"
        class="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="fas fa-trash-alt"></i>
        <span>彻底删除</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    </div>

    <div
      v-else-if="deletedNotes.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center">
        <i
          class="fas fa-trash text-6xl text-gray-300 dark:text-gray-600 mb-4"
        ></i>
        <p class="text-gray-500 dark:text-gray-400">回收站是空的</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          删除的笔记会在这里保留 30 天
        </p>
      </div>
    </div>

    <!-- Notes List -->
    <div v-else class="flex-1 overflow-y-auto p-4">
      <div class="space-y-3 pb-24">
        <div
          v-for="note in deletedNotes"
          :key="note.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
          :class="{
            'ring-2 ring-blue-500 dark:ring-blue-400': selectedNotes.includes(
              note.id
            ),
          }"
        >
          <div class="p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-start space-x-3 flex-1">
                <!-- Checkbox (Edit Mode) -->
                <div v-if="editMode" class="pt-1">
                  <input
                    type="checkbox"
                    :checked="selectedNotes.includes(note.id)"
                    @change="toggleNoteSelection(note.id)"
                    class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <!-- Note Content -->
                <div class="flex-1 min-w-0">
                  <h3
                    class="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate"
                  >
                    {{ note.title }}
                  </h3>
                  <p
                    class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2"
                  >
                    {{ getPlainText(note.content) }}
                  </p>
                  <div
                    class="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400"
                  >
                    <span
                      class="px-2 py-1 rounded-full"
                      :style="{
                        backgroundColor: note.category?.color + '20',
                        color: note.category?.color,
                      }"
                    >
                      {{ note.category?.name || "未分类" }}
                    </span>
                    <span>{{ formatDate(note.updated_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Restore Button (Non-Edit Mode) -->
              <button
                v-if="!editMode"
                @click="handleRestore(note.id)"
                class="ml-2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex-shrink-0 self-center transition-colors"
                title="还原"
              >
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <div
      v-if="showConfirmDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showConfirmDialog = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 mx-4 transition-colors"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            确认删除
          </h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-gray-700 dark:text-gray-300 mb-2">
            确定要彻底删除选中的 {{ selectedNotes.length }} 篇笔记吗？
          </p>
          <p class="text-sm text-red-600 dark:text-red-400">
            ⚠️ 此操作不可逆，笔记将永久删除！
          </p>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3"
        >
          <button
            @click="showConfirmDialog = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmBatchDelete"
            :disabled="deleting"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
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
import { useRouter } from "vue-router";
import {
  getDeletedNotes,
  restoreNote,
  permanentlyDeleteNotes,
} from "@/api/note";
import { toast } from "@/utils/toast";

const router = useRouter();

interface Note {
  id: number;
  title: string;
  content: string;
  category?: {
    name: string;
    color: string;
  };
  updated_at: string;
  created_at: string;
}

const loading = ref(false);
const deletedNotes = ref<Note[]>([]);
const editMode = ref(false);
const selectedNotes = ref<number[]>([]);
const showConfirmDialog = ref(false);
const deleting = ref(false);

const isAllSelected = computed(() => {
  return (
    deletedNotes.value.length > 0 &&
    selectedNotes.value.length === deletedNotes.value.length
  );
});

onMounted(() => {
  loadDeletedNotes();
});

const loadDeletedNotes = async () => {
  loading.value = true;
  try {
    const response = await getDeletedNotes();
    if (response.data.success) {
      deletedNotes.value = response.data.data;
    } else {
      toast.error(response.data.message || "加载失败");
    }
  } catch (error: any) {
    console.error("加载回收站笔记失败:", error);
    toast.error(error.response?.data?.message || "加载失败，请重试");
  } finally {
    loading.value = false;
  }
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    selectedNotes.value = [];
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedNotes.value = [];
  } else {
    selectedNotes.value = deletedNotes.value.map((note) => note.id);
  }
};

const toggleNoteSelection = (noteId: number) => {
  const index = selectedNotes.value.indexOf(noteId);
  if (index > -1) {
    selectedNotes.value.splice(index, 1);
  } else {
    selectedNotes.value.push(noteId);
  }
};

const handleRestore = async (noteId: number) => {
  try {
    const response = await restoreNote(noteId);
    if (response.data.success) {
      toast.success("笔记已还原");
      // 从列表中移除
      deletedNotes.value = deletedNotes.value.filter(
        (note) => note.id !== noteId
      );
    } else {
      toast.error(response.data.message || "还原失败");
    }
  } catch (error: any) {
    console.error("还原笔记失败:", error);
    toast.error(error.response?.data?.message || "还原失败，请重试");
  }
};

const handleBatchDelete = () => {
  if (selectedNotes.value.length === 0) {
    toast.error("请选择要删除的笔记");
    return;
  }
  showConfirmDialog.value = true;
};

const confirmBatchDelete = async () => {
  deleting.value = true;
  try {
    const response = await permanentlyDeleteNotes(selectedNotes.value);
    if (response.data.success) {
      toast.success(`成功删除 ${selectedNotes.value.length} 篇笔记`);
      // 从列表中移除已删除的笔记
      deletedNotes.value = deletedNotes.value.filter(
        (note) => !selectedNotes.value.includes(note.id)
      );
      selectedNotes.value = [];
      editMode.value = false;
      showConfirmDialog.value = false;
    } else {
      toast.error(response.data.message || "删除失败");
    }
  } catch (error: any) {
    console.error("彻底删除笔记失败:", error);
    toast.error(error.response?.data?.message || "删除失败，请重试");
  } finally {
    deleting.value = false;
  }
};

const getPlainText = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "今天";
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};
</script>
