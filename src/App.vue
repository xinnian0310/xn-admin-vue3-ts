<template>
  <el-config-provider v-bind="elementPlusConfig">
    <router-view />
    <!-- 全局主题弹窗：任意页面可通过 themeStore.openDialog() 打开 -->
    <ThemeDialog />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { appConfig, getElementPlusProviderProps } from '@/config/app'
import ThemeDialog from '@/components/ThemePicker/ThemeDialog.vue'

const elementPlusConfig = computed(() => getElementPlusProviderProps(appConfig))
</script>
