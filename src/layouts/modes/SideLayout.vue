<template>
  <!-- 经典左侧菜单布局 -->
  <el-container class="layout-side">
    <LayoutAside :visible="!isFullscreen" />

    <el-container class="layout-side__main">
      <LayoutHeader :visible="!isFullscreen" />
      <TagsView v-show="!isFullscreen" />
      <LayoutContent />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import TagsView from '@/components/TagsView/TagsView.vue'
import LayoutAside from '../components/LayoutAside.vue'
import LayoutHeader from '../components/LayoutHeader.vue'
import LayoutContent from '../components/LayoutContent.vue'

defineProps<{
  isFullscreen: boolean
}>()
</script>

<style scoped>
.layout-side {
  height: 100%;
}

.layout-side__main {
  flex-direction: column;
  min-width: 0;
}
</style>
