<template>
  <xnPageLayout
    v-model:view-mode="viewMode"
    v-model:page="page"
    v-model:page-size="size"
    :show-pagination="viewMode === 'card'"
    :total="total"
    :loading="viewMode === 'card' ? loading : false"
    @page-change="loadData"
  >
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>

    <template #toolbar>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>

    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:login-settings"
        entity-name="登录页配置"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #background="{ row }">
          <div v-if="row.backgroundUrl" class="bg-thumb">
            <img :src="row.backgroundUrl" alt="背景" />
          </div>
          <span v-else class="muted">默认渐变</span>
        </template>
        <template #position="{ row }">
          <el-tag :type="row.boxX != null && row.boxY != null ? 'success' : 'info'" size="small">
            {{ row.boxX != null && row.boxY != null ? '已设置' : '默认' }}
          </el-tag>
        </template>
        <template #captcha="{ row }">
          <template v-if="row.captchaEnabled">
            <el-tag type="warning" size="small">{{ captchaLabel(row.captchaType) }}</el-tag>
          </template>
          <el-tag v-else type="info" size="small">关闭</el-tag>
        </template>
        <template #actions="{ row }">
          <xnTableActions
            :items="tableButtonItems"
            :row="row"
            :disabled="tableActionDisabled"
            @action-click="onTableAction"
          />
        </template>
      </xnTable>
    </template>

    <template #card>
      <div class="page-card-grid">
        <el-card v-for="row in tableData" :key="row.id" shadow="hover" class="cfg-card">
          <div class="cfg-card__header">
            <div class="cfg-card__name">{{ row.name }}</div>
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用中' : '未启用' }}
            </el-tag>
          </div>
          <div v-if="row.backgroundUrl" class="cfg-card__bg">
            <img :src="row.backgroundUrl" alt="背景" />
          </div>
          <div class="cfg-card__body">
            <div class="cfg-card__row">
              <span class="label">位置</span>
              <span>{{ row.boxX != null && row.boxY != null ? '已设置' : '默认' }}</span>
            </div>
            <div class="cfg-card__row">
              <span class="label">适应</span>
              <span>{{ fitLabel(row.backgroundFit) }}</span>
            </div>
            <div class="cfg-card__row">
              <span class="label">验证</span>
              <span>{{ row.captchaEnabled ? captchaLabel(row.captchaType) : '关闭' }}</span>
            </div>
          </div>
          <div class="cfg-card__footer">
            <xnTableActions
              :items="tableButtonItems"
              :row="row"
              :disabled="tableActionDisabled"
              @action-click="onTableAction"
            />
          </div>
        </el-card>
      </div>
    </template>
  </xnPageLayout>

  <LoginPageSave ref="saveRef" @success="loadData" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import LoginPageSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { list, batchRemove, remove, updateStatus } from '@/api/login-page'
import type { LoginPageConfig } from '@/types'
import { BACKGROUND_FIT_OPTIONS } from '@/types'
import type { SearchForm } from '@/types/search'
import type { SaveMode } from '@/types/save'
import type { TableColumnItem } from '@/types/table'

defineOptions({ name: 'LoginSettings' })

const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/login-settings')

const saveRef = ref<InstanceType<typeof LoginPageSave>>()
const loading = ref(false)
const tableData = ref<LoginPageConfig[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref<SearchForm>({})
const viewMode = ref<'table' | 'card'>('table')
const selected = ref<LoginPageConfig[]>([])

function fitLabel(fit?: string | null) {
  return BACKGROUND_FIT_OPTIONS.find((o) => o.value === fit)?.label ?? '覆盖铺满'
}

const columns: TableColumnItem[] = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'name', label: '配置名称', minWidth: 140 },
  { type: 'slot', slot: 'background', prop: 'backgroundUrl', label: '背景图', width: 120 },
  { type: 'slot', slot: 'position', prop: 'boxX', label: '登录框位置', width: 100 },
  {
    prop: 'backgroundFit',
    label: '适应模式',
    width: 110,
    type: 'tag',
    options: [
      { value: 'COVER', label: '覆盖铺满', type: 'primary' },
      { value: 'CONTAIN', label: '完整适应', type: 'success' },
      { value: 'STRETCH', label: '拉伸填满', type: 'warning' },
      { value: 'CENTER', label: '居中原图', type: 'info' },
    ],
  },
  { type: 'slot', slot: 'captcha', prop: 'captchaEnabled', label: '登录验证', width: 120 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'tag',
    options: [
      { value: 1, label: '启用', type: 'success' },
      { value: 0, label: '未启用', type: 'info' },
    ],
  },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { type: 'slot', slot: 'actions', label: '操作', width: 240, fixed: 'right' },
]

function captchaLabel(type?: string | null) {
  if (type === 'SLIDER') return '滑块验证'
  if (type === 'IMAGE') return '图形验证码'
  return '已开启'
}

function openSave(mode: SaveMode, id?: number) {
  saveRef.value?.open(mode, id)
}

async function loadData() {
  loading.value = true
  try {
    const res = await list({
      page: page.value - 1,
      size: size.value,
      keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
      status: queryForm.value.status as number | string | undefined,
    })
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function inquires(form: SearchForm) {
  queryForm.value = form
  page.value = 1
  loadData()
}

function reset() {
  queryForm.value = {}
  page.value = 1
  loadData()
}

function selectionChangeHandle(rows: unknown[]) {
  selected.value = rows as LoginPageConfig[]
}

function tableActionDisabled(action: string, row: Record<string, unknown>) {
  if (action === 'enable' && row.status === 1) return '已是启用状态'
  if (action === 'disable' && row.status === 0) return '已是未启用状态'
  return false
}

function onTableAction(payload: { action: string; row: Record<string, unknown> }) {
  const row = payload.row as unknown as LoginPageConfig
  switch (payload.action) {
    case 'edit':
      openSave('edit', row.id)
      break
    case 'view':
      openSave('view', row.id)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'enable':
      handleStatus(row, 1)
      break
    case 'disable':
      handleStatus(row, 0)
      break
  }
}

function buttonClick(action: string) {
  if (action === 'add') {
    openSave('add')
    return
  }
  if (action === 'edit') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一项操作')
      return
    }
    openSave('edit', selected.value[0].id)
    return
  }
  if (action === 'view') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一项操作')
      return
    }
    openSave('view', selected.value[0].id)
    return
  }
  if (action === 'delete') {
    handleBatchDelete()
  }
}

async function handleStatus(row: LoginPageConfig, status: number) {
  if (status === 1) {
    await ElMessageBox.confirm(
      `启用「${row.name}」后，其它登录页配置将自动停用，是否继续？`,
      '启用确认',
      { type: 'warning', confirmButtonText: '启用', cancelButtonText: '取消' },
    )
  }
  await updateStatus(row.id, status)
  ElMessage.success(status === 1 ? '已启用' : '已停用')
  loadData()
}

async function handleDelete(row: LoginPageConfig) {
  await ElMessageBox.confirm(`确定删除配置「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await remove(row.id)
  ElMessage.success('删除成功')
  loadData()
}

async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条配置吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.muted {
  color: var(--app-text-muted);
  font-size: 12px;
}

.bg-thumb {
  width: 64px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--app-border-color);
}

.bg-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cfg-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cfg-card__name {
  font-weight: 600;
}

.cfg-card__bg {
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%);
}

.cfg-card__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cfg-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.cfg-card__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.cfg-card__row .label {
  color: var(--app-text-muted);
}

.cfg-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}
</style>
