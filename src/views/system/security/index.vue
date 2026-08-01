<template>
  <PageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    :loading="loading"
    @page-change="applyLocalPage"
  >
    <template #aside>
      <TreePanel title="登录防护" width="360px" :filterable="false">
        <el-form :model="form" label-width="140px" class="security-aside-form" @submit.prevent>
          <el-form-item label="失败锁定阈值">
            <el-input-number v-model="form.maxFailures" :min="1" :max="50" controls-position="right" />
            <span class="hint">次</span>
          </el-form-item>
          <el-form-item label="锁定时长">
            <el-input-number v-model="form.lockMinutes" :min="1" :max="1440" controls-position="right" />
            <span class="hint">分钟</span>
          </el-form-item>
          <el-form-item label="IP 每分钟限流">
            <el-input-number
              v-model="form.rateLimitPerMinute"
              :min="1"
              :max="1000"
              controls-position="right"
            />
            <span class="hint">次</span>
          </el-form-item>
          <el-form-item label="验证码有效期">
            <el-input-number
              v-model="form.captchaTtlSeconds"
              :min="30"
              :max="600"
              controls-position="right"
            />
            <span class="hint">秒</span>
          </el-form-item>
          <el-form-item v-if="form.updatedAt" label="最近更新">
            <span class="muted">{{ form.updatedAt }}</span>
          </el-form-item>
          <p class="security-aside-tip">
            保存后立即生效。图形/滑块验证码开关请在「登录页设置」中配置。
          </p>
        </el-form>
      </TreePanel>
    </template>

    <template #search>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>

    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:security-policy"
        entity-name="锁定账号"
        name-field="username"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
      >
        <template #remainSeconds="{ row }">
          {{ formatRemain(row.remainSeconds) }}
        </template>
        <template #actions="{ row }">
          <xnTableActions
            :items="tableButtonItems"
            :row="row"
            :disabled="(action) => action === 'unlock' && unlocking === String(row.username)"
            @action-click="onTableAction"
          />
        </template>
      </xnTable>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageLayout from '@/components/PageLayout/PageLayout.vue'
import TreePanel from '@/components/TreePanel/TreePanel.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import {
  getSecurityPolicy,
  listLockedAccounts,
  unlockAccount,
  updateSecurityPolicy,
  type LockedAccount,
} from '@/api/security-policy'
import type { TableColumnItem } from '@/types/table'

defineOptions({ name: 'SystemSecurity' })

/** 权限内容：security-policy:refresh / update（搜索位）；table-unlock（表格） */
const { buttonItems, tableButtonItems } = usePageUi('/system/security')

const loading = ref(false)
const unlocking = ref('')
const allData = ref<LockedAccount[]>([])
const tableData = ref<LockedAccount[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const selected = ref<LockedAccount[]>([])

const form = reactive({
  maxFailures: 5,
  lockMinutes: 15,
  rateLimitPerMinute: 30,
  captchaTtlSeconds: 120,
  updatedAt: '' as string | null,
})

const columns: TableColumnItem[] = [
  { prop: 'username', label: '用户名', minWidth: 160 },
  { type: 'slot', slot: 'remainSeconds', prop: 'remainSeconds', label: '剩余时间', width: 120 },
  { type: 'slot', slot: 'actions', label: '操作', width: 100, fixed: 'right' },
]

function formatRemain(sec: number) {
  if (sec >= 60) return `${Math.ceil(sec / 60)} 分钟`
  return `${sec} 秒`
}

function selectionChangeHandle(rows: unknown[]) {
  selected.value = rows as LockedAccount[]
}

function applyLocalPage() {
  total.value = allData.value.length
  const start = (page.value - 1) * size.value
  tableData.value = allData.value.slice(start, start + size.value)
}

async function loadPolicy() {
  const res = await getSecurityPolicy()
  const data = res.data
  form.maxFailures = data.maxFailures
  form.lockMinutes = data.lockMinutes
  form.rateLimitPerMinute = data.rateLimitPerMinute
  form.captchaTtlSeconds = data.captchaTtlSeconds
  form.updatedAt = data.updatedAt || ''
}

async function loadLocks() {
  const res = await listLockedAccounts()
  allData.value = res.data || []
  applyLocalPage()
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([loadPolicy(), loadLocks()])
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  const res = await updateSecurityPolicy({
    maxFailures: form.maxFailures,
    lockMinutes: form.lockMinutes,
    rateLimitPerMinute: form.rateLimitPerMinute,
    captchaTtlSeconds: form.captchaTtlSeconds,
  })
  form.updatedAt = res.data.updatedAt || form.updatedAt
  ElMessage.success('保存成功，已立即生效')
}

async function buttonClick(action: string) {
  if (action === 'refresh' || action === 'view') await loadData()
  else if (action === 'edit' || action === 'update' || action === 'save') await handleSave()
}

function onTableAction(payload: { action: string; row: Record<string, unknown> }) {
  if (payload.action === 'unlock') handleUnlock(String(payload.row.username ?? ''))
}

async function handleUnlock(username: string) {
  if (!username) return
  await ElMessageBox.confirm(`确定解锁账号「${username}」？`, '解锁确认', { type: 'warning' })
  unlocking.value = username
  try {
    await unlockAccount(username)
    ElMessage.success('已解锁')
    await loadLocks()
  } finally {
    unlocking.value = ''
  }
}

onMounted(loadData)
</script>

<style scoped>
.security-aside-form {
  padding: 12px 8px 8px;
}

.security-aside-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.security-aside-form :deep(.el-input-number) {
  width: 140px;
}

.hint {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.security-aside-tip {
  margin: 8px 0 0;
  padding: 0 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}
</style>
