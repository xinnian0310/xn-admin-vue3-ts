<template>
  <div class="login-page" :style="pageStyle">
    <div class="login-card" :style="cardStyle">
      <div class="login-header">
        <h1>{{ appConfig.app.name }}</h1>
        <p>{{ appConfig.app.subtitle }}</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item v-if="captchaEnabled && captchaType === 'IMAGE'" prop="captcha">
          <div class="captcha-row">
            <el-input
              v-model="form.captcha"
              placeholder="请输入验证码"
              maxlength="6"
              @keyup.enter="handleLogin"
            />
            <canvas
              ref="captchaCanvas"
              class="captcha-canvas"
              width="110"
              height="40"
              title="点击刷新"
              @click="refreshImageCaptcha"
            />
          </div>
        </el-form-item>

        <el-form-item v-if="captchaEnabled && captchaType === 'SLIDER'" prop="sliderOk">
          <div class="slider-wrap">
            <div class="slider-track">
              <div class="slider-progress" :style="{ width: `${sliderPercent}%` }" />
              <span class="slider-text">{{ sliderOk ? '验证通过' : '拖动滑块完成验证' }}</span>
            </div>
            <div
              class="slider-thumb"
              :style="{ left: `calc(${sliderPercent}% - 18px)` }"
              @pointerdown="onSliderStart"
            >
              <span v-if="sliderOk">✓</span>
              <span v-else>»</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tip">默认账号：admin / admin123</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { appConfig } from '@/config/app'
import { useUserStore } from '@/stores/user'
import { getActive } from '@/api/login-page'
import type { LoginBackgroundFit, LoginCaptchaType } from '@/types'
import { resolveBackgroundSize } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaCanvas = ref<HTMLCanvasElement>()

const backgroundUrl = ref<string | null>(null)
const backgroundFit = ref<LoginBackgroundFit>('COVER')
const boxX = ref(50)
const boxY = ref(50)
const captchaEnabled = ref(false)
const captchaType = ref<LoginCaptchaType | null>(null)

const imageCaptchaCode = ref('')
const sliderPercent = ref(0)
const sliderOk = ref(false)
const sliding = ref(false)
const slideStartX = ref(0)
const slideStartPercent = ref(0)

const form = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: '',
  sliderOk: false,
})

const pageStyle = computed(() => {
  if (backgroundUrl.value) {
    return {
      backgroundImage: `url(${backgroundUrl.value})`,
      backgroundSize: resolveBackgroundSize(backgroundFit.value),
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {
    background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%)',
  }
})

const cardStyle = computed(() => ({
  left: `${boxX.value}%`,
  top: `${boxY.value}%`,
  transform: 'translate(-50%, -50%)',
}))

const rules = computed<FormRules>(() => {
  const base: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }
  if (captchaEnabled.value && captchaType.value === 'IMAGE') {
    base.captcha = [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      {
        validator: (_r, value, callback) => {
          if (String(value || '').toLowerCase() !== imageCaptchaCode.value.toLowerCase()) {
            callback(new Error('验证码不正确'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ]
  }
  if (captchaEnabled.value && captchaType.value === 'SLIDER') {
    base.sliderOk = [
      {
        validator: (_r, _value, callback) => {
          if (!sliderOk.value) {
            callback(new Error('请完成滑块验证'))
            return
          }
          callback()
        },
        trigger: 'change',
      },
    ]
  }
  return base
})

function randomCode(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

function refreshImageCaptcha() {
  imageCaptchaCode.value = randomCode(4)
  form.captcha = ''
  nextTick(() => drawCaptcha())
}

function drawCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#f0f4f8'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 160},${Math.random() * 160},${Math.random() * 160},0.6)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }
  const code = imageCaptchaCode.value
  for (let i = 0; i < code.length; i++) {
    ctx.save()
    ctx.font = `bold ${22 + Math.random() * 4}px sans-serif`
    ctx.fillStyle = `rgb(${40 + Math.random() * 100},${40 + Math.random() * 100},${40 + Math.random() * 100})`
    ctx.translate(16 + i * 22, 28)
    ctx.rotate((Math.random() - 0.5) * 0.4)
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
}

function resetSlider() {
  sliderPercent.value = 0
  sliderOk.value = false
  form.sliderOk = false
}

function onSliderStart(e: PointerEvent) {
  if (sliderOk.value) return
  sliding.value = true
  slideStartX.value = e.clientX
  slideStartPercent.value = sliderPercent.value
  window.addEventListener('pointermove', onSliderMove)
  window.addEventListener('pointerup', onSliderEnd)
}

function onSliderMove(e: PointerEvent) {
  if (!sliding.value) return
  const track = document.querySelector('.slider-wrap') as HTMLElement | null
  const width = track?.clientWidth || 280
  const delta = ((e.clientX - slideStartX.value) / width) * 100
  sliderPercent.value = Math.min(100, Math.max(0, slideStartPercent.value + delta))
}

function onSliderEnd() {
  sliding.value = false
  window.removeEventListener('pointermove', onSliderMove)
  window.removeEventListener('pointerup', onSliderEnd)
  if (sliderPercent.value >= 92) {
    sliderPercent.value = 100
    sliderOk.value = true
    form.sliderOk = true
    formRef.value?.clearValidate('sliderOk')
  } else {
    resetSlider()
  }
}

async function loadPageConfig() {
  try {
    const res = await getActive()
    const cfg = res.data
    if (!cfg) return
    backgroundUrl.value = cfg.backgroundUrl || null
    backgroundFit.value = (cfg.backgroundFit as LoginBackgroundFit) || 'COVER'
    boxX.value = cfg.boxX ?? 50
    boxY.value = cfg.boxY ?? 50
    captchaEnabled.value = !!cfg.captchaEnabled
    captchaType.value = (cfg.captchaType as LoginCaptchaType) || null
    if (captchaEnabled.value && captchaType.value === 'IMAGE') {
      await nextTick()
      refreshImageCaptcha()
    }
  } catch {
    // 无配置或接口失败时使用默认样式
  }
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(form.username, form.password)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch {
      if (captchaEnabled.value && captchaType.value === 'IMAGE') {
        refreshImageCaptcha()
      }
      if (captchaEnabled.value && captchaType.value === 'SLIDER') {
        resetSlider()
      }
    } finally {
      loading.value = false
    }
  })
}

onMounted(loadPageConfig)

onUnmounted(() => {
  window.removeEventListener('pointermove', onSliderMove)
  window.removeEventListener('pointerup', onSliderEnd)
})
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.login-card {
  position: absolute;
  width: 420px;
  max-width: calc(100vw - 32px);
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
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
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  flex-shrink: 0;
}

.slider-wrap {
  position: relative;
  width: 100%;
  height: 40px;
  user-select: none;
  touch-action: none;
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
  transition: width 0.05s linear;
}

.slider-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #909399;
  pointer-events: none;
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
  cursor: grab;
  color: #409eff;
  font-weight: 600;
  z-index: 1;
}
</style>
