<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="gradient-bg px-4 py-8 text-white">
      <div class="flex items-center justify-between mb-6">
        <button @click="goBack" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-white text-lg"></i>
        </button>
        <h1 class="text-xl font-bold">创建账户</h1>
        <div class="w-8"></div>
      </div>

      <!-- Progress Steps -->
      <div class="flex items-center justify-center space-x-4 mb-4">
        <div v-for="step in 3" :key="`step-${step}`" class="flex items-center">
          <div
            class="step-indicator w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="{
              active: currentStep === step,
              completed: currentStep > step,
              'bg-white/30': currentStep < step,
            }"
          >
            {{ step }}
          </div>
          <div v-if="step < 3" class="w-8 h-0.5 bg-white/30 ml-4"></div>
        </div>
      </div>
      <p class="text-center text-white/80 text-sm">
        {{ stepDescriptions[currentStep - 1] }}
      </p>
    </div>

    <!-- Registration Form -->
    <div class="px-4 py-6">
      <div
        class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 -mt-4 relative z-10"
      >
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="text-xl font-bold text-gray-900 mb-2">基本信息</h2>
          <p class="text-gray-500 mb-6 text-sm">请填写您的基本信息</p>

          <form @submit.prevent="nextStep" class="space-y-5">
            <!-- Username -->
            <div class="input-group relative">
              <input
                type="text"
                id="username"
                v-model="registerForm.username"
                placeholder=" "
                class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              <label
                for="username"
                class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                用户名
              </label>
              <div class="mt-1 text-xs text-gray-400">
                <i class="fas fa-info-circle mr-1"></i>
                3-20个字符，支持字母、数字、下划线
              </div>
            </div>

            <!-- Email -->
            <div class="input-group relative">
              <input
                type="email"
                id="email"
                v-model="registerForm.email"
                placeholder=" "
                class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              <label
                for="email"
                class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                邮箱地址
              </label>
            </div>

            <!-- Phone -->
            <div class="input-group relative">
              <input
                type="tel"
                id="phone"
                v-model="registerForm.phone"
                placeholder=" "
                class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              <label
                for="phone"
                class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                手机号码（可选）
              </label>
              <div class="mt-1 text-xs text-gray-400">
                <i class="fas fa-info-circle mr-1"></i>
                11位手机号，以1开头
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              下一步
            </button>
          </form>
        </div>

        <!-- Step 2: Password -->
        <div v-if="currentStep === 2" class="step-content">
          <h2 class="text-xl font-bold text-gray-900 mb-2">设置密码</h2>
          <p class="text-gray-500 mb-6 text-sm">请设置一个安全的密码</p>

          <form @submit.prevent="nextStep" class="space-y-5">
            <!-- Password -->
            <div class="input-group relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="registerForm.password"
                @input="checkPasswordStrength"
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
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                ></i>
              </button>
            </div>

            <!-- Password Strength -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">密码强度</span>
                <span class="text-sm" :class="strengthTextClass">{{
                  strengthText
                }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="password-strength" :class="strengthBarClass"></div>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <div class="flex items-center space-x-2">
                  <i
                    :class="
                      passwordChecks.length
                        ? 'fas fa-check text-green-500'
                        : 'fas fa-times text-red-500'
                    "
                  ></i>
                  <span>至少8个字符</span>
                </div>
                <div class="flex items-center space-x-2">
                  <i
                    :class="
                      passwordChecks.upper
                        ? 'fas fa-check text-green-500'
                        : 'fas fa-times text-red-500'
                    "
                  ></i>
                  <span>包含大写字母</span>
                </div>
                <div class="flex items-center space-x-2">
                  <i
                    :class="
                      passwordChecks.number
                        ? 'fas fa-check text-green-500'
                        : 'fas fa-times text-red-500'
                    "
                  ></i>
                  <span>包含数字</span>
                </div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="input-group relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                @input="checkPasswordMatch"
                placeholder=" "
                class="peer w-full border border-gray-300 rounded-xl px-4 pt-6 pb-2 pr-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              <label
                for="confirmPassword"
                class="absolute left-4 top-4 text-gray-500 text-sm pointer-events-none transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                确认密码
              </label>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i
                  :class="
                    showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                  "
                ></i>
              </button>
            </div>
            <div
              v-if="!passwordMatch && registerForm.confirmPassword"
              class="text-xs text-red-500"
            >
              <i class="fas fa-times mr-1"></i>
              密码不匹配
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
              >
                上一步
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                下一步
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Verification -->
        <div v-if="currentStep === 3" class="step-content">
          <h2 class="text-xl font-bold text-gray-900 mb-2">验证邮箱</h2>
          <p class="text-gray-500 mb-6 text-sm">我们已向您的邮箱发送验证码</p>

          <form @submit.prevent="completeRegistration" class="space-y-5">
            <!-- Verification Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >验证码</label
              >
              <div class="flex space-x-2">
                <input
                  v-for="(_, index) in verificationCode"
                  :key="index"
                  type="text"
                  maxlength="1"
                  v-model="verificationCode[index]"
                  @input="handleVerificationInput(index, $event)"
                  @keydown="handleVerificationKeydown(index, $event)"
                  class="verification-input w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <!-- Resend Code -->
            <div class="text-center">
              <span class="text-sm text-gray-500">没有收到验证码？</span>
              <button
                type="button"
                @click="resendCode"
                :disabled="countdown > 0"
                class="text-sm text-blue-600 font-medium ml-1"
                :class="{ 'opacity-50': countdown > 0 }"
              >
                {{ countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送" }}
              </button>
            </div>

            <!-- Terms Agreement -->
            <div class="bg-gray-50 rounded-xl p-4">
              <label class="flex items-start space-x-3">
                <input
                  type="checkbox"
                  v-model="registerForm.agreeTerms"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <span class="text-sm text-gray-600 leading-relaxed">
                  我已阅读并同意
                  <button type="button" class="text-blue-600 underline">
                    《用户协议》
                  </button>
                  和
                  <button type="button" class="text-blue-600 underline">
                    《隐私政策》
                  </button>
                </span>
              </label>
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
              >
                上一步
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ loading ? "注册中..." : "完成注册" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Login Link -->
        <div class="text-center mt-6">
          <span class="text-sm text-gray-600">已有账户？</span>
          <button
            type="button"
            @click="$router.push('/auth/login')"
            class="text-sm text-blue-600 font-medium ml-1"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <i class="fas fa-check text-2xl text-green-600"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">注册成功！</h3>
        <p class="text-sm text-gray-600 mb-6">
          欢迎加入智本集，开始您的记录之旅
        </p>
        <button
          @click="goToApp"
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
        >
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { register } from "@/api/auth";
import { toast } from "@/utils/toast";

const router = useRouter();

const currentStep = ref(1);
const stepDescriptions = ["基本信息", "设置密码", "验证邮箱"];

const registerForm = ref({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const showSuccessModal = ref(false);

const verificationCode = ref(["", "", "", "", "", ""]);
const countdown = ref(0);

// 密码强度检查
const passwordChecks = computed(() => ({
  length: registerForm.value.password.length >= 8,
  upper: /[A-Z]/.test(registerForm.value.password),
  number: /\d/.test(registerForm.value.password),
}));

const passwordStrength = computed(() => {
  const checks = Object.values(passwordChecks.value);
  return checks.filter(Boolean).length;
});

const strengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "弱";
    case 2:
      return "一般";
    case 3:
      return "强";
    default:
      return "弱";
  }
});

const strengthTextClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "text-red-500";
    case 2:
      return "text-yellow-500";
    case 3:
      return "text-green-500";
    default:
      return "text-red-500";
  }
});

const strengthBarClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "strength-weak";
    case 2:
      return "strength-fair";
    case 3:
      return "strength-strong";
    default:
      return "strength-weak";
  }
});

const passwordMatch = computed(() => {
  return registerForm.value.password === registerForm.value.confirmPassword;
});

const checkPasswordStrength = () => {
  // 密码强度检查逻辑已在computed中实现
};

const checkPasswordMatch = () => {
  // 密码匹配检查逻辑已在computed中实现
};

const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++;
    if (currentStep.value === 3) {
      startCountdown();
    }
  }
};

const prevStep = () => {
  currentStep.value--;
};

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 1:
      if (!registerForm.value.username || !registerForm.value.email) {
        toast.error("请填写所有必填信息");
        return false;
      }
      // 验证用户名格式
      const username = registerForm.value.username.trim();
      console.log("验证用户名:", username, "长度:", username.length);
      console.log("正则测试结果:", /^[a-zA-Z0-9_]+$/.test(username));

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        toast.error("用户名只能包含字母、数字和下划线");
        return false;
      }
      if (
        registerForm.value.username.length < 3 ||
        registerForm.value.username.length > 50
      ) {
        toast.error("用户名长度必须在3-50个字符之间");
        return false;
      }
      if (!isValidEmail(registerForm.value.email)) {
        toast.error("请输入有效的邮箱地址");
        return false;
      }
      // 验证手机号格式（如果填写了）
      if (
        registerForm.value.phone &&
        !/^1[3-9]\d{9}$/.test(registerForm.value.phone)
      ) {
        toast.error("请输入有效的手机号码");
        return false;
      }
      return true;

    case 2:
      if (!registerForm.value.password || !registerForm.value.confirmPassword) {
        toast.error("请填写密码");
        return false;
      }
      if (!passwordMatch.value) {
        toast.error("密码不匹配");
        return false;
      }
      if (passwordStrength.value < 3) {
        toast.error("密码强度不够");
        return false;
      }
      return true;

    default:
      return true;
  }
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleVerificationInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (value.length === 1 && index < 5) {
    const nextInput = target.parentElement?.children[
      index + 1
    ] as HTMLInputElement;
    nextInput?.focus();
  }
};

