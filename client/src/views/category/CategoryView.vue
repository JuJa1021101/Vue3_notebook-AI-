<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="bg-white px-4 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">分类管理</h1>
        <button
          @click="showAddCategoryModal = true"
          class="bg-blue-600 text-white p-2 rounded-full"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-1">管理你的笔记分类</p>
    </div>

    <!-- Search Bar -->
    <div class="px-4 py-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索分类..."
          class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm"
        />
        <i
          class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        ></i>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="px-4">
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="category-card bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer"
          @click="$router.push(`/notes?categoryId=${category.id}`)"
        >
          <div class="flex items-center justify-between mb-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: category.color }"
            >
              <i :class="category.icon + ' text-white text-lg'"></i>
            </div>
            <button @click.stop="showCategoryMenu(category)" class="p-1">
              <i class="fas fa-ellipsis-h text-gray-400"></i>
            </button>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ category.name }}</h3>
          <p class="text-sm text-gray-500 mb-3">
            {{ category.note_count }} 篇笔记
          </p>
          <div class="flex items-center text-xs text-gray-400">
            <i class="fas fa-clock mr-1"></i>
            <span>最近更新：{{ formatTime(category.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="px-4 py-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-900 mb-4">分类统计</h3>
        <div class="space-y-3">
          <div
            v-for="category in topCategories"
            :key="category.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="text-sm text-gray-600">{{ category.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-20 h-2 bg-gray-200 rounded-full">
                <div
                  class="h-full rounded-full"
                  :style="{
                    backgroundColor: category.color,
                    width: `${(category.note_count / maxNoteCount) * 100}%`,
                  }"
                ></div>
              </div>
              <span class="text-sm text-gray-500">{{
                category.note_count
              }}</span>
            </div>
          </div>
        </div>
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">删除分类</h3>
          <p class="text-sm text-gray-600">
            确定要删除分类"{{ categoryToDelete?.name }}"吗？
          </p>
          <p
            class="text-xs text-red-500 mt-2"
            v-if="
              categoryToDelete?.note_count && categoryToDelete.note_count > 0
            "
          >
            该分类下还有
            {{ categoryToDelete.note_count }} 篇笔记，删除后这些笔记将无法访问
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

    <!-- Add Category Modal -->
    <div
      v-if="showAddCategoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showAddCategoryModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-sm" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">新建分类</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >分类名称</label
            >
            <input
              type="text"
              v-model="newCategory.name"
              placeholder="输入分类名称"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >选择图标</label
            >
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon.name"
                type="button"
                @click="newCategory.icon = icon.name"
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="
                  newCategory.icon === icon.name ? 'ring-2 ring-blue-500' : ''
                "
                :style="{ backgroundColor: icon.color + '20' }"
              >
                <i :class="icon.name" :style="{ color: icon.color }"></i>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >选择颜色</label
            >
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="color in availableColors"
                :key="color"
                type="button"
                @click="newCategory.color = color"
                class="w-8 h-8 rounded-full"
                :class="
                  newCategory.color === color ? 'ring-2 ring-gray-400' : ''
                "
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button
            @click="showAddCategoryModal = false"
            class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg"
          >
            取消
          </button>
          <button
            @click="createCategory"
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getCategories,
  createCategory as createCategoryApi,
  deleteCategory,
} from "@/api/category";
import type { Category } from "@/api/category";
import { toast } from "@/utils/toast";

// 简单的消息提示函数
const showMessage = (
  message: string,
  type: "success" | "error" | "warning" = "success"
) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast.info(message);
  }
};

const searchKeyword = ref("");
const showAddCategoryModal = ref(false);
const loading = ref(false);

const newCategory = ref({
  name: "",
  icon: "fas fa-folder",
  color: "#3b82f6",
});

const categories = ref<Category[]>([]);
const showDeleteConfirm = ref(false);
const categoryToDelete = ref<Category | null>(null);
const deleting = ref(false);

