<template>
  <div class="page-card" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">我的消息</h2>
      <div class="mine-actions">
        <el-tag type="danger" effect="light" round v-if="unread > 0">未读 {{ unread }}</el-tag>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table :data="list" border stripe @row-click="openDetail">
      <el-table-column type="index" label="#" width="55" align="center" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="senderName" label="发送人" width="120" />
      <el-table-column prop="sentAt" label="发送时间" min-width="170">
        <template #default="{ row }">{{ formatDateTime(row.sentAt) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.read ? 'info' : 'danger'" size="small">
            {{ row.read ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无消息" :image-size="90" />
      </template>
    </el-table>

    <el-dialog v-model="detailVisible" :title="current?.title || '消息详情'" width="720px" destroy-on-close>
      <div v-if="current" class="message-detail">
        <div class="message-detail__meta">
          <span>发送人：{{ current.senderName || '—' }}</span>
          <span>发送时间：{{ formatDateTime(current.sentAt) }}</span>
        </div>
        <div class="message-detail__content" v-html="current.content" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { listMine, markRead, unreadCount } from '@/api/message'
import type { MyMessage } from '@/types'
import { formatDateTime } from '@/utils/datetime'

defineOptions({ name: 'MessagesMine' })

const loading = ref(false)
const list = ref<MyMessage[]>([])
const unread = ref(0)
const detailVisible = ref(false)
const current = ref<MyMessage | null>(null)

async function loadUnread() {
  const res = await unreadCount()
  unread.value = res.data.count
}

async function load() {
  loading.value = true
  try {
    const res = await listMine()
    list.value = res.data
    await loadUnread()
  } finally {
    loading.value = false
  }
}

async function openDetail(row: MyMessage) {
  current.value = row
  detailVisible.value = true
  if (!row.read) {
    await markRead(row.id)
    row.read = true
    unread.value = Math.max(0, unread.value - 1)
  }
}

onMounted(load)
</script>

<style scoped>
.mine-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-detail__meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.message-detail__content {
  line-height: 1.7;
  min-height: 120px;
}
</style>
