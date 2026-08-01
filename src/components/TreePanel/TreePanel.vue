<template>
  <div class="tree-panel" :style="panelStyle">
    <div v-if="title || $slots.title" class="tree-panel__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <div v-if="filterable" class="tree-panel__search">
      <el-input
        :model-value="filter"
        :placeholder="filterPlaceholder"
        clearable
        @update:model-value="onFilterUpdate"
      />
    </div>

    <el-scrollbar class="tree-panel__scroll">
      <slot>
        <el-tree
          v-if="data"
          ref="treeRef"
          :data="data"
          :node-key="nodeKey"
          :props="treeProps"
          :default-expand-all="defaultExpandAll"
          :highlight-current="highlightCurrent"
          :expand-on-click-node="expandOnClickNode"
          :filter-node-method="resolvedFilterMethod"
          :current-node-key="currentKey"
          class="tree-panel__tree"
          @node-click="onNodeClick"
        >
          <template v-if="$slots.node" #default="scope">
            <slot name="node" v-bind="scope" />
          </template>
        </el-tree>
      </slot>
    </el-scrollbar>

    <div v-if="$slots.footer" class="tree-panel__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ElTree } from 'element-plus'

defineOptions({ name: 'TreePanel' })

const props = withDefaults(
  defineProps<{
    title?: string
    width?: string | number
    /** 搜索关键字（受控） */
    filter?: string
    filterable?: boolean
    filterPlaceholder?: string
    /** 传入则渲染内置 el-tree；否则用默认插槽自定义内容 */
    data?: any[]
    nodeKey?: string
    treeProps?: { label?: string; children?: string; disabled?: string }
    defaultExpandAll?: boolean
    highlightCurrent?: boolean
    expandOnClickNode?: boolean
    currentKey?: string | number
    filterNodeMethod?: (value: string, data: any) => boolean
  }>(),
  {
    width: '260px',
    filter: '',
    filterable: true,
    filterPlaceholder: '搜索',
    nodeKey: 'id',
    treeProps: () => ({ label: 'label', children: 'children' }),
    defaultExpandAll: true,
    highlightCurrent: true,
    expandOnClickNode: false,
  },
)

const emit = defineEmits<{
  'update:filter': [value: string]
  'node-click': [data: any, node: unknown, event: Event]
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()

const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

const resolvedFilterMethod = computed(() => {
  if (props.filterNodeMethod) return props.filterNodeMethod
  const labelKey = props.treeProps?.label || 'label'
  return (value: string, data: any) => {
    if (!value) return true
    const label = data[labelKey]
    return String(label ?? '').toLowerCase().includes(value.toLowerCase())
  }
})

function onFilterUpdate(value: string) {
  emit('update:filter', value)
}

function onNodeClick(data: any, node: unknown, event: Event) {
  const disabledKey = props.treeProps?.disabled || 'disabled'
  if (data?.[disabledKey]) return
  emit('node-click', data, node, event)
}

function setCurrentKey(key: string | number | null) {
  treeRef.value?.setCurrentKey(key as string | number | undefined)
}

function filterTree(value?: string) {
  treeRef.value?.filter(value ?? props.filter)
}

watch(
  () => props.filter,
  async (value) => {
    await nextTick()
    filterTree(value)
  },
)

watch(
  () => props.currentKey,
  async (key) => {
    await nextTick()
    if (key != null) setCurrentKey(key)
  },
)

defineExpose({
  treeRef,
  setCurrentKey,
  filter: filterTree,
})
</script>

<style scoped>
.tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.tree-panel__title {
  flex-shrink: 0;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: var(--app-text-primary);
}

.tree-panel__search {
  flex-shrink: 0;
}

.tree-panel__scroll {
  flex: 1;
  min-height: 0;
}

.tree-panel__footer {
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.tree-panel__scroll :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
  right: 2px;
}

.tree-panel__scroll :deep(.el-scrollbar__thumb) {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-text-muted) 55%, transparent);
  opacity: 1;
}

.tree-panel__tree {
  background: transparent;
  --el-tree-node-hover-bg-color: rgba(var(--app-color-primary-rgb), 0.12);
  --el-color-primary-light-9: rgba(var(--app-color-primary-rgb), 0.12);
}

.tree-panel__tree :deep(.el-tree-node__content) {
  height: 34px;
  border-radius: 6px;
  color: var(--app-text-primary);
}

.tree-panel__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: rgba(var(--app-color-primary-rgb), 0.18) !important;
  color: var(--app-color-primary);
  font-weight: 600;
}

.tree-panel__tree :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__label) {
  color: var(--app-color-primary);
}
</style>
