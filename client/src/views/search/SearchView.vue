<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Search Header -->
    <div class="bg-white px-4 py-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          @keyup.enter="handleSearch"
          placeholder="搜索笔记内容、标题、标签..."
          class="w-full bg-gray-100 border-none rounded-xl px-4 py-3 pl-10 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <i
          class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        ></i>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Search Filters -->
    <div class="bg-white px-4 pb-3">
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          v-for="filter in searchFilters"
          :key="filter.key"
          @click="activeFilter = filter.key"
          class="filter-btn px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all"
          :class="
            activeFilter === filter.key
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Recent Searches -->
    <div
      v-if="!searchQuery && !hasSearched && recentSearches.length > 0"
      class="bg-white px-4 py-4 mb-2"
    >
      <h3 class="text-sm font-medium text-gray-500 mb-3">最近搜索</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="term in recentSearches"
          :key="term"
          @click="
            searchQuery = term;
            handleSearch();
          "
          class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          {{ term }}
        </button>
      </div>
    </div>

    <!-- Hot Tags -->
    <div
      v-if="!searchQuery && !hasSearched && hotTags.length > 0"
      class="px-4 py-4"
    >
      <h3 class="text-sm font-medium text-gray-500 mb-3">热门标签</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in hotTags"
          :key="tag.id"
          @click="searchByTag(tag.name)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :style="{
            backgroundColor: getTagColor(tag.name) + '15',
            color: getTagColor(tag.name),
            border: `1px solid ${getTagColor(tag.name)}30`,
          }"
        >
          <i class="fas fa-hashtag text-xs mr-1"></i>
          {{ tag.name }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-4 py-8 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
      <p class="text-sm text-gray-500">搜索中...</p>
    </div>

    <!-- Search Results -->
    <div v-else-if="hasSearched && searchResults.length > 0" class="px-4 py-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-500">搜索结果</h3>
        <span class="text-sm text-gray-400"
          >找到 {{ totalResults }} 个结果</span
        >
      </div>

      <div class="space-y-3">
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="search-result bg-white p-4 rounded-xl border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          @click="goToNote(result.id)"
        >
          <div class="flex items-start justify-between mb-2">
            <h4
              class="font-semibold text-gray-900 flex-1"
              v-html="highlightText(result.title)"
            ></h4>
            <span class="text-xs text-gray-400 ml-2 whitespace-nowrap">{{
              formatDate(result.created_at)
            }}</span>
          </div>
          <p
            class="text-sm text-gray-600 mb-3 line-clamp-2"
            v-html="highlightText(result.content_text || '')"
          ></p>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 flex-wrap gap-1">
              <span
                v-if="result.category"
                class="text-xs px-2 py-1 rounded-full"
                :style="{
                  backgroundColor: result.category.color + '20',
                  color: result.category.color,
                }"
              >
                <i :class="result.category.icon" class="mr-1"></i>
                {{ result.category.name }}
              </span>
              <span
                v-if="result.tags && result.tags.length > 0"
                class="text-xs text-gray-400"
              >
                {{ result.tags.map((tag) => "#" + tag.name).join(" ") }}
              </span>
            </div>
            <i class="fas fa-chevron-right text-gray-300"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div
      v-else-if="hasSearched && searchResults.length === 0 && !loading"
      class="px-4 py-8 text-center"
    >
      <div
        class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <i class="fas fa-search text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">未找到相关内容</h3>
      <p class="text-sm text-gray-500 mb-4">尝试使用其他关键词或检查拼写</p>
    </div>

    <!-- Search Suggestions -->
    <div
      v-if="searchQuery && searchQuery.length < 3 && !hasSearched"
      class="px-4 py-4"
    >
      <h3 class="text-sm font-medium text-gray-500 mb-3">搜索建议</h3>
      <div class="space-y-2">
        <button
          v-for="suggestion in searchSuggestions"
          :key="suggestion"
          @click="
            searchQuery = suggestion;
            handleSearch();
          "
          class="w-full text-left p-3 bg-white rounded-lg border border-gray-100 flex items-center space-x-3"
        >
          <i class="fas fa-search text-gray-400"></i>
          <span class="text-sm text-gray-600">{{ suggestion }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { searchNotes, getPopularTags, type Note } from "@/api/note";

const router = useRouter();
const searchQuery = ref("");
const activeFilter = ref("all");
const hasSearched = ref(false);
const loading = ref(false);
const searchResults = ref<Note[]>([]);
const totalResults = ref(0);

const searchFilters = [
  { key: "all", label: "全部" },
  { key: "title", label: "标题" },
  { key: "content", label: "内容" },
];

const recentSearches = ref<string[]>([]);
const hotTags = ref<Array<{ id: number; name: string; note_count: number }>>(
  []
);
const searchSuggestions = ref<string[]>([]);

// 从 localStorage 加载最近搜索
const loadRecentSearches = () => {
  const saved = localStorage.getItem("recentSearches");
  if (saved) {
    try {
      recentSearches.value = JSON.parse(saved);
    } catch (e) {
      recentSearches.value = [];
    }
  }
};

// 保存最近搜索到 localStorage
const saveRecentSearches = () => {
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches.value));
};

