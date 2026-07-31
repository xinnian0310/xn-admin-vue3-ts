<template>
  <div class="page-card" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">SQL 监控</h2>
      <div class="sql-actions">
        <el-tag effect="light" round>累计 {{ data?.queryCount ?? 0 }} 条</el-tag>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="danger" @click="handleClean">清空缓冲</el-button>
      </div>
    </div>

    <el-table :data="data?.records || []" border stripe max-height="620">
      <el-table-column type="index" label="#" width="55" align="center" />
      <el-table-column prop="executedAt" label="执行时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.executedAt) }}</template>
      </el-table-column>
      <el-table-column prop="durationMs" label="耗时(ms)" width="100" align="center">
        <template #default="{ row }">{{ row.durationMs ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="sql" label="SQL" min-width="420" show-overflow-tooltip />
      <template #empty>
        <el-empty description="暂无 SQL 记录" :image-size="90" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cleanSqlMonitor, getSqlMonitor } from '@/api/monitor'
import type { SqlMonitor } from '@/types'
import { formatDateTime } from '@/utils/datetime'

defineOptions({ name: 'MonitorSql' })

const loading = ref(false)
const data = ref<SqlMonitor | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  loading.value = true
  try {
    const res = await getSqlMonitor()
    data.value = res.data
  } finally {
    loading.value = false
  }
}

async function handleClean() {
  await ElMessageBox.confirm('确定清空 SQL 监控缓冲吗？', '清空确认', { type: 'warning' })
  await cleanSqlMonitor()
  ElMessage.success('已清空')
  load()
}

onMounted(() => {
  load()
  timer = setInterval(load, 10000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.sql-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
