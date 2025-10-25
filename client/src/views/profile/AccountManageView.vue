<template>
  <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          账户管理
        </h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Profile Info -->
    <div class="bg-white dark:bg-gray-800 mt-2 px-4 py-4 transition-colors">
      <!-- Avatar -->
      <div
        class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
      >
        <span class="text-gray-700 dark:text-gray-300">头像</span>
        <div class="flex items-center">
          <img
            :src="userInfo.avatar || defaultAvatar"
            alt="头像"
            class="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            @click="showAvatarModal = true"
          />
        </div>
      </div>

      <!-- Nickname -->
      <div
        class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
      >
        <span class="text-gray-700 dark:text-gray-300">昵称</span>
        <div class="flex items-center space-x-3">
          <span class="text-gray-900 dark:text-white">{{
            userInfo.nickname || userInfo.username
          }}</span>
          <button
            @click="showNicknameEdit = true"
            class="text-blue-600 text-sm"
          >
            修改
          </button>
        </div>
      </div>

      <!-- Username -->
      <div class="flex items-center justify-between py-3">
        <span class="text-gray-700 dark:text-gray-300">用户名</span>
        <span class="text-gray-500 dark:text-gray-400">{{
          userInfo.username
        }}</span>
      </div>
    </div>

    <!-- Security -->
    <div class="bg-white dark:bg-gray-800 mt-2 px-4 py-4 transition-colors">
      <div class="flex items-center justify-between py-3">
        <div>
          <div class="text-gray-700 dark:text-gray-300">修改密码</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            定期修改密码保护账号安全
          </div>
        </div>
        <button
          @click="showPasswordChange = true"
          class="text-blue-600 text-sm"
        >
          修改
        </button>
      </div>
    </div>

    <!-- Nickname Edit Dialog -->
    <div
      v-if="showNicknameEdit"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showNicknameEdit = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 mx-4 transition-colors"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            修改昵称
          </h3>
        </div>
        <div class="px-6 py-4">
          <input
            v-model="nicknameForm.nickname"
            type="text"
            placeholder="请输入新昵称"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="20"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ nicknameForm.nickname.length }}/20
          </p>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3"
        >
          <button
            @click="showNicknameEdit = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="updateNickname"
            :disabled="!nicknameForm.nickname.trim() || updating"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ updating ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Avatar Modal - 抖音风格 -->
    <div
      v-if="showAvatarModal"
      class="fixed inset-0 z-50 bg-black"
      @click="closeAvatarModal"
    >
      <!-- 关闭按钮 -->
      <button
        @click="closeAvatarModal"
        class="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center"
      >
        <i class="fas fa-times text-white text-2xl"></i>
      </button>

      <!-- 头像展示区域 -->
      <div class="flex items-center justify-center h-full px-4" @click.stop>
        <img
          :src="avatarPreview || userInfo.avatar || defaultAvatar"
          alt="头像"
          class="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
      </div>

      <!-- 底部操作栏 -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pb-8 pt-20"
        @click.stop
      >
        <div class="px-6 space-y-3">
          <!-- 更换头像按钮 -->
          <button
            @click="$refs.avatarInput.click()"
            class="w-full flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white py-4 rounded-xl hover:bg-white/20 transition-colors"
          >
            <i class="fas fa-edit text-xl"></i>
            <span class="text-base font-medium">更换头像</span>
          </button>

          <!-- 保存头像按钮 -->
          <button
            v-if="avatarFile"
            @click="updateAvatar"
            :disabled="updating"
            class="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <i class="fas fa-check text-xl"></i>
            <span class="text-base font-medium">{{
              updating ? "保存中..." : "保存头像"
            }}</span>
          </button>
        </div>
      </div>

      <!-- 隐藏的文件选择器 -->
      <input
        ref="avatarInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleAvatarSelect"
      />
    </div>

    <!-- Password Change Dialog -->
    <div
      v-if="showPasswordChange"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showPasswordChange = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 mx-4 transition-colors"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            修改密码
          </h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2"
              >旧密码</label
            >
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入旧密码"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2"
              >新密码</label
            >
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2"
              >确认新密码</label
            >
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
          </div>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3"
        >
          <button
            @click="
              showPasswordChange = false;
              resetPasswordForm();
            "
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="updatePassword"
            :disabled="!isPasswordFormValid || updating"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ updating ? "修改中..." : "确定" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  updateUserProfile,
  updateUserPassword,
  uploadAvatar,
} from "@/api/user";
import { toast } from "@/utils/toast";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const defaultAvatar =
  "https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg";

