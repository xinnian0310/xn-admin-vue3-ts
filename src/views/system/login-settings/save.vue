<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="配置名称" prop="name">
            <el-input v-model="form.name" maxlength="50" placeholder="如：默认登录页" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="启用状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">未启用</el-radio>
            </el-radio-group>
            <div class="form-tip">同时仅允许启用一套配置；启用时会自动停用其它配置</div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="背景图" prop="backgroundUrl">
        <div class="bg-source">
          <el-radio-group v-model="bgSource" :disabled="mode === 'view'" size="small">
            <el-radio-button value="url">图片路径</el-radio-button>
            <el-radio-button value="upload">文件上传</el-radio-button>
          </el-radio-group>
        </div>

        <el-input
          v-if="bgSource === 'url'"
          v-model="form.backgroundUrl"
          placeholder="请输入图片 URL，如 https://... 或 /uploads/login/xxx.jpg"
          clearable
          class="bg-url-input"
        />

        <el-upload
          v-else
          class="bg-uploader"
          drag
          :show-file-list="false"
          :disabled="mode === 'view' || uploading"
          :http-request="handleUpload"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        >
          <div v-if="form.backgroundUrl" class="bg-uploader__preview">
            <img :src="form.backgroundUrl" alt="背景预览" />
            <div class="bg-uploader__mask">重新上传</div>
          </div>
          <template v-else>
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip">jpg / png / gif / webp / svg，不超过 5MB</div>
          </template>
        </el-upload>

        <div v-if="form.backgroundUrl" class="bg-current">
          <span class="muted">当前：</span>
          <code>{{ form.backgroundUrl }}</code>
          <el-button v-if="mode !== 'view'" link type="danger" @click="form.backgroundUrl = ''">清除</el-button>
        </div>
        <div class="form-tip">留空则使用系统默认渐变背景</div>
      </el-form-item>

      <el-form-item label="适应模式" prop="backgroundFit">
        <el-radio-group v-model="form.backgroundFit">
          <el-radio v-for="opt in BACKGROUND_FIT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio>
        </el-radio-group>
        <div class="form-tip">{{ currentFitTip }}</div>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="开启验证" prop="captchaEnabled">
            <el-switch v-model="form.captchaEnabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.captchaEnabled" label="验证类型" prop="captchaType">
            <el-select v-model="form.captchaType" placeholder="请选择" style="width: 100%">
              <el-option label="图形验证码" value="IMAGE" />
              <el-option label="滑块验证" value="SLIDER" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="登录框位置">
        <div class="pos-row">
          <span class="pos-label">{{ positionCustomized ? '已设置' : '默认' }}</span>
          <el-button type="primary" plain @click="openPositionDialog">
            {{ positionCustomized ? '查看' : '设置' }}
          </el-button>
          <el-button
            v-if="positionCustomized && mode !== 'view'"
            link
            type="primary"
            @click="clearPosition"
          >
            恢复默认
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="positionVisible"
    :title="positionCustomized ? '查看 / 调整登录框位置' : '设置登录框位置'"
    fullscreen
    destroy-on-close
    class="login-position-dialog"
    @opened="onPositionOpened"
  >
    <div class="position-toolbar">
      <span>拖动登录框调整位置（与真实登录页一致）</span>
      <div class="position-toolbar__actions">
        <el-button v-if="mode !== 'view'" @click="applyDefaultAndClose">恢复默认</el-button>
        <el-button @click="positionVisible = false">取消</el-button>
        <el-button v-if="mode !== 'view'" type="primary" @click="confirmPosition">确定</el-button>
      </div>
    </div>
    <div
      ref="previewRef"
      class="position-stage"
      :style="previewStyle"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointerleave="onDragEnd"
    >
      <div
        class="login-card"
        :class="{ dragging: dragging, disabled: mode === 'view' }"
        :style="draftCardStyle"
        @pointerdown="onDragStart"
      >
        <div class="login-header">
          <h1>{{ appConfig.app.name }}</h1>
          <p>{{ appConfig.app.subtitle }}</p>
        </div>

        <el-form :model="previewForm" @submit.prevent>
          <el-form-item>
            <el-input v-model="previewForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="previewForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-form-item v-if="form.captchaEnabled && form.captchaType === 'IMAGE'">
            <div class="captcha-row">
              <el-input v-model="previewForm.captcha" placeholder="请输入验证码" maxlength="6" />
              <canvas
                ref="captchaCanvas"
                class="captcha-canvas"
                width="110"
                height="40"
                title="预览验证码"
              />
            </div>
          </el-form-item>

          <el-form-item v-if="form.captchaEnabled && form.captchaType === 'SLIDER'">
            <div class="slider-wrap">
              <div class="slider-track">
                <div class="slider-progress" style="width: 0%" />
                <span class="slider-text">拖动滑块完成验证</span>
              </div>
              <div class="slider-thumb" style="left: 0">»</div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" class="login-btn">登 录</el-button>
          </el-form-item>
        </el-form>

        <div class="login-tip">默认账号：admin / admin123</div>
        <div v-if="mode !== 'view'" class="drag-hint">按住拖动调整位置</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { User, Lock, UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import { appConfig } from '@/config/app'
import { get, create, update, uploadBackground } from '@/api/login-page'
import type { LoginBackgroundFit, LoginPageConfigForm } from '@/types'
import { BACKGROUND_FIT_OPTIONS, resolveBackgroundSize } from '@/types'
import { saveDialogTitle, type SaveMode } from '@/types/save'

defineOptions({ name: 'LoginPageSave' })

const emit = defineEmits<{ success: [] }>()

const visible = ref(false)
const positionVisible = ref(false)
const mode = ref<SaveMode>('add')
const editingId = ref<number | null>(null)
const submitting = ref(false)
const uploading = ref(false)
const bgSource = ref<'url' | 'upload'>('url')
const formRef = ref<FormInstance>()
const previewRef = ref<HTMLElement>()
const captchaCanvas = ref<HTMLCanvasElement>()
const dragging = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })

