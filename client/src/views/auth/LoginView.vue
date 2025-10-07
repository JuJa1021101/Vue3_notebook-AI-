<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="gradient-bg px-4 py-12 text-white text-center">
      <div class="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-2xl shadow-lg">
        <img src="/logo.png" alt="智本集" class="w-full h-full object-cover" />
      </div>
      <h1 class="text-2xl font-bold mb-2">智本集</h1>
      <p class="text-white/80">记录生活，分享思考</p>
    </div>

    <!-- Login Form -->
    <div class="px-4 py-8">
      <div
        class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 -mt-8 relative z-10"
      >
        <h2 class="text-xl font-bold text-gray-900 mb-6 text-center">
          欢迎回来
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username/Email -->
          <div class="input-group relative">
            <input
              type="text"
              id="username"
              v-model="loginForm.username"
              placeholder=" "
              class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <label
              for="username"
              class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              用户名或邮箱
            </label>
          </div>

          <!-- Password -->
          <div class="input-group relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="loginForm.password"
              placeholder=" "
              class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 pr-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <label
              for="password"
              class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              密码
            </label>
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="loginForm.remember"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-600">记住我</span>
            </label>
            <button type="button" class="text-sm text-blue-600">
              忘记密码？
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ loading ? "登录中..." : "登录" }}
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="px-4 text-sm text-gray-500">或</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- Social Login -->
        <div class="grid grid-cols-3 gap-3">
          <button
            class="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-weixin text-green-500 text-xl"></i>
          </button>
          <button
            class="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-qq text-blue-500 text-xl"></i>
          </button>
          <button
            class="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-weibo text-red-500 text-xl"></i>
          </button>
        </div>

        <!-- Register Link -->
        <div class="text-center mt-6">
          <span class="text-sm text-gray-600">还没有账户？</span>
          <button
            type="button"
            @click="$router.push('/auth/register')"
            class="text-sm text-blue-600 font-medium ml-1"
          >
            立即注册
          </button>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="px-4 py-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">
        为什么选择我们
      </h3>
      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <i class="fas fa-cloud text-blue-600"></i>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">云端同步</h4>
            <p class="text-sm text-gray-500">多设备实时同步，数据永不丢失</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
          >
            <i class="fas fa-shield-alt text-green-600"></i>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">安全可靠</h4>
            <p class="text-sm text-gray-500">端到端加密，保护隐私安全</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
          >
            <i class="fas fa-magic text-purple-600"></i>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">智能整理</h4>
            <p class="text-sm text-gray-500">AI助手帮你整理和分类笔记</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { toast } from "../../utils/toast";

const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({
  username: "",
  password: "",
  remember: false,
});

const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    toast.error("请填写用户名和密码");
    return;
  }

  loading.value = true;

  try {
    // 使用 auth store 登录
    await authStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    });

    toast.success("登录成功！");

    // 登录成功，跳转到主页
    router.push("/main/home");
  } catch (error: any) {
    console.error("登录失败:", error);
    toast.error(error.message || "登录失败，请检查用户名和密码");
  } finally {
    loading.value = false;
  }
};
</script>