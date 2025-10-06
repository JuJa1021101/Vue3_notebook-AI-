<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Profile Header -->
    <div class="gradient-bg px-4 py-8 text-white">
      <div class="flex items-center space-x-4 mb-6">
        <img
          :src="userAvatar"
          class="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          alt="头像"
          @error="handleAvatarError"
        />
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1">{{ userNickname }}</h2>
          <p class="text-white/80 text-sm mb-2">{{ userProfile.title }}</p>
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center space-x-1">
              <i class="fas fa-calendar"></i>
              <span>加入 {{ joinedDays }} 天</span>
            </div>
            <div class="flex items-center space-x-1">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ userProfile.location }}</span>
            </div>
          </div>
        </div>
        <button class="p-2" @click="$router.push('/profile/settings')">
          <i class="fas fa-cog text-white"></i>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold">{{ userStats.totalNotes }}</div>
          <div class="text-white/80 text-xs">笔记总数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ userStats.totalCategories }}</div>
          <div class="text-white/80 text-xs">分类数量</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ userStats.totalWords }}</div>
          <div class="text-white/80 text-xs">总字数</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="px-4 py-4">
      <div class="grid grid-cols-4 gap-3">
        <div
          v-for="action in quickActions"
          :key="action.name"
          @click="handleQuickAction(action.name)"
          class="bg-white p-3 rounded-xl text-center shadow-sm cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
            :style="{ backgroundColor: action.color + '20' }"
          >
            <i :class="action.icon" :style="{ color: action.color }"></i>
          </div>
          <span class="text-xs text-gray-600">{{ action.label }}</span>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="px-4">
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div
          v-for="(item, index) in menuItems"
          :key="item.name"
          @click="handleMenuClick(item.name)"
          class="menu-item p-4 flex items-center justify-between cursor-pointer"
          :class="{ 'border-b border-gray-100': index < menuItems.length - 1 }"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: item.color + '20' }"
            >
              <i :class="item.icon" :style="{ color: item.color }"></i>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ item.title }}</h3>
              <p class="text-sm text-gray-500">{{ item.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span v-if="item.badge" class="text-xs text-green-600">{{
              item.badge
            }}</span>
            <i class="fas fa-chevron-right text-gray-300"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Storage Info -->
    <div class="px-4 py-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-900">存储空间</h3>
          <span class="text-sm text-gray-500"
            >{{ storageInfo.used }}GB / {{ storageInfo.total }}GB</span
          >
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full mb-3">
          <div
            class="h-full bg-blue-500 rounded-full"
            :style="{
              width: `${(storageInfo.used / storageInfo.total) * 100}%`,
            }"
          ></div>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ storageInfo.text }}GB
            </div>
            <div class="text-xs text-gray-500">文本</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ storageInfo.images }}GB
            </div>
            <div class="text-xs text-gray-500">图片</div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ storageInfo.others }}GB
            </div>
            <div class="text-xs text-gray-500">其他</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Options -->
    <div class="px-4 pb-4">
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div
          v-for="(item, index) in otherOptions"
          :key="item.name"
          @click="handleMenuClick(item.name)"
          class="menu-item p-4 flex items-center justify-between cursor-pointer"
          :class="{
            'border-b border-gray-100': index < otherOptions.length - 1,
            'text-red-500': item.name === 'logout',
          }"
        >
          <div class="flex items-center space-x-3">
            <i
              :class="
                item.icon +
                (item.name === 'logout' ? ' text-red-500' : ' text-gray-400')
              "
            ></i>
            <span
              :class="item.name === 'logout' ? 'text-red-500' : 'text-gray-900'"
              >{{ item.title }}</span
            >
          </div>
          <i class="fas fa-chevron-right text-gray-300"></i>
        </div>
      </div>
    </div>

    <!-- Achievement Badge -->
    <div class="px-4 pb-6">
      <div
        class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
          >
            <i class="fas fa-trophy text-2xl"></i>
          </div>
          <div>
            <h3 class="font-semibold mb-1">{{ achievement.title }}</h3>
            <p class="text-sm opacity-90">{{ achievement.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { toast } from "@/utils/toast";

const router = useRouter();
const authStore = useAuthStore();

// 计算用户头像
const userAvatar = computed(() => {
  return (
    authStore.user?.avatar_url ||
    "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg"
  );
});

// 计算用户昵称
const userNickname = computed(() => {
  return authStore.user?.nickname || authStore.user?.username || "用户";
});

// 计算加入天数
const joinedDays = computed(() => {
  if (!authStore.user?.created_at) {
    return 0;
  }

  const createdDate = new Date(authStore.user.created_at);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 1;
});

const userProfile = ref({
  name: computed(() => userNickname.value),
  title: "产品设计师",
  joinDays: computed(() => joinedDays.value),
  location: "北京",
});

const userStats = ref({
  totalNotes: 54,
  totalCategories: 12,
  totalWords: "8.5k",
});

// 组件挂载时获取用户信息
onMounted(async () => {
  console.log("ProfileView mounted, authStore.user:", authStore.user);
  console.log(
    "ProfileView mounted, authStore.isAuthenticated:",
    authStore.isAuthenticated
  );
  console.log("ProfileView mounted, token:", authStore.token);

  // 如果已登录但没有用户信息，则获取
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      console.log("Fetching user profile...");
      await authStore.fetchUserProfile();
      console.log("User profile fetched:", authStore.user);
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  } else if (!authStore.user && authStore.token) {
    // 尝试从 localStorage 恢复
    authStore.restoreUser();
  }
});

const quickActions = ref([
  {
    name: "favorites",
    label: "收藏",
    icon: "fas fa-star",
    color: "#3b82f6",
  },
  {
    name: "recent",
    label: "最近",
    icon: "fas fa-history",
    color: "#10b981",
  },
  {
    name: "trash",
    label: "回收站",
    icon: "fas fa-trash",
    color: "#8b5cf6",
  },
  {
    name: "export",
    label: "导出",
    icon: "fas fa-download",
    color: "#f59e0b",
  },
]);

const menuItems = ref([
  {
    name: "account",
    title: "账户管理",
    description: "个人信息、密码设置",
    icon: "fas fa-user",
    color: "#3b82f6",
  },
  {
    name: "sync",
    title: "数据同步",
    description: "云端备份、多设备同步",
    icon: "fas fa-sync",
    color: "#10b981",
    badge: "已同步",
  },
  {
    name: "theme",
    title: "主题设置",
    description: "外观、字体、夜间模式",
    icon: "fas fa-palette",
    color: "#8b5cf6",
  },
  {
    name: "privacy",
    title: "隐私安全",
    description: "密码锁、指纹解锁",
    icon: "fas fa-shield-alt",
    color: "#f59e0b",
  },
  {
    name: "notification",
    title: "通知设置",
    description: "提醒、推送通知",
    icon: "fas fa-bell",
    color: "#ef4444",
  },
]);

const otherOptions = ref([
  {
    name: "help",
    title: "帮助与反馈",
    icon: "fas fa-question-circle",
  },
  {
    name: "about",
    title: "关于我们",
    icon: "fas fa-info-circle",
  },
  {
    name: "logout",
    title: "退出登录",
    icon: "fas fa-sign-out-alt",
  },
]);

const storageInfo = ref({
  used: 2.3,
  total: 5,
  text: 1.2,
  images: 0.8,
  others: 0.3,
});

const achievement = ref({
  title: "连续记录达人",
  description: "已连续记录笔记 15 天",
});

const handleQuickAction = (action: string) => {
  switch (action) {
    case "favorites":
      router.push("/notes?filter=starred");
      break;
    case "recent":
      router.push("/notes?filter=recent");
      break;
    case "trash":
      router.push("/notes?filter=deleted");
      break;
    case "export":
      // TODO: 导出功能
      toast.info("导出功能开发中...");
      break;
  }
};

const handleMenuClick = async (menu: string) => {
  switch (menu) {
    case "account":
      router.push("/profile/account");
      break;
    case "sync":
      router.push("/profile/sync");
      break;
    case "theme":
      router.push("/profile/theme");
      break;
    case "privacy":
      router.push("/profile/privacy");
      break;
    case "notification":
      router.push("/profile/notification");
      break;
    case "help":
      router.push("/profile/help");
      break;
    case "about":
      router.push("/profile/about");
      break;
    case "logout":
      if (confirm("确定要退出登录吗？")) {
        try {
          await authStore.logout();
          router.push("/auth/login");
        } catch (error) {
          console.error("退出登录失败:", error);
          toast.error("退出登录失败，请重试");
        }
      }
      break;
  }
};

const handleAvatarError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  // 使用默认头像
  imgElement.src =
    "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg";
  console.warn("用户头像加载失败，使用默认头像");
};
</script>