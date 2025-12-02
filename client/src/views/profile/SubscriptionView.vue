<template>
  <div class="bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto transition-colors">
    <!-- Header -->
    <div class="bg-blue-600 px-4 py-5 text-white">
      <div class="flex items-center space-x-3">
        <button @click="goBack" class="p-2 rounded-full hover:bg-blue-500 transition-colors">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h1 class="text-xl font-bold">订阅套餐</h1>
      </div>
    </div>

    <!-- Current Plan -->
    <div class="px-4 py-5">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-medium text-gray-900 dark:text-white">当前套餐</h2>
          <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="currentPlanBadgeClass">
            {{ currentPlan.description }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">AI使用次数</div>
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentPlan.hourly }}次/小时 · {{ currentPlan.daily }}次/天
          </div>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <div class="px-4 py-2">
      <h2 class="text-base font-medium text-gray-900 dark:text-white mb-4">选择套餐</h2>
      
      <div class="space-y-4">
        <div
          v-for="plan in plans"
          :key="plan.tier"
          @click="selectPlan(plan)"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all cursor-pointer hover:shadow-md"
          :class="{
            'border-blue-500 ring-2 ring-blue-200': selectedPlan.tier === plan.tier,
            'border-gray-100 dark:border-gray-700': selectedPlan.tier !== plan.tier
          }"
        >
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ plan.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ plan.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ plan.price }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ plan.billingCycle }}</div>
              </div>
            </div>
            
            <!-- Features -->
            <div class="space-y-2 mb-4">
              <div v-for="feature in plan.features" :key="feature" class="flex items-center space-x-2">
                <i class="fas fa-check text-xs text-green-500"></i>
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ feature }}</span>
              </div>
            </div>
            
            <!-- AI Usage Limits -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <div class="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">AI使用次数</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center space-x-1">
                  <i class="fas fa-clock text-xs text-blue-600 dark:text-blue-400"></i>
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ plan.hourly }}次/小时</span>
                </div>
                <div class="flex items-center space-x-1">
                  <i class="fas fa-calendar-day text-xs text-blue-600 dark:text-blue-400"></i>
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ plan.daily }}次/天</span>
                </div>
              </div>
            </div>
            
            <!-- Action Button -->
            <button
              @click="selectedPlan.tier === plan.tier ? subscribe() : selectPlan(plan)"
              class="w-full py-2 rounded-lg font-medium transition-colors"
              :class="{
                'bg-blue-600 text-white hover:bg-blue-700': selectedPlan.tier === plan.tier,
                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600': selectedPlan.tier !== plan.tier
              }"
            >
              {{ selectedPlan.tier === plan.tier ? '立即订阅' : '选择套餐' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Benefits -->
    <div class="px-4 py-5">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
        <h2 class="text-base font-medium text-gray-900 dark:text-white mb-3">会员特权</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i class="fas fa-bolt text-blue-600 dark:text-blue-400 text-xs"></i>
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">优先处理</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i class="fas fa-lock text-blue-600 dark:text-blue-400 text-xs"></i>
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">数据加密</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i class="fas fa-headset text-blue-600 dark:text-blue-400 text-xs"></i>
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">专属客服</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i class="fas fa-rocket text-blue-600 dark:text-blue-400 text-xs"></i>
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">新功能优先体验</span>
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
import { updateUserSubscription } from "@/api/user";

const router = useRouter();
const authStore = useAuthStore();

// 套餐数据
const plans = ref([
  {
    tier: 'free',
    name: '免费套餐',
    description: '适合偶尔使用的用户',
    price: '¥0',
    billingCycle: '永久免费',
    hourly: 10,
    daily: 50,
    features: [
      '基础AI功能',
      '有限次数使用',
      '标准响应速度',
      '1GB存储空间'
    ]
  },
  {
    tier: 'basic',
    name: '基础会员',
    description: '适合经常使用的用户',
    price: '¥19',
    billingCycle: '每月',
    hourly: 30,
    daily: 200,
    features: [
      '高级AI功能',
      '更多使用次数',
      '优先响应速度',
      '5GB存储空间',
      '数据备份'
    ]
  },
  {
    tier: 'pro',
    name: '专业会员',
    description: '适合重度使用的用户',
    price: '¥59',
    billingCycle: '每月',
    hourly: 100,
    daily: 1000,
    features: [
      '全部AI功能',
      '大量使用次数',
      '极速响应速度',
      '20GB存储空间',
      '数据备份与恢复',
      '专属客服'
    ]
  },
  {
    tier: 'enterprise',
    name: '企业会员',
    description: '适合团队和企业用户',
    price: '¥199',
    billingCycle: '每月',
    hourly: '无限制',
    daily: '无限制',
    features: [
      '全部AI功能',
      '无限制使用次数',
      '专属服务器',
      '100GB存储空间',
      '团队协作',
      '定制化服务',
      '24/7技术支持'
    ]
  }
]);

// 当前选择的套餐
const selectedPlan = ref(plans.value[0]);

// 当前用户套餐
const currentPlan = computed(() => {
  const user = authStore.user;
  const tier = user?.tier || 'free';
  const plan = plans.value.find(p => p.tier === tier) || plans.value[0];
  return plan;
});

// 当前套餐徽章样式
const currentPlanBadgeClass = computed(() => {
  const tier = currentPlan.value.tier;
  switch (tier) {
    case 'free':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    case 'basic':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pro':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'enterprise':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }
});

// 选择套餐
const selectPlan = (plan: any) => {
  selectedPlan.value = plan;
};

// 订阅套餐
const subscribe = async () => {
  try {
    // 调用API更新用户订阅
    await updateUserSubscription(selectedPlan.value.tier);
    
    // 更新本地用户信息
    authStore.user = {
      ...authStore.user,
      tier: selectedPlan.value.tier,
      is_subscribed: selectedPlan.value.tier !== 'free',
      subscription_expiry: selectedPlan.value.tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    };
    
    toast.success('订阅成功！');
    router.push('/main/profile');
  } catch (error) {
    console.error('订阅失败:', error);
    toast.error('订阅失败，请稍后重试');
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  // 设置当前用户的套餐为默认选择
  const user = authStore.user;
  if (user) {
    const userPlan = plans.value.find(p => p.tier === user.tier);
    if (userPlan) {
      selectedPlan.value = userPlan;
    }
  }
});
</script>

<style scoped>
/* 保持与项目风格一致的样式 */
</style>