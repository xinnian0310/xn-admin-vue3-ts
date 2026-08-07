import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { applyLayoutTheme } from '@/config/app'
import {
  DEFAULT_CUSTOM_PARTS,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_SOURCE,
  builtinThemes,
  findAppearanceTheme,
  findTheme,
  resolveActiveTheme,
  themeToCustomParts,
  type AppearanceMode,
  type CustomThemeParts,
  type ThemeSource,
} from '@/config/themes'

const STORAGE_SOURCE = 'xn-theme-source'
const STORAGE_THEME_ID = 'xn-theme-id'
const STORAGE_APPEARANCE = 'xn-appearance'
const STORAGE_CUSTOM = 'xn-theme-custom'
const STORAGE_MAIN_BG = 'xn-main-bg-image'

/** 主区底图建议上限（约 800KB，避免撑爆 localStorage） */
export const MAIN_BG_MAX_BYTES = 800 * 1024

function loadSource(): ThemeSource {
  try {
    const v = localStorage.getItem(STORAGE_SOURCE)
    if (v === 'appearance' || v === 'custom' || v === 'preset') return v
    // 兼容旧数据：曾用 themeId=custom 表示个性化
    if (localStorage.getItem(STORAGE_THEME_ID) === 'custom') return 'custom'
    return DEFAULT_THEME_SOURCE
  } catch {
    return DEFAULT_THEME_SOURCE
  }
}

function loadThemeId(): string {
  try {
    const id = localStorage.getItem(STORAGE_THEME_ID) || DEFAULT_THEME_ID
    return id === 'custom' ? DEFAULT_THEME_ID : id
  } catch {
    return DEFAULT_THEME_ID
  }
}

function loadAppearance(): AppearanceMode {
  try {
    const v = localStorage.getItem(STORAGE_APPEARANCE)
    return v === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function loadCustomParts(): CustomThemeParts {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM)
    if (!raw) return { ...DEFAULT_CUSTOM_PARTS }
    return { ...DEFAULT_CUSTOM_PARTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CUSTOM_PARTS }
  }
}

function loadMainBgImage(): string | null {
  try {
    return localStorage.getItem(STORAGE_MAIN_BG)
  } catch {
    return null
  }
}

export const useThemeStore = defineStore('theme', () => {
  const source = ref<ThemeSource>(loadSource())
  const themeId = ref(loadThemeId())
  const appearance = ref<AppearanceMode>(loadAppearance())
  const customParts = ref<CustomThemeParts>(loadCustomParts())
  const mainBgImage = ref<string | null>(loadMainBgImage())
  const dialogVisible = ref(false)

  const themes = computed(() => builtinThemes)

  const currentTheme = computed(() =>
    resolveActiveTheme({
      source: source.value,
      themeId: themeId.value,
      appearance: appearance.value,
      customParts: customParts.value,
    }),
  )

  /** 页面明暗：仅「外观模式」生效时用暗色整套；其余两类走亮色页面表面 */
  const effectiveAppearance = computed<AppearanceMode>(() =>
    source.value === 'appearance' ? appearance.value : 'light',
  )

  function persistSource(next: ThemeSource) {
    source.value = next
    localStorage.setItem(STORAGE_SOURCE, next)
  }

  function applyCurrent() {
    applyLayoutTheme(currentTheme.value.colors, {
      appearance: effectiveAppearance.value,
      // 底图只在个性化下生效
      mainBgImage: source.value === 'custom' ? mainBgImage.value : null,
    })
  }

  /** 预设主题：完整切换到某一套内置配色（含侧栏），并同步个性化取色器 */
  function setTheme(id: string) {
    themeId.value = id
    localStorage.setItem(STORAGE_THEME_ID, id)
    const parts = themeToCustomParts(findTheme(id))
    customParts.value = parts
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(parts))
    persistSource('preset')
    applyCurrent()
  }

  /** 外观模式：亮色 / 暗色各为完整主题，整站切换 */
  function setAppearance(mode: AppearanceMode) {
    appearance.value = mode
    localStorage.setItem(STORAGE_APPEARANCE, mode)
    const parts = themeToCustomParts(findAppearanceTheme(mode))
    customParts.value = parts
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(parts))
    persistSource('appearance')
    applyCurrent()
  }

  /** 个性化：自配色，整站应用 */
  function setCustomParts(partial: Partial<CustomThemeParts>) {
    customParts.value = { ...customParts.value, ...partial }
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(customParts.value))
    persistSource('custom')
    applyCurrent()
  }

  function setMainBgImage(dataUrl: string | null) {
    mainBgImage.value = dataUrl
    try {
      if (dataUrl) localStorage.setItem(STORAGE_MAIN_BG, dataUrl)
      else localStorage.removeItem(STORAGE_MAIN_BG)
    } catch {
      mainBgImage.value = null
      throw new Error('底图过大或存储空间不足，请压缩后重试')
    }
    persistSource('custom')
    applyCurrent()
  }

  /** 仅切到个性化并应用当前已保存的自定义配置 */
  function applyCustom() {
    persistSource('custom')
    applyCurrent()
  }

  function openDialog() {
    dialogVisible.value = true
  }

  function closeDialog() {
    dialogVisible.value = false
  }

  return {
    source,
    themeId,
    appearance,
    customParts,
    mainBgImage,
    dialogVisible,
    currentTheme,
    themes,
    effectiveAppearance,
    applyCurrent,
    setTheme,
    setAppearance,
    setCustomParts,
    setMainBgImage,
    applyCustom,
    openDialog,
    closeDialog,
  }
})
