<template>
  <div class="page-card" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">缓存监控</h2>
      <div class="redis-actions">
        <el-tag :type="statusTag" effect="light" round>{{ statusLabel }}</el-tag>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="danger" :disabled="data?.status !== 'ENABLED'" @click="handleFlush">
          清空当前库
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="data?.message"
      :title="data.message"
      :type="data.status === 'ERROR' ? 'error' : 'info'"
      show-icon
      :closable="false"
      class="redis-alert"
    />

    <el-descriptions v-if="data" :column="3" border class="redis-desc">
      <el-descriptions-item label="状态">{{ data.status }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ data.host }}:{{ data.port }}</el-descriptions-item>
      <el-descriptions-item label="Key 数量">{{ data.keyCount ?? '—' }}</el-descriptions-item>
    </el-descriptions>

    <el-table v-if="data?.sampleKeys?.length" :data="keyRows" border stripe class="redis-keys">
      <el-table-column type="index" label="#" width="55" align="center" />
      <el-table-column prop="key" label="Key" min-width="280" show-overflow-tooltip />
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleDeleteKey(row.key)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else-if="data?.status === 'ENABLED'" description="暂无 Key 样本" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteRedisKey, flushRedis, getRedisMonitor } from '@/api/monitor'
import type { RedisMonitor } from '@/types'

defineOptions({ name: 'MonitorRedis' })

const loading = ref(false)
const data = ref<RedisMonitor | null>(null)

const keyRows = computed(() => (data.value?.sampleKeys || []).map((key) => ({ key })))

const statusLabel = computed(() => {
  if (data.value?.status === 'ENABLED') return '已连接'
  if (data.value?.status === 'ERROR') return '连接失败'
  return '未启用'
})

const statusTag = computed(() => {
  if (data.value?.status === 'ENABLED') return 'success'
  if (data.value?.status === 'ERROR') return 'danger'
  return 'info'
})

async function load() {
  loading.value = true
  try {
    const res = await getRedisMonitor()
    data.value = res.data
  } finally {
    loading.value = false
  }
}

async function handleDeleteKey(key: string) {
  await ElMessageBox.confirm(`确定删除 Key「${key}」吗？`, '删除确认', { type: 'warning' })
  await deleteRedisKey(key)
  ElMessage.success('删除成功')
  load()
}

async function handleFlush() {
  await ElMessageBox.confirm('确定清空当前 Redis 数据库吗？此操作不可恢复！', '危险操作', {
    type: 'error',
  })
  await flushRedis()
  ElMessage.success('已清空')
  load()
}

onMounted(load)
</script>

<style scoped>
.redis-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.redis-alert {
  margin-bottom: 16px;
}
.redis-desc {
  margin-bottom: 16px;
}
.redis-keys {
  margin-top: 8px;
}
</style>
