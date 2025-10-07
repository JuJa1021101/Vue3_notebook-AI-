<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">账户管理</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Profile Info -->
    <div class="bg-white mt-2 px-4 py-4">
      <!-- Avatar -->
      <div
        class="flex items-center justify-between py-3 border-b border-gray-100"
      >
        <span class="text-gray-700">头像</span>
        <div class="flex items-center space-x-3">
          <img
            :src="userInfo.avatar || defaultAvatar"
            alt="头像"
            class="w-12 h-12 rounded-full object-cover"
          />
          <button
            @click="showAvatarUpload = true"
            class="text-blue-600 text-sm"
          >
            更换
          </button>
        </div>
      </div>

      <!-- Nickname -->
      <div
        class="flex items-center justify-between py-3 border-b border-gray-100"
      >
        <span class="text-gray-700">昵称</span>
        <div class="flex items-center space-x-3">
          <span class="text-gray-900">{{
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
        <span class="text-gray-700">用户名</span>
        <span class="text-gray-500">{{ userInfo.username }}</span>
      </div>
    </div>

    <!-- Security -->
    <div class="bg-white mt-2 px-4 py-4">
      <div class="flex items-center justify-between py-3">
        <div>
          <div class="text-gray-700">修改密码</div>
          <div class="text-xs text-gray-500 mt-1">定期修改密码保护账号安全</div>
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
      <div class="bg-white rounded-lg shadow-xl w-80 mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">修改昵称</h3>
        </div>
        <div class="px-6 py-4">
          <input
            v-model="nicknameForm.nickname"
            type="text"
            placeholder="请输入新昵称"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="20"
          />
          <p class="text-xs text-gray-500 mt-2">
            {{ nicknameForm.nickname.length }}/20
          </p>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3"
        >
          <button
            @click="showNicknameEdit = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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

    <!-- Avatar Upload Dialog -->
    <div
      v-if="showAvatarUpload"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showAvatarUpload = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-80 mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">更换头像</h3>
        </div>
        <div class="px-6 py-4">
          <div class="text-center">
            <img
              :src="avatarPreview || userInfo.avatar || defaultAvatar"
              alt="头像预览"
              class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarSelect"
            />
            <button
              @click="$refs.avatarInput.click()"
              class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              选择图片
            </button>
            <p class="text-xs text-gray-500 mt-2">
              支持 JPG、PNG 格式，大小不超过 2MB
            </p>
          </div>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3"
        >
          <button
            @click="
              showAvatarUpload = false;
              avatarPreview = null;
              avatarFile = null;
            "
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            取消
          </button>
          <button
            @click="updateAvatar"
            :disabled="!avatarFile || updating"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ updating ? "上传中..." : "确定" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Change Dialog -->
    <div
      v-if="showPasswordChange"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showPasswordChange = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-80 mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">修改密码</h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-2">旧密码</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入旧密码"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div
          class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3"
        >
          <button
            @click="
              showPasswordChange = false;
              resetPasswordForm();
            "
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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
const defaultAvatar = "https://via.placeholder.com/150/667eea/ffffff?text=User";

const userInfo = ref({
  id: 0,
  username: "",
  nickname: "",
  avatar: "",
});

const showNicknameEdit = ref(false);
const showAvatarUpload = ref(false);
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
      avatar: user.avatar || "",
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
    return;
  }

  // 检查文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    toast.error("图片大小不能超过 2MB");
    return;
  }

  avatarFile.value = file;

  // 预览
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const updateAvatar = async () => {
  if (!avatarFile.value) {
    toast.error("请选择图片");
    return;
  }

  updating.value = true;
  try {
    const response = await uploadAvatar(avatarFile.value);

    if (response.data.success) {
      const avatarUrl = response.data.data.url;
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
      showAvatarUpload.value = false;
      avatarPreview.value = null;
      avatarFile.value = null;
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