// 加载热门标签
const loadHotTags = async () => {
  try {
    const res = await getPopularTags(5);
    if (res.data.code === 200) {
      hotTags.value = res.data.data;
    }
  } catch (error) {
    console.error("加载热门标签失败:", error);
  }
};

// 获取标签颜色
const getTagColor = (tagName: string) => {
  const colors = [
    "#3b82f6", // 蓝色 - 技术
    "#10b981", // 绿色 - 学习
    "#8b5cf6", // 紫色 - 设计
    "#f59e0b", // 橙色 - 生活
    "#ef4444", // 红色 - 读书
  ];

  // 根据标签名称生成一个稳定的颜色索引
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 通过标签搜索
const searchByTag = (tagName: string) => {
  searchQuery.value = tagName;
  activeFilter.value = "all"; // 使用all类型，后端会在所有字段中搜索
  handleSearch();
};

// 执行搜索
const handleSearch = async () => {
  const query = searchQuery.value.trim();

  if (!query) {
    hasSearched.value = false;
    searchResults.value = [];
    totalResults.value = 0;
    return;
  }

  hasSearched.value = true;
  loading.value = true;

  try {
    // 添加到最近搜索
    if (!recentSearches.value.includes(query)) {
      recentSearches.value.unshift(query);
      if (recentSearches.value.length > 10) {
        recentSearches.value.pop();
      }
      saveRecentSearches();
    }

    // 调用搜索API
    const res = await searchNotes({
      q: query,
      type: activeFilter.value as "all" | "title" | "content",
      page: 1,
      limit: 50,
    });

    if (res.data.code === 200) {
      searchResults.value = res.data.data.notes;
      totalResults.value = res.data.data.total;
    } else {
      console.error(res.data.message || "搜索失败");
      searchResults.value = [];
      totalResults.value = 0;
    }
  } catch (error: any) {
    console.error("搜索失败:", error);
    searchResults.value = [];
    totalResults.value = 0;
  } finally {
    loading.value = false;
  }
};

// 防抖搜索
let searchTimer: number | null = null;
const debouncedSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = window.setTimeout(() => {
    handleSearch();
  }, 500);
};

// 清空搜索
const clearSearch = () => {
  searchQuery.value = "";
  hasSearched.value = false;
  searchResults.value = [];
  totalResults.value = 0;
};

// 高亮搜索关键词
const highlightText = (text: string) => {
  if (!searchQuery.value || !text) return text;

  const regex = new RegExp(
    `(${searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
};

// 跳转到笔记详情
const goToNote = (noteId: number) => {
  router.push(`/main/notes/${noteId}`);
};

// 监听筛选条件变化
watch(activeFilter, () => {
  if (hasSearched.value && searchQuery.value.trim()) {
    handleSearch();
  }
});

// 组件挂载时加载数据
onMounted(() => {
  loadRecentSearches();
  loadHotTags();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.highlight) {
  background: #fef3c7;
  padding: 0 2px;
  border-radius: 2px;
}
</style>