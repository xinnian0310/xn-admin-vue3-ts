<template>
  <el-aside v-show="visible" :width="width" class="layout-aside">
    <div v-if="showLogo" class="layout-aside__logo">
      <AppBrandLogo />
      <span>{{ title }}</span>
    </div>
    <div v-else-if="subtitle" class="layout-aside__subtitle">{{ subtitle }}</div>
    <el-scrollbar class="layout-aside__scroll">
      <SidebarMenu :menus="menus" />
    </el-scrollbar>
  </el-aside>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/menu'
import AppBrandLogo from '@/components/AppBrandLogo/AppBrandLogo.vue'
import SidebarMenu from '@/components/SidebarMenu/SidebarMenu.vue'
import { appConfig } from '@/config/app'

withDefaults(
  defineProps<{
    visible?: boolean
    width?: string
    title?: string
    /** 是否显示 Logo 区；mix 侧栏可关掉，改用 subtitle */
    showLogo?: boolean
    subtitle?: string
    menus?: MenuItem[]
  }>(),
  {
    visible: true,
    width: '220px',
    title: appConfig.app.name,
    showLogo: true,
  },
)
</script>

<style scoped>
.layout-aside {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-sidebar-bg);
  border-right: 1px solid var(--app-sidebar-border);
  overflow: hidden;
  font-size: var(--app-font-size-sidebar);
}

.layout-aside :deep(.el-menu),
.layout-aside :deep(.el-menu-item),
.layout-aside :deep(.el-sub-menu__title) {
  font-size: inherit;
}

.layout-aside__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  margin: 8px 10px 4px;
  padding: 0 12px;
  color: var(--app-sidebar-text-active);
  font-size: var(--app-font-size-main);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.layout-aside__subtitle {
  flex-shrink: 0;
  height: 48px;
  margin: 4px 10px 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  color: var(--app-sidebar-text-active);
  font-size: var(--app-font-size-main);
  font-weight: 600;
  border-bottom: 1px solid var(--app-sidebar-border);
}

.layout-aside__scroll {
  flex: 1;
  min-height: 0;
}

/* 细滚动条，颜色跟随侧栏文字，避免原生灰条 */
.layout-aside__scroll :deep(.el-scrollbar__bar) {
  z-index: 2;
}

.layout-aside__scroll :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
  right: 2px;
}

.layout-aside__scroll :deep(.el-scrollbar__bar.is-horizontal) {
  height: 4px;
  bottom: 2px;
}

.layout-aside__scroll :deep(.el-scrollbar__thumb) {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-sidebar-text) 42%, transparent);
  opacity: 1;
}

.layout-aside__scroll :deep(.el-scrollbar__thumb:hover) {
  background: color-mix(in srgb, var(--app-sidebar-text) 62%, transparent);
}
</style>