const userInfo = ref({
  id: 0,
  username: "",
  nickname: "",
  avatar: "",
});

const showNicknameEdit = ref(false);
const showAvatarModal = ref(false);
const showPasswordChange = ref(false);
const updating = ref(false);

const nicknameForm = ref({
  nickname: "",
});

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.oldPassword.trim() &&
    passwordForm.value.newPassword.trim().length >= 6 &&
    passwordForm.value.newPassword.trim().length <= 20 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  );
});

onMounted(() => {
  loadUserInfo();
});

const loadUserInfo = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    userInfo.value = {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      avatar: user.avatar_url || user.avatar || "",
    };
    nicknameForm.value.nickname = userInfo.value.nickname;
  }
};

const updateNickname = async () => {
  if (!nicknameForm.value.nickname.trim()) {
    toast.error("请输入昵称");
    return;
  }

  updating.value = true;
  try {
    const response = await updateUserProfile({
      nickname: nicknameForm.value.nickname.trim(),
    });

    if (response.data.success) {
      userInfo.value.nickname = nicknameForm.value.nickname.trim();

      // 更新 localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.nickname = nicknameForm.value.nickname.trim();
        localStorage.setItem("user", JSON.stringify(user));
      }

      // 更新 authStore，这样其他页面会自动同步
      if (authStore.user) {
        authStore.user.nickname = nicknameForm.value.nickname.trim();
      }

      toast.success("昵称修改成功");
      showNicknameEdit.value = false;
    } else {
      toast.error(response.data.message || "修改失败");
    }
  } catch (error: any) {
    console.error("修改昵称失败:", error);
    toast.error(error.response?.data?.message || "修改失败，请重试");
  } finally {
    updating.value = false;
  }
};

const handleAvatarSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 检查文件类型
  if (!file.type.startsWith("image/")) {
    toast.error("请选择图片文件");
    // 重置文件选择器
    target.value = "";
    return;
  }

  // 检查文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    toast.error("图片大小不能超过 2MB");
    // 重置文件选择器
    target.value = "";
    return;
  }

  avatarFile.value = file;

  // 预览
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // 重置文件选择器，允许重复选择同一文件
  target.value = "";
};

const closeAvatarModal = () => {
  showAvatarModal.value = false;
  avatarPreview.value = null;
  avatarFile.value = null;
};

const updateAvatar = async () => {
  if (!avatarFile.value) {
    toast.error("请先选择图片");
    return;
  }

  updating.value = true;
  try {
    const response = await uploadAvatar(avatarFile.value);

    if (response.data.success) {
      const avatarUrl = response.data.data.url;

      // 立即更新本地显示的头像
      userInfo.value.avatar = avatarUrl;

      // 更新 localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.avatar = avatarUrl;
        user.avatar_url = avatarUrl; // 同时更新 avatar_url 字段
        localStorage.setItem("user", JSON.stringify(user));
      }

      // 更新 authStore，这样其他页面会自动同步
      if (authStore.user) {
        authStore.user.avatar_url = avatarUrl;
      }

      toast.success("头像更新成功");

      // 延迟关闭弹窗，让用户看到成功提示
      setTimeout(() => {
        closeAvatarModal();
      }, 500);
    } else {
      toast.error(response.data.message || "上传失败");
    }
  } catch (error: any) {
    console.error("上传头像失败:", error);
    toast.error(error.response?.data?.message || "上传失败，请重试");
  } finally {
    updating.value = false;
  }
};

const updatePassword = async () => {
  if (!isPasswordFormValid.value) {
    toast.error("请正确填写所有字段");
    return;
  }

  if (
    passwordForm.value.newPassword.length < 6 ||
    passwordForm.value.newPassword.length > 20
  ) {
    toast.error("新密码长度应为 6-20 位");
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error("两次输入的新密码不一致");
    return;
  }

  updating.value = true;
  try {
    const response = await updateUserPassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    if (response.data.success) {
      toast.success("密码修改成功，请重新登录");
      showPasswordChange.value = false;
      resetPasswordForm();

      // 清除登录信息，跳转到登录页
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }, 1500);
    } else {
      toast.error(response.data.message || "修改失败");
    }
  } catch (error: any) {
    console.error("修改密码失败:", error);
    toast.error(error.response?.data?.message || "修改失败，请重试");
  } finally {
    updating.value = false;
  }
};

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};
</script>
