<template>
  <div class="section-actions">
    <template v-if="editing">
      <el-button
        v-permission="'system-config:update'"
        type="primary"
        :loading="saving"
        @click="emit('save')"
      >
        保存
      </el-button>
      <el-button :disabled="saving" @click="emit('cancel')">取消</el-button>
    </template>
    <template v-else>
      <el-button v-permission="'system-config:view'" :icon="Refresh" @click="emit('refresh')">
        刷新
      </el-button>
      <el-button
        v-permission="'system-config:update'"
        type="primary"
        :icon="Edit"
        @click="emit('edit')"
      >
        修改
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Edit, Refresh } from '@element-plus/icons-vue'

defineOptions({ name: 'SystemConfigSectionActions' })

defineProps<{
  editing: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit' | 'save' | 'cancel' | 'refresh'): void
}>()
</script>

<style scoped>
.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