const availableIcons = [
  { name: "fas fa-star", color: "#3b82f6" },
  { name: "fas fa-leaf", color: "#10b981" },
  { name: "fas fa-music", color: "#8b5cf6" },
  { name: "fas fa-camera", color: "#f59e0b" },
  { name: "fas fa-heart", color: "#ef4444" },
  { name: "fas fa-folder", color: "#6b7280" },
  { name: "fas fa-briefcase", color: "#1f2937" },
  { name: "fas fa-graduation-cap", color: "#059669" },
  { name: "fas fa-code", color: "#7c3aed" },
  { name: "fas fa-plane", color: "#d97706" },
  { name: "fas fa-book", color: "#dc2626" },
  { name: "fas fa-gamepad", color: "#9333ea" },
];

const availableColors = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
  "#1f2937",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#65a30d",
  "#c2410c",
  "#be185d",
];

// 格式化时间显示
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  if (days < 14) return "1周前";
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return date.toLocaleDateString();
};

const filteredCategories = computed(() => {
  if (!searchKeyword.value) return categories.value;
  return categories.value.filter((category) =>
    category.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const topCategories = computed(() => {
  return [...categories.value]
    .sort((a, b) => b.note_count - a.note_count)
    .slice(0, 4);
});

const maxNoteCount = computed(() => {
  if (categories.value.length === 0) return 1;
  return Math.max(...categories.value.map((c) => c.note_count));
});

const showCategoryMenu = (category: Category) => {
  categoryToDelete.value = category;
  showDeleteConfirm.value = true;
};

// 加载分类列表
const loadCategories = async () => {
  try {
    loading.value = true;
    const response = await getCategories();
    if (response.data.success) {
      categories.value = response.data.data;
    } else {
      showMessage(response.data.message || "获取分类列表失败", "error");
    }
  } catch (error: any) {
    console.error("加载分类失败:", error);
    showMessage(error.response?.data?.message || "获取分类列表失败", "error");
  } finally {
    loading.value = false;
  }
};

// 创建分类
const createCategory = async () => {
  if (!newCategory.value.name.trim()) {
    showMessage("请输入分类名称", "warning");
    return;
  }

  try {
    loading.value = true;
    const response = await createCategoryApi({
      name: newCategory.value.name,
      icon: newCategory.value.icon,
      color: newCategory.value.color,
    });

    if (response.data.success) {
      showMessage("分类创建成功", "success");

      // 重置表单
      newCategory.value = {
        name: "",
        icon: "fas fa-folder",
        color: "#3b82f6",
      };

      showAddCategoryModal.value = false;

      // 重新加载分类列表
      await loadCategories();
    } else {
      showMessage(response.data.message || "创建分类失败", "error");
    }
  } catch (error: any) {
    console.error("创建分类失败:", error);
    showMessage(error.response?.data?.message || "创建分类失败", "error");
  } finally {
    loading.value = false;
  }
};

// 确认删除分类
const confirmDelete = async () => {
  if (!categoryToDelete.value) return;

  try {
    deleting.value = true;
    const response = await deleteCategory(categoryToDelete.value.id);

    if (response.data.success) {
      // 从列表中移除已删除的分类
      categories.value = categories.value.filter(
        (c) => c.id !== categoryToDelete.value?.id
      );

      // 显示成功提示
      showMessage("分类已删除", "success");

      // 关闭对话框
      showDeleteConfirm.value = false;
      categoryToDelete.value = null;
    } else {
      showMessage(response.data.message || "删除失败", "error");
    }
  } catch (error: any) {
    console.error("删除分类失败:", error);
    const errorMsg = error.response?.data?.message || "删除失败，请重试";
    showMessage(errorMsg, "error");
  } finally {
    deleting.value = false;
  }
};

// 组件挂载时加载分类
onMounted(() => {
  loadCategories();
});
</script>