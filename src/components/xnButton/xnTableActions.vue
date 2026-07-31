<template>
  <div v-if="visibleList.length" class="xn-table-actions">
    <el-button
      v-for="item in visibleList"
      :key="item.action || item.name"
      link
      :type="item.typeColor && item.typeColor !== 'default' ? item.typeColor : 'primary'"
      :disabled="isDisabled(item)"
      @click="emitAction(item)"
    >
      {{ item.name }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '@/directives/permission'
import type { ButtonListItem } from '@/types/button'

defineOptions({ name: 'xnTableActions' })

const props = withDefaults(
  defineProps<{
    /** 表格操作列按钮，由 usePageUi 的 tableButtonItems 提供（纯文本，不带图标） */
    items?: ButtonListItem[]
    /** 当前行数据 */
    row?: Record<string, any>
    /**
     * 逐行禁用判定：返回 true 或提示字符串表示禁用。
     * 由各页面按业务规则(如内置行、admin 行)传入。
     */
    disabled?: (action: string, row: Record<string, any>) => boolean | string
  }>(),
  {
    items: () => [],
    row: () => ({}),
  },
)

const emit = defineEmits<{
  actionClick: [payload: { action: string; row: Record<string, any> }]
}>()

const { hasPermission } = usePermission()

const visibleList = computed(() =>
  props.items.filter((item) => !item.permission || hasPermission(item.permission)),
)

function actionOf(item: ButtonListItem) {
  return item.action || item.name
}

function isDisabled(item: ButtonListItem) {
  if (item.disabled) return true
  if (!props.disabled) return false
  const result = props.disabled(actionOf(item), props.row)
  return result === true || typeof result === 'string'
}

function emitAction(item: ButtonListItem) {
  emit('actionClick', { action: actionOf(item), row: props.row })
}
</script>

<style scoped>
.xn-table-actions {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
</style>