const handleVerificationKeydown = (index: number, event: KeyboardEvent) => {
  if (
    event.key === "Backspace" &&
    !verificationCode.value[index] &&
    index > 0
  ) {
    const prevInput = (event.target as HTMLInputElement).parentElement
      ?.children[index - 1] as HTMLInputElement;
    prevInput?.focus();
  }
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const resendCode = () => {
  toast.success("验证码已重新发送");
  startCountdown();
};

const completeRegistration = async () => {
  // 检查是否同意用户协议
  if (!registerForm.value.agreeTerms) {
    toast.error("请先阅读并同意《用户协议》和《隐私政策》");
    return;
  }

  // 验证验证码是否填写完整（暂时跳过验证，任意6位数字即可）
  const code = verificationCode.value.join("");
  if (code.length !== 6) {
    toast.error("请输入完整的验证码");
    return;
  }

  loading.value = true;

  try {
    // 准备注册数据
    const registerData = {
      username: registerForm.value.username,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
    };

    console.log("发送注册数据:", registerData);

    // 调用注册API
    const response = await register(registerData);

    console.log("注册响应:", response);

    // 保存token和用户信息
    // response.data 是 ApiResponse，response.data.data 包含 { token, user }
    if (response.data && response.data.data && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      showSuccessModal.value = true;
    } else {
      throw new Error("注册响应数据格式错误");
    }
  } catch (error: any) {
    console.error("注册失败:", error);
    console.error("错误详情:", error.response?.data);

    // 显示更详细的错误信息
    let errorMessage = "注册失败，请重试";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.join("\n");
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (currentStep.value > 1) {
    prevStep();
  } else {
    router.back();
  }
};

const goToApp = () => {
  router.push("/main/home");
};
</script>