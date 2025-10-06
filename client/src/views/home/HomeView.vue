<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="bg-white px-4 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">我的笔记</h1>
          <p class="text-sm text-gray-500 mt-1">共 {{ totalNotes }} 篇笔记</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="p-2 rounded-full bg-gray-100">
            <i class="fas fa-bell text-gray-600"></i>
          </button>
          <img
            :src="userAvatar"
            class="w-8 h-8 rounded-full cursor-pointer"
            alt="头像"
            @error="handleAvatarError"
            @click="router.push('/main/profile')"
          />
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="px-4 py-4">
      <div class="grid grid-cols-4 gap-3">
        <div class="bg-white p-3 rounded-xl text-center shadow-sm">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-edit text-blue-600"></i>
          </div>
          <span class="text-xs text-gray-600">快速记录</span>
        </div>
        <div class="bg-white p-3 rounded-xl text-center shadow-sm">
          <div
            class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-camera text-green-600"></i>
          </div>
          <span class="text-xs text-gray-600">拍照笔记</span>
        </div>
        <div class="bg-white p-3 rounded-xl text-center shadow-sm">
          <div
            class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-microphone text-purple-600"></i>
          </div>
          <span class="text-xs text-gray-600">语音记录</span>
        </div>
        <div class="bg-white p-3 rounded-xl text-center shadow-sm">
          <div
            class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-list text-orange-600"></i>
          </div>
          <span class="text-xs text-gray-600">待办清单</span>
        </div>
      </div>
    </div>

    <!-- Recent Notes -->
    <div class="px-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">最近笔记</h2>
        <button
          class="text-blue-600 text-sm"
          @click="$router.push('/main/notes')"
        >
          查看全部
        </button>
      </div>

      <!-- Note Cards -->
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="text-gray-500 mt-2">加载中...</p>
      </div>

      <div v-else-if="recentNotes.length === 0" class="text-center py-8">
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <i class="fas fa-sticky-note text-2xl text-gray-400"></i>
        </div>
        <p class="text-gray-500 mb-4">还没有笔记</p>
        <button
          @click="$router.push('/main/notes/new')"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          创建第一篇笔记
        </button>
      </div>

      <div v-else class="space-y-3">
        <NoteCard
          v-for="note in recentNotes"
          :key="note.id"
          :note="note"
          @click="$router.push(`/main/notes/${note.id}`)"
          @delete="showDeleteMenu"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-sm" @click.stop>
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <i class="fas fa-trash text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">删除笔记</h3>
          <p class="text-sm text-gray-600">
            确定要删除笔记"{{ noteToDelete?.title }}"吗？
          </p>
          <p class="text-xs text-gray-500 mt-1">此操作无法撤销</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showDeleteConfirm = false"
            :disabled="deleting"
            class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg disabled:opacity-50"
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

    <!-- Statistics -->
    <div class="px-4 py-6">
      <div
        class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white"
      >
        <h3 class="font-semibold mb-2">本周统计</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold">8</div>
            <div class="text-xs opacity-80">新增笔记</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">2.5h</div>
            <div class="text-xs opacity-80">记录时长</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">5</div>
            <div class="text-xs opacity-80">分类数量</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NoteCard from "../../components/note/NoteCard.vue";
import { useAuthStore } from "../../stores/auth";
import { getNotes, deleteNote } from "@/api/note";
import type { Note } from "../../types/note";
import { toast } from "@/utils/toast";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const totalNotes = ref(0);
const showDeleteConfirm = ref(false);
const noteToDelete = ref<Note | null>(null);
const deleting = ref(false);

// 计算用户头像
const userAvatar = computed(() => {
  return (
    authStore.user?.avatar_url ||
    "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg"
  );
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
  const text = div.textContent || div.innerText || "";
  // 限制长度
  return text.length > 100 ? text.substring(0, 100) + "..." : text;
};

// 最近笔记数据
const recentNotes = ref<Note[]>([]);

// 加载最近笔记
const loadRecentNotes = async () => {
  try {
    loading.value = true;
    const response = await getNotes({
      sort_by: "created_at",
      sort_order: "DESC",
      limit: 4, // 只加载最近4条
    });

    if (response.data.success) {
      totalNotes.value = response.data.data.total;

      // 转换数据格式以适配NoteCard组件
      recentNotes.value = response.data.data.notes.map((note) => ({
        id: note.id.toString(),
        title: note.title,
        content: extractText(note.content),
        categoryId: note.category_id.toString(),
        categoryName: note.category?.name || "",
        categoryColor: note.category?.color || "#667eea",
        tags: note.tags?.map((t) => t.name) || [],
        createdAt: formatDate(note.created_at),
        updatedAt: formatDate(note.updated_at),
        imageUrl: note.thumbnail_url || undefined,
      }));
    } else {
      console.error("获取笔记列表失败:", response.data.message);
    }
  } catch (error: any) {
    console.error("加载笔记失败:", error);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取用户信息和笔记
onMounted(async () => {
  // 如果已登录但没有用户信息，则获取
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUserProfile();
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  } else if (!authStore.user && authStore.token) {
    // 尝试从 localStorage 恢复
    authStore.restoreUser();
  }

  // 加载最近笔记
  await loadRecentNotes();
});

// 头像加载失败处理
const handleAvatarError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src =
    "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg";
  console.warn("用户头像加载失败，使用默认头像");
};

// 显示删除确认对话框
const showDeleteMenu = (note: Note) => {
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
      recentNotes.value = recentNotes.value.filter(
        (n) => n.id !== noteToDelete.value?.id
      );
      totalNotes.value = Math.max(0, totalNotes.value - 1);

      // 显示成功提示
      toast.success("笔记已删除");

      // 关闭对话框
      showDeleteConfirm.value = false;
      noteToDelete.value = null;

      // 如果笔记少于4条，重新加载
      if (recentNotes.value.length < 4) {
        await loadRecentNotes();
      }
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