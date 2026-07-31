<template>
  <div class="page-card" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">在线用户</h2>
      <div class="online-actions">
        <el-tag type="success" effect="light" round>当前在线 {{ list.length }} 人</el-tag>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table :data="list" border stripe>
      <el-table-column type="index" label="#" width="55" align="center" />
      <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="unitName" label="所属单位" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.unitName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="roles" label="角色" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.roles || '—' }}</template>
      </el-table-column>
      <el-table-column prop="ip" label="客户端 IP" min-width="130" />
      <el-table-column label="连接数" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.sessionCount }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="loginTime" label="登录时间" min-width="170" />
      <el-table-column label="在线时长" min-width="120">
        <template #default="{ row }">{{ formatDuration(row.onlineSeconds) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="110" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleKick(row)">强制下线</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无在线用户" :image-size="90" />
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOnlineUsers, kickUser } from '@/api/monitor'
import type { OnlineUser } from '@/types'

defineOptions({ name: 'MonitorOnline' })

const loading = ref(false)
const list = ref<OnlineUser[]>([])
let timer: ReturnType<typeof setInterval> | null = null

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h} 时 ${m} 分`
  if (m > 0) return `${m} 分 ${s} 秒`
  return `${s} 秒`
}

async function load() {
  loading.value = true
  try {
    const res = await getOnlineUsers()
    list.value = res.data
  } finally {
    loading.value = false
  }
}

async function handleKick(row: OnlineUser) {
  try {
    await ElMessageBox.confirm(
      `确定强制下线用户「${row.nickname || row.username || row.userId}」吗？`,
      '强制下线',
      { type: 'warning' },
    )
  } catch {
    return
  }
  await kickUser(row.userId)
  ElMessage.success('已强制下线')
  load()
}

onMounted(() => {
  load()
  timer = setInterval(load, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.online-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
