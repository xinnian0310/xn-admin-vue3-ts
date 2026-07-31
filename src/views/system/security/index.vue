<template>
  <div class="page-card security-policy-page" v-loading="loading">
    <div class="page-header">
      <div class="security-policy-page__heading">
        <h2 class="page-title">安全策略</h2>
        <p class="security-policy-page__hint">
          配置登录失败锁定、IP 限流与验证码有效期，保存后立即生效。图形/滑块验证码开关请在「登录页设置」中配置。
        </p>
      </div>
      <div class="security-policy-page__actions">
        <el-button :icon="Refresh" @click="reloadAll">刷新</el-button>
        <el-button
          v-permission="'security-policy:update'"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="14">
        <h3 class="section-title">登录防护</h3>
        <el-form :model="form" label-width="150px" class="security-policy-page__form">
          <el-form-item label="连续失败锁定阈值">
            <el-input-number v-model="form.maxFailures" :min="1" :max="50" controls-position="right" />
            <span class="hint">次；达到后锁定账号</span>
          </el-form-item>
          <el-form-item label="锁定时长">
            <el-input-number v-model="form.lockMinutes" :min="1" :max="1440" controls-position="right" />
            <span class="hint">分钟</span>
          </el-form-item>
          <el-form-item label="IP 每分钟限流">
            <el-input-number v-model="form.rateLimitPerMinute" :min="1" :max="1000" controls-position="right" />
            <span class="hint">次 / 分钟（登录接口）</span>
          </el-form-item>
          <el-form-item label="验证码有效期">
            <el-input-number v-model="form.captchaTtlSeconds" :min="30" :max="600" controls-position="right" />
            <span class="hint">秒</span>
          </el-form-item>
          <el-form-item v-if="form.updatedAt" label="最近更新">
            <span class="muted">{{ form.updatedAt }}</span>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :xs="24" :lg="10">
        <div class="locks-header">
          <h3 class="section-title">当前锁定账号</h3>
          <el-button link type="primary" :icon="Refresh" @click="loadLocks">刷新列表</el-button>
        </div>
        <el-table :data="locks" stripe empty-text="暂无锁定账号" size="small">
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column label="剩余时间" width="110">
            <template #default="{ row }">
              {{ formatRemain(row.remainSeconds) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="'security-policy:unlock'"
                link
                type="primary"
                :loading="unlocking === row.username"
                @click="handleUnlock(row.username)"
              >
                解锁
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSecurityPolicy,
  listLockedAccounts,
  unlockAccount,
  updateSecurityPolicy,
  type LockedAccount,
} from '@/api/security-policy'

const loading = ref(false)
const saving = ref(false)
const unlocking = ref('')
const locks = ref<LockedAccount[]>([])

const form = reactive({
  maxFailures: 5,
  lockMinutes: 15,
  rateLimitPerMinute: 30,
  captchaTtlSeconds: 120,
  updatedAt: '' as string | null,
})

function formatRemain(sec: number) {
  if (sec >= 60) {
    return `${Math.ceil(sec / 60)} 分钟`
  }
  return `${sec} 秒`
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
  locks.value = res.data || []
}

async function reloadAll() {
  loading.value = true
  try {
    await Promise.all([loadPolicy(), loadLocks()])
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const res = await updateSecurityPolicy({
      maxFailures: form.maxFailures,
      lockMinutes: form.lockMinutes,
      rateLimitPerMinute: form.rateLimitPerMinute,
      captchaTtlSeconds: form.captchaTtlSeconds,
    })
    form.updatedAt = res.data.updatedAt || form.updatedAt
    ElMessage.success('保存成功，已立即生效')
  } finally {
    saving.value = false
  }
}

async function handleUnlock(username: string) {
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

onMounted(reloadAll)
</script>

<style scoped>
.security-policy-page__heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
  flex: 1;
  margin-right: 16px;
}

.security-policy-page__heading .page-title {
  margin: 0;
  flex-shrink: 0;
}

.security-policy-page__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}

.security-policy-page__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.security-policy-page__form {
  max-width: 560px;
}

.hint {
  margin-left: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.locks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.locks-header .section-title {
  margin: 0;
}
</style>
