<template>
  <div class="page-card profile-page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">个人信息</h2>
      <div class="profile-page__actions">
        <el-button :icon="Refresh" @click="loadProfile">刷新</el-button>
        <el-button
          type="primary"
          :disabled="!canEdit || saving"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!canEdit"
      type="warning"
      :closable="false"
      show-icon
      class="profile-page__alert"
      title="超级管理员账号禁止编辑个人信息"
    />

    <div class="profile-page__body">
      <div class="profile-page__avatar">
        <el-avatar :size="72">{{ avatarText }}</el-avatar>
        <div class="profile-page__name">{{ form.nickname || form.username || '-' }}</div>
        <div class="profile-page__role">{{ roleText }}</div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="88px"
        class="profile-page__form"
        :disabled="!canEdit"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" maxlength="50" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" maxlength="100" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" maxlength="20" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            maxlength="50"
            placeholder="不修改请留空"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="user?.status === 1 ? 'success' : 'info'" size="small">
            {{ user?.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="角色">
          <span>{{ roleText }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ formatTime(user?.createdAt) }}</span>
        </el-form-item>
        <el-form-item label="更新时间">
          <span>{{ formatTime(user?.updatedAt) }}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/datetime'

defineOptions({ name: 'Profile' })

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { isSuperAdmin } = storeToRefs(permissionStore)

const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

const canEdit = computed(() => !isSuperAdmin.value)
const user = computed(() => userStore.user)

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
})

const rules: FormRules = {
  nickname: [{ max: 50, message: '昵称不能超过50个字符', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
    { max: 100, message: '邮箱不能超过100个字符', trigger: 'blur' },
  ],
  phone: [{ max: 20, message: '手机号不能超过20个字符', trigger: 'blur' }],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (String(value).length < 6 || String(value).length > 50) {
          callback(new Error('密码长度需在6-50之间'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

const avatarText = computed(() => {
  const name = form.nickname || form.username || 'U'
  return name.charAt(0).toUpperCase()
})

const roleText = computed(() => {
  if (user.value?.roleList?.length) {
    return user.value.roleList.map((r) => r.name || r.code).join('、')
  }
  if (user.value?.roles?.length) return user.value.roles.join('、')
  return user.value?.role || '-'
})

function formatTime(value?: string | null) {
  return formatDateTime(value)
}

function syncForm() {
  form.username = user.value?.username || ''
  form.nickname = user.value?.nickname || ''
  form.email = user.value?.email || ''
  form.phone = user.value?.phone || ''
  form.password = ''
}

watch(user, syncForm, { immediate: true })

async function loadProfile() {
  loading.value = true
  try {
    await userStore.fetchProfile()
    syncForm()
  } catch {
    ElMessage.error('获取个人信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!canEdit.value) {
    ElMessage.warning('超级管理员禁止编辑个人信息')
    return
  }
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await userStore.updateProfile({
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      password: form.password || undefined,
    })
    form.password = ''
    ElMessage.success('保存成功')
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: string }).message)
        : '保存失败'
    ElMessage.error(msg || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page__actions {
  display: flex;
  gap: 8px;
}

.profile-page__alert {
  margin-bottom: 16px;
}

.profile-page__body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: start;
}

.profile-page__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 16px;
  background: var(--app-fill-color, #f8fafc);
  border: 1px solid var(--app-border-color);
  border-radius: 12px;
}

.profile-page__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
}

.profile-page__role {
  font-size: 13px;
  color: var(--app-text-muted, #909399);
  text-align: center;
}

.profile-page__form {
  max-width: 520px;
}

@media (max-width: 768px) {
  .profile-page__body {
    grid-template-columns: 1fr;
  }
}
</style>
