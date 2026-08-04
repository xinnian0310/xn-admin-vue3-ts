<template>
  <el-dialog
    v-model="themeStore.dialogVisible"
    title="主题设置"
    width="640px"
    append-to-body
    destroy-on-close
    class="theme-dialog"
    @closed="themeStore.closeDialog()"
  >
    <el-tabs v-model="activeTab" class="theme-tabs">
      <el-tab-pane label="预设主题" name="preset">
        <p class="theme-tab__hint">独立完整主题：一键切换侧栏、顶栏、主色与页面配色。</p>
        <div class="theme-dialog__grid">
          <button
            v-for="item in themeStore.themes"
            :key="item.id"
            type="button"
            class="theme-card"
            :class="{
              'is-active': themeStore.source === 'preset' && item.id === themeStore.themeId,
            }"
            @click="themeStore.setTheme(item.id)"
          >
            <div class="theme-card__swatches">
              <span class="theme-card__swatch" :style="{ background: item.swatches[0] }" />
              <span class="theme-card__swatch" :style="{ background: item.colors.primary }" />
            </div>
            <div class="theme-card__name">{{ item.name }}</div>
            <el-icon
              v-if="themeStore.source === 'preset' && item.id === themeStore.themeId"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="外观模式" name="appearance">
        <p class="theme-tab__hint">
          独立完整主题：亮色 / 暗色整站切换（侧栏、顶栏、内容区一并修改）。
        </p>
        <div class="theme-mode">
          <button
            type="button"
            class="theme-mode__card"
            :class="{
              'is-active': themeStore.source === 'appearance' && themeStore.appearance === 'light',
            }"
            @click="themeStore.setAppearance('light')"
          >
            <div class="theme-mode__preview theme-mode__preview--light">
              <span class="theme-mode__preview-side" />
              <span class="theme-mode__preview-main">
                <span class="theme-mode__preview-bar" />
                <span class="theme-mode__preview-body" />
              </span>
            </div>
            <div class="theme-mode__meta">
              <el-icon><Sunny /></el-icon>
              <span>亮色</span>
            </div>
            <el-icon
              v-if="themeStore.source === 'appearance' && themeStore.appearance === 'light'"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
          <button
            type="button"
            class="theme-mode__card"
            :class="{
              'is-active': themeStore.source === 'appearance' && themeStore.appearance === 'dark',
            }"
            @click="themeStore.setAppearance('dark')"
          >
            <div class="theme-mode__preview theme-mode__preview--dark">
              <span class="theme-mode__preview-side" />
              <span class="theme-mode__preview-main">
                <span class="theme-mode__preview-bar" />
                <span class="theme-mode__preview-body" />
              </span>
            </div>
            <div class="theme-mode__meta">
              <el-icon><Moon /></el-icon>
              <span>暗色</span>
            </div>
            <el-icon
              v-if="themeStore.source === 'appearance' && themeStore.appearance === 'dark'"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="个性化" name="custom">
        <p class="theme-tab__hint">独立完整主题：自定义颜色与内容区底图，保存后整站应用。</p>

        <div class="theme-custom">
          <label class="theme-custom__row">
            <span>主色</span>
            <el-color-picker
              :model-value="themeStore.customParts.primary"
              @update:model-value="onColor('primary', $event)"
            />
          </label>
          <label class="theme-custom__row">
            <span>侧栏背景</span>
            <el-color-picker
              :model-value="themeStore.customParts.sidebarBg"
              @update:model-value="onColor('sidebarBg', $event)"
            />
          </label>
          <label class="theme-custom__row">
            <span>顶栏背景</span>
            <el-color-picker
              :model-value="themeStore.customParts.headerBg"
              @update:model-value="onColor('headerBg', $event)"
            />
          </label>
        </div>

        <div class="theme-bg">
          <div class="theme-bg__label">内容区底图</div>
          <div class="theme-bg__actions">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept="image/png,image/jpeg,image/webp,image/gif"
              :on-change="onBgChange"
            >
              <el-button size="small">上传图片</el-button>
            </el-upload>
            <el-button
              v-if="themeStore.mainBgImage"
              size="small"
              type="danger"
              plain
              @click="clearBg"
            >
              清除
            </el-button>
            <el-button
              v-if="themeStore.source !== 'custom'"
              size="small"
              type="primary"
              plain
              @click="themeStore.applyCustom()"
            >
              应用个性化
            </el-button>
          </div>
          <div
            v-if="themeStore.mainBgImage"
            class="theme-bg__preview"
            :style="{ backgroundImage: `url(${themeStore.mainBgImage})` }"
          />
          <p class="theme-bg__tip">
            建议不超过 800KB，本地保存。修改颜色或底图会自动切换到本类主题。
          </p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { MAIN_BG_MAX_BYTES, useThemeStore } from '@/stores/theme'
