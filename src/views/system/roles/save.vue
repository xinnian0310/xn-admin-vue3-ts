<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="520px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" :disabled="mode === 'view'">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { create, get, update } from '@/api/role'
import type { RoleForm } from '@/types'
import { saveDialogTitle, type SaveMode } from '@/types/save'

defineOptions({ name: 'RolesSave' })

const emit = defineEmits<{ success: [] }>()

const visible = ref(false)
const mode = ref<SaveMode>('add')
const editingId = ref<number | null>(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const formRef = ref<FormInstance>()

const dialogTitle = computed(() => saveDialogTitle(mode.value, '角色'))

const form = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
}

function resetForm() {
  form.code = ''
  form.name = ''
  form.description = ''
  editingBuiltIn.value = false
  editingId.value = null
  formRef.value?.clearValidate()
}

async function loadDetail(id: number) {
  const res = await get(id)
  editingBuiltIn.value = res.data.builtIn
  form.code = res.data.code
  form.name = res.data.name
  form.description = res.data.description ?? ''
}

async function open(openMode: SaveMode, id?: number) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
  visible.value = true
  if (openMode !== 'add' && id) {
    await loadDetail(id)
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (mode.value === 'edit' && editingId.value) {
        await update(editingId.value, form)
        ElMessage.success('更新成功')
      } else {
        await create(form)
        ElMessage.success('创建成功')
      }
      visible.value = false
      emit('success')
    } finally {
      submitting.value = false
    }
  })
}

function handleClosed() {
  resetForm()
}

defineExpose({ open })
</script>