/** 草稿位置；null 表示默认居中 */
const draftBoxX = ref<number | null>(null)
const draftBoxY = ref<number | null>(null)

const dialogTitle = computed(() => saveDialogTitle(mode.value, '登录页配置'))

const form = reactive<LoginPageConfigForm>({
  name: '',
  backgroundUrl: '',
  backgroundFit: 'COVER',
  boxX: null,
  boxY: null,
  captchaEnabled: false,
  captchaType: 'IMAGE',
  status: 0,
  remark: '',
})

const previewForm = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: '',
})

const positionCustomized = computed(
  () => form.boxX != null && form.boxY != null && Number.isFinite(form.boxX) && Number.isFinite(form.boxY),
)

const currentFitTip = computed(
  () => BACKGROUND_FIT_OPTIONS.find((o) => o.value === form.backgroundFit)?.tip ?? '',
)

const rules: FormRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  backgroundFit: [{ required: true, message: '请选择适应模式', trigger: 'change' }],
  captchaType: [
    {
      validator: (_rule, value, callback) => {
        if (form.captchaEnabled && !value) {
          callback(new Error('请选择验证类型'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}

const previewStyle = computed(() => {
  if (form.backgroundUrl) {
    return {
      backgroundImage: `url(${form.backgroundUrl})`,
      backgroundSize: resolveBackgroundSize(form.backgroundFit),
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {
    background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%)',
  }
})

const draftCardStyle = computed(() => ({
  left: `${draftBoxX.value ?? 50}%`,
  top: `${draftBoxY.value ?? 50}%`,
  transform: 'translate(-50%, -50%)',
}))

function resetForm() {
  form.name = ''
  form.backgroundUrl = ''
  form.backgroundFit = 'COVER'
  form.boxX = null
  form.boxY = null
  form.captchaEnabled = false
  form.captchaType = 'IMAGE'
  form.status = 0
  form.remark = ''
  bgSource.value = 'url'
  editingId.value = null
  formRef.value?.clearValidate()
}

function clearPosition() {
  form.boxX = null
  form.boxY = null
}

function applyDefaultAndClose() {
  form.boxX = null
  form.boxY = null
  positionVisible.value = false
}

function openPositionDialog() {
  draftBoxX.value = form.boxX ?? 50
  draftBoxY.value = form.boxY ?? 50
  positionVisible.value = true
}

async function onPositionOpened() {
  if (form.captchaEnabled && form.captchaType === 'IMAGE') {
    await nextTick()
    drawPreviewCaptcha()
  }
}

function drawPreviewCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#f0f4f8'
  ctx.fillRect(0, 0, w, h)
  const code = 'A3K9'
  for (let i = 0; i < code.length; i++) {
    ctx.save()
    ctx.font = 'bold 22px sans-serif'
    ctx.fillStyle = `rgb(${50 + i * 30},${80},${120})`
    ctx.translate(16 + i * 22, 28)
    ctx.rotate((i - 1.5) * 0.08)
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
}

function confirmPosition() {
  // 若仍在默认中心且此前未自定义 → 视为默认；拖动过则写入坐标
  const x = Number((draftBoxX.value ?? 50).toFixed(2))
  const y = Number((draftBoxY.value ?? 50).toFixed(2))
  form.boxX = x
  form.boxY = y
  positionVisible.value = false
}

async function loadDetail(id: number) {
  const res = await get(id)
  const data = res.data
  form.name = data.name
  form.backgroundUrl = data.backgroundUrl ?? ''
  form.backgroundFit = (data.backgroundFit as LoginBackgroundFit) || 'COVER'
  form.boxX = data.boxX ?? null
  form.boxY = data.boxY ?? null
  form.captchaEnabled = !!data.captchaEnabled
  form.captchaType = (data.captchaType as LoginPageConfigForm['captchaType']) || 'IMAGE'
  form.status = data.status ?? 0
  form.remark = data.remark ?? ''
  bgSource.value = form.backgroundUrl?.startsWith('/uploads/') ? 'upload' : 'url'
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

async function handleUpload(options: UploadRequestOptions) {
  uploading.value = true
  try {
    const res = await uploadBackground(options.file as File)
    form.backgroundUrl = res.data.url
    ElMessage.success('上传成功')
  } finally {
    uploading.value = false
  }
}

function onDragStart(e: PointerEvent) {
  if (mode.value === 'view' || !previewRef.value) return
  const target = e.target as HTMLElement
  if (target.closest('input, textarea, button, .el-input, .el-button, .captcha-canvas, .slider-wrap')) {
    return
  }
  e.preventDefault()
  dragging.value = true
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  dragOffset.x = e.clientX - (rect.left + rect.width / 2)
  dragOffset.y = e.clientY - (rect.top + rect.height / 2)
  card.setPointerCapture?.(e.pointerId)
}

function onDragMove(e: PointerEvent) {
  if (!dragging.value || !previewRef.value) return
  const rect = previewRef.value.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return
  const cx = e.clientX - dragOffset.x - rect.left
  const cy = e.clientY - dragOffset.y - rect.top
  draftBoxX.value = Math.min(100, Math.max(0, (cx / rect.width) * 100))
  draftBoxY.value = Math.min(100, Math.max(0, (cy / rect.height) * 100))
}

function onDragEnd() {
  dragging.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: LoginPageConfigForm = {
        name: form.name.trim(),
        backgroundUrl: form.backgroundUrl?.trim() || undefined,
        backgroundFit: form.backgroundFit || 'COVER',
        boxX: positionCustomized.value ? Number(Number(form.boxX).toFixed(2)) : null,
        boxY: positionCustomized.value ? Number(Number(form.boxY).toFixed(2)) : null,
        captchaEnabled: form.captchaEnabled,
        captchaType: form.captchaEnabled ? form.captchaType || 'IMAGE' : undefined,
        status: form.status,
        remark: form.remark?.trim() || undefined,
      }
      if (mode.value === 'edit' && editingId.value) {
        await update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await create(payload)
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
  dragging.value = false
  positionVisible.value = false
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

.bg-source {
  margin-bottom: 10px;
}

.bg-url-input {
  width: 100%;
}

.bg-uploader {
  width: 100%;
}

.bg-uploader :deep(.el-upload) {
  width: 100%;
}

.bg-uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 0;
  overflow: hidden;
}

.bg-uploader__preview {
  position: relative;
  height: 160px;
}

.bg-uploader__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bg-uploader__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.bg-uploader__preview:hover .bg-uploader__mask {
  opacity: 1;
}

.bg-current {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  flex-wrap: wrap;
}

.bg-current code {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}

.muted {
  color: var(--el-text-color-secondary);
}

.pos-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pos-label {
  color: var(--el-text-color-regular);
  min-width: 48px;
}

.position-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.position-toolbar__actions {
  display: flex;
  gap: 8px;
}

.position-stage {
  position: relative;
  height: calc(100vh - 140px);
  min-height: 480px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  user-select: none;
  touch-action: none;
}

.login-card {
  position: absolute;
  width: 420px;
  max-width: calc(100% - 32px);
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  cursor: grab;
}

.login-card.dragging {
  cursor: grabbing;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.login-card.disabled {
  cursor: default;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: var(--app-font-size-main);
  color: #303133;
}

.login-header p {
  margin: 0;
  color: #909399;
}

.login-btn {
  width: 100%;
}

.login-tip {
  margin-top: 16px;
  text-align: center;
  color: #909399;
  font-size: var(--app-font-size-main);
}

.drag-hint {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--el-color-primary);
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-canvas {
  width: 110px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  flex-shrink: 0;
  pointer-events: none;
}

.slider-wrap {
  position: relative;
  width: 100%;
  height: 40px;
  pointer-events: none;
}

.slider-track {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: #f2f3f5;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}

.slider-progress {
  height: 100%;
  background: rgba(64, 158, 255, 0.25);
}

.slider-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #909399;
}

.slider-thumb {
  position: absolute;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid var(--el-border-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-weight: 600;
  z-index: 1;
}
</style>
