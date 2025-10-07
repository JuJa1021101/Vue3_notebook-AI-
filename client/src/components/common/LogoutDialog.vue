<template>
  <ConfirmDialog
    :model-value="modelValue"
    title="退出登录"
    message="确定要退出当前账号吗？"
    confirm-text="确定退出"
    type="danger"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>

<script setup lang="ts">
import ConfirmDialog from "./ConfirmDialog.vue";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
