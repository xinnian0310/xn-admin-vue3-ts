<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="520px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="图标" prop="icon">
        <xnIconPicker
          v-model="form.icon"
          :disabled="mode === 'view'"
          placeholder="选择 Element / Iconify / SVG 图标"
        />
      </el-form-item>
      <el-form-item label="标签" prop="label">
        <el-input v-model="form.label" maxlength="30" placeholder="如：公司 / 邮箱 / 官网" />
      </el-form-item>
      <el-form-item label="内容" prop="value">
        <el-input v-model="form.value" maxlength="200" placeholder="展示文案" />
      </el-form-item>
      <el-form-item label="链接" prop="link">
        <el-input
          v-model="form.link"
          maxlength="300"
          placeholder="可选，如 mailto:xxx 或 https://..."
        />
        <div class="form-tip">填写后前台可点击跳转；邮箱建议使用 mailto: 前缀</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import xnIconPicker from '@/components/xnIconPicker/xnIconPicker.vue'
import { saveDialogTitle, type SaveMode } from '@/types/save'
import type { SiteContactItem } from '@/types/site-contact'

defineOptions({ name: 'SiteContactItemSave' })

const emit = defineEmits<{
  success: [payload: { mode: SaveMode; index: number | null; data: SiteContactItem }]
}>()

const visible = ref(false)
const mode = ref<SaveMode>('add')
const editingIndex = ref<number | null>(null)
const formRef = ref<FormInstance>()

const dialogTitle = computed(() => saveDialogTitle(mode.value, '联系项'))

const form = reactive<SiteContactItem>({
  icon: 'Link',
  label: '',
  value: '',
  link: '',
})

const rules: FormRules = {
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function resetForm() {
  form.icon = 'Link'
  form.label = ''
  form.value = ''
  form.link = ''
  editingIndex.value = null
  formRef.value?.clearValidate()
}

function open(openMode: SaveMode, row?: SiteContactItem, index?: number) {
  mode.value = openMode
  resetForm()
  if (row) {
    form.icon = row.icon || 'Link'
    form.label = row.label || ''
    form.value = row.value || ''
    form.link = row.link || ''
    editingIndex.value = index ?? null
  }
  visible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('success', {
      mode: mode.value,
      index: editingIndex.value,
      data: {
        icon: form.icon || 'Link',
        label: form.label.trim(),
        value: form.value.trim(),
        link: form.link?.trim() || '',
      },
    })
    visible.value = false
  })
}

function handleClosed() {
  resetForm()
}

defineExpose({ open })
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  width: 100%;
}
</style>
