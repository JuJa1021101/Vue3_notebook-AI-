<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto transition-colors"
  >
    <!-- 退出登录确认弹窗 -->
    <LogoutDialog
      v-model="showLogoutDialog"
      @confirm="handleLogoutConfirm"
      @cancel="handleLogoutCancel"
    />

    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          设置
        </h1>
        <div class="w-8"></div>
      </div>
    </div>

    <!-- Settings Options -->
    <div class="px-4 py-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
      >
        <div
          v-for="(item, index) in settingsOptions"
          :key="item.name"
          @click="handleOptionClick(item.name)"
          class="menu-item p-4 flex items-center justify-between cursor-pointer"
          :class="{
            'border-b border-gray-100 dark:border-gray-700':
              index < settingsOptions.length - 1,
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
              :class="
                item.name === 'logout'
                  ? 'text-red-500'
                  : 'text-gray-900 dark:text-white'
              "
              >{{ item.title }}</span
            >
          </div>
          <i class="fas fa-chevron-right text-gray-300 dark:text-gray-600"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { toast } from "@/utils/toast";
import LogoutDialog from "@/components/common/LogoutDialog.vue";

const router = useRouter();
const authStore = useAuthStore();

// 退出登录弹窗状态
const showLogoutDialog = ref(false);

const settingsOptions = ref([
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

const handleOptionClick = (option: string) => {
  switch (option) {
    case "help":
      router.push("/main/profile/help");
      break;
    case "about":
      router.push("/main/profile/about");
      break;
    case "logout":
      showLogoutDialog.value = true;
      break;
  }
};

// 确认退出登录
const handleLogoutConfirm = async () => {
  try {
    await authStore.logout();
    toast.success("已退出登录");
    router.push("/auth/login");
  } catch (error) {
    console.error("退出登录失败:", error);
    toast.error("退出登录失败，请重试");
  }
};

// 取消退出登录
const handleLogoutCancel = () => {
  console.log("用户取消退出登录");
};
</script>

<style scoped>
.menu-item {
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.02);
}
</style>