import type { CustomThemeParts } from '@/config/themes'

const themeStore = useThemeStore()
const activeTab = ref(themeStore.source)

watch(
  () => themeStore.dialogVisible,
  (open) => {
    if (open) activeTab.value = themeStore.source
  },
)

function onColor(key: keyof CustomThemeParts, value: string | null) {
  if (!value) return
  themeStore.setCustomParts({ [key]: value })
}

function onBgChange(file: UploadFile) {
  const raw = file.raw
  if (!raw) return
  if (!raw.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (raw.size > MAIN_BG_MAX_BYTES) {
    ElMessage.warning('图片过大，请压缩到 800KB 以内')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    try {
      themeStore.setMainBgImage(String(reader.result))
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '保存底图失败')
    }
  }
  reader.readAsDataURL(raw)
}

function clearBg() {
  try {
    themeStore.setMainBgImage(null)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '清除失败')
  }
}
</script>

<style scoped>
.theme-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.theme-tab__hint {
  margin: 0 0 14px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.theme-dialog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-card,
.theme-mode__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--app-border-color);
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.theme-card:hover,
.theme-mode__card:hover {
  border-color: var(--app-color-primary);
}

.theme-card.is-active,
.theme-mode__card.is-active {
  border-color: var(--app-color-primary);
  box-shadow: 0 0 0 1px var(--app-color-primary);
}

.theme-card__swatches {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
}

.theme-card__swatch {
  flex: 1;
}

.theme-card__name {
  font-size: 13px;
  color: var(--app-text-primary);
  font-weight: 500;
}

.theme-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--app-color-primary);
  font-size: 16px;
}

.theme-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.theme-mode__preview {
  display: flex;
  height: 88px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.theme-mode__preview-side {
  width: 28%;
  flex-shrink: 0;
}

.theme-mode__preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.theme-mode__preview-bar {
  height: 18px;
  flex-shrink: 0;
}

.theme-mode__preview-body {
  flex: 1;
}

.theme-mode__preview--light .theme-mode__preview-side {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
}

.theme-mode__preview--light .theme-mode__preview-bar {
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

.theme-mode__preview--light .theme-mode__preview-body {
  background: #f5f7fa;
}

.theme-mode__preview--dark {
  border-color: rgba(255, 255, 255, 0.08);
}

.theme-mode__preview--dark .theme-mode__preview-side {
  background: #141414;
  border-right: 1px solid #414243;
}

.theme-mode__preview--dark .theme-mode__preview-bar {
  background: #1d1e1f;
  border-bottom: 1px solid #414243;
}

.theme-mode__preview--dark .theme-mode__preview-body {
  background: #0a0a0a;
}

.theme-mode__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-primary);
}

.theme-custom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.theme-custom__row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--app-text-primary);
}

.theme-bg__label {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--app-text-primary);
}

.theme-bg__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-bg__preview {
  margin-top: 10px;
  height: 72px;
  border-radius: 8px;
  border: 1px solid var(--app-border-color);
  background-size: cover;
  background-position: center;
}

.theme-bg__tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

@media (max-width: 640px) {
  .theme-dialog__grid,
  .theme-custom {
    grid-template-columns: repeat(2, 1fr);
  }

  .theme-mode {
    grid-template-columns: 1fr;
  }
}
</style>
