<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            我的笔记
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共 {{ totalNotes }} 篇笔记
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-colors"
          >
            <i class="fas fa-bell text-gray-600 dark:text-gray-300"></i>
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

    <!-- Quick Actions - 使用 grid-cols-2 替代 grid-cols-4 -->
    <div class="px-5 py-5">
      <div class="grid grid-cols-2 gap-3">
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-card cursor-pointer hover-lift transition-all"
          @click="router.push('/main/notes/new')"
        >
          <div
            class="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-edit text-primary-500"></i>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">快速记录</span>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-card cursor-pointer transition-colors"
          @click="toast.info('拍照笔记功能开发中...')"
        >
          <div
            class="w-10 h-10 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-camera text-success-500"></i>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">拍照笔记</span>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-card cursor-pointer transition-colors"
          @click="toast.info('语音记录功能开发中...')"
        >
          <div
            class="w-10 h-10 bg-accent-50 dark:bg-accent-900/20 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-microphone text-accent-500"></i>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">语音记录</span>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-card cursor-pointer transition-colors"
          @click="toast.info('待办清单功能开发中...')"
        >
          <div
            class="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2"
          >
            <i class="fas fa-list text-orange-500"></i>
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300">待办清单</span>
        </div>
      </div>
    </div>

    <!-- Recent Notes -->
    <div class="px-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          最近笔记
        </h2>
        <button
          class="text-blue-600 text-sm"
          @click="$router.push('/main/notes')"
        >
          查看全部
        </button>
      </div>

      <!-- Note Cards - 骨架屏 -->
      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
        >
          <div
            class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"
          ></div>
          <div
            class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"
          ></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      <div v-else-if="recentNotes.length === 0" class="text-center py-8">
        <div class="empty-illustration mb-4">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="20"
              y="30"
              width="80"
              height="60"
              rx="4"
              fill="#E5E7EB"
              opacity="0.5"
            />
            <rect x="30" y="40" width="60" height="4" rx="2" fill="#9CA3AF" />
            <rect x="30" y="50" width="50" height="4" rx="2" fill="#9CA3AF" />
            <rect x="30" y="60" width="55" height="4" rx="2" fill="#9CA3AF" />
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-2 font-medium">
          你的第一篇笔记，从这里开始
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
          试试这些笔记模板
        </p>
        <div class="flex flex-col gap-2 max-w-xs mx-auto">
          <button
            @click="createNoteWithTemplate('日记')"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-primary-500 transition-colors"
          >
            📝 今天的日记
          </button>
          <button
            @click="createNoteWithTemplate('待办')"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-primary-500 transition-colors"
          >
            ✅ 待办清单
          </button>
          <button
            @click="createNoteWithTemplate('想法')"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-primary-500 transition-colors"
          >
            💡 灵感记录
          </button>
        </div>
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
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm transition-colors"
        @click.stop
      >
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <i
              class="fas fa-trash text-orange-600 dark:text-orange-400 text-xl"
            ></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            删除笔记
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            删除后可以在回收站找回
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            "{{ noteToDelete?.title }}"
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

    <!-- Statistics - 只在有数据时显示 -->
    <div v-if="totalNotes > 3" class="px-4 py-6">
      <div class="stats-card rounded-xl p-4 text-white">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold">+3 vs 上周</h3>
          <span class="text-xs opacity-80">本周新增</span>
        </div>
        <div class="flex items-baseline gap-2">
          <div class="text-3xl font-bold">{{ weeklyStats.newNotes }}</div>
          <div class="text-sm opacity-80">篇笔记</div>
        </div>
        <div class="mt-3 pt-3 border-t border-white/20">
          <div class="flex justify-between text-sm">
            <span class="opacity-80">超过 68% 的用户</span>
            <span class="font-medium">🎉 继续加油</span>
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
import { useAIStore } from "../../stores/ai";
import { getNotes, deleteNote } from "@/api/note";
import type { Note } from "../../types/note";
import { toast } from "@/utils/toast";

const router = useRouter();
const authStore = useAuthStore();
const aiStore = useAIStore();
const loading = ref(false);
const totalNotes = ref(0);
const showDeleteConfirm = ref(false);
const noteToDelete = ref<Note | null>(null);
const deleting = ref(false);

// 周统计数据
const weeklyStats = ref({
  newNotes: 0,
  percentile: 68, // 超过的用户百分比
});

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
        is_favorited: note.is_favorited || false,
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

  // 确保AI设置已加载（如果尚未加载）
  if (!aiStore.settings) {
    try {
      await aiStore.fetchSettings();
      console.log("HomeView: AI设置加载成功:", aiStore.settings);
    } catch (error) {
      console.error("HomeView: 加载AI设置失败:", error);
    }
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

// 使用模板创建笔记
const createNoteWithTemplate = (template: string) => {
  const templates: Record<string, { title: string; content: string }> = {
    日记: {
      title: `${new Date().toLocaleDateString()} 的日记`,
      content: "# 今天的心情\n\n# 今天做了什么\n\n# 明天的计划\n\n",
    },
    待办: {
      title: "待办清单",
      content:
        "## 今日待办\n\n- [ ] \n- [ ] \n- [ ] \n\n## 本周计划\n\n- [ ] \n- [ ] \n",
    },
    想法: {
      title: "灵感记录",
      content: "## 💡 想法\n\n\n\n## 📝 详细说明\n\n\n\n## 🎯 下一步\n\n",
    },
  };

  const templateData = templates[template];
  if (templateData) {
    // 将模板数据存储到 sessionStorage，在新建页面读取
    sessionStorage.setItem("noteTemplate", JSON.stringify(templateData));
  }
  router.push("/main/notes/new");
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

<style scoped>
.stats-card {
  background: url("/background.jpg") center/cover no-repeat;
  position: relative;
}

.stats-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    120deg,
    rgba(91, 127, 242, 0.85) 0%,
    rgba(217, 93, 235, 0.85) 100%
  );
  border-radius: 0.75rem;
  z-index: 0;
}

.stats-card > * {
  position: relative;
  z-index: 1;
}

/* 暗黑模式下调整遮罩 */
.dark .stats-card::before {
  background: linear-gradient(
    120deg,
    rgba(91, 127, 242, 0.7) 0%,
    rgba(217, 93, 235, 0.7) 100%
  );
}
</style>