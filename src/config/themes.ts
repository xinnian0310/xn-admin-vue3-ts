/** 内置主题：侧栏 / 顶栏 / 主色（同步 EP 组件与业务页） */

import { hexToRgbCss, isLightColor, mixHex } from '@/utils/color'

export type AppearanceMode = 'light' | 'dark'

export interface ThemeColors {
  /** 业务主色：按钮、表格高亮、tags 激活、卡片强调等 */
  primary: string
  sidebar: {
    bg: string
    bgElevated: string
    text: string
    textActive: string
    active: string
    activeBg: string
    hoverBg: string
    border: string
    railBg: string
  }
  header: {
    bg: string
    text: string
    border: string
  }
}

/** 个性化：用户可调的三项核心色 */
export interface CustomThemeParts {
  primary: string
  sidebarBg: string
  headerBg: string
}

export interface AppTheme {
  id: string
  name: string
  /** 预览色块（侧栏色 + 主色） */
  swatches: [string, string]
  colors: ThemeColors
}

export const CUSTOM_THEME_ID = 'custom'

/** 三类主题互斥：同一时刻只生效一类 */
export type ThemeSource = 'preset' | 'appearance' | 'custom'

export const DEFAULT_THEME_SOURCE: ThemeSource = 'preset'

export const DEFAULT_CUSTOM_PARTS: CustomThemeParts = {
  primary: '#409eff',
  sidebarBg: '#409eff',
  headerBg: '#409eff',
}

/** 外观模式：亮色 / 暗色各为完整主题（侧栏、顶栏、主色、页面一并切换） */
export const appearanceThemes: Record<AppearanceMode, AppTheme> = {
  light: {
    id: 'appearance-light',
    name: '亮色',
    swatches: ['#ffffff', '#409eff'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#ffffff',
        bgElevated: '#f5f7fa',
        text: '#606266',
        textActive: '#303133',
        active: '#409eff',
        activeBg: 'rgba(64, 158, 255, 0.12)',
        hoverBg: 'rgba(0, 0, 0, 0.04)',
        border: '#ebeef5',
        railBg: '#f5f7fa',
      },
      header: {
        bg: '#ffffff',
        text: '#303133',
        border: '#ebeef5',
      },
    },
  },
  dark: {
    id: 'appearance-dark',
    name: '暗色',
    swatches: ['#1d1e1f', '#409eff'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#141414',
        bgElevated: '#1d1e1f',
        text: 'rgba(255, 255, 255, 0.65)',
        textActive: '#ffffff',
        active: '#409eff',
        activeBg: 'rgba(64, 158, 255, 0.2)',
        hoverBg: 'rgba(255, 255, 255, 0.06)',
        border: '#414243',
        railBg: '#0a0a0a',
      },
      header: {
        bg: '#1d1e1f',
        text: 'rgba(255, 255, 255, 0.9)',
        border: '#414243',
      },
    },
  },
}

/** 由主色 / 侧栏底 / 顶栏底推导完整 ThemeColors */
export function buildThemeColorsFromParts(parts: CustomThemeParts): ThemeColors {
  const { primary, sidebarBg, headerBg } = parts
  const sidebarLight = isLightColor(sidebarBg)
  const headerLight = isLightColor(headerBg)

  return {
    primary,
    sidebar: {
      bg: sidebarBg,
      bgElevated: mixHex(sidebarBg, sidebarLight ? '#000000' : '#ffffff', 0.08),
      text: sidebarLight ? '#64748b' : 'rgba(255, 255, 255, 0.75)',
      textActive: sidebarLight ? '#0f172a' : '#ffffff',
      active: sidebarLight ? primary : '#ffffff',
      activeBg: sidebarLight
        ? `rgba(${hexToRgbCss(primary)}, 0.12)`
        : 'rgba(255, 255, 255, 0.16)',
      hoverBg: sidebarLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      border: sidebarLight ? mixHex(sidebarBg, '#000000', 0.12) : 'rgba(255, 255, 255, 0.12)',
      railBg: mixHex(sidebarBg, sidebarLight ? '#000000' : '#ffffff', 0.1),
    },
    header: {
      bg: headerBg,
      text: headerLight ? '#334155' : 'rgba(255, 255, 255, 0.95)',
      border: headerLight ? mixHex(headerBg, '#000000', 0.08) : 'rgba(255, 255, 255, 0.15)',
    },
  }
}

export const builtinThemes: AppTheme[] = [
  {
    id: 'blue',
    name: '经典蓝',
    swatches: ['#409eff', '#409eff'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#409eff',
        bgElevated: '#337ecc',
        text: 'rgba(255, 255, 255, 0.85)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.22)',
        hoverBg: 'rgba(255, 255, 255, 0.14)',
        border: 'rgba(255, 255, 255, 0.18)',
        railBg: '#337ecc',
      },
      header: {
        bg: '#409eff',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  {
    id: 'indigo',
    name: '靛蓝',
    swatches: ['#312e81', '#4f46e5'],
    colors: {
      primary: '#4f46e5',
      sidebar: {
        bg: '#312e81',
        bgElevated: '#1e1b4b',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.16)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#1e1b4b',
      },
      header: {
        bg: '#4f46e5',
        text: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  {
    id: 'teal',
    name: '青绿',
    swatches: ['#0f766e', '#14b8a6'],
    colors: {
      primary: '#0d9488',
      sidebar: {
        bg: '#0f766e',
        bgElevated: '#115e59',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.18)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#134e4a',
      },
      header: {
        bg: '#14b8a6',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  {
    id: 'emerald',
    name: '翠绿',
    swatches: ['#166534', '#22c55e'],
    colors: {
      primary: '#16a34a',
      sidebar: {
        bg: '#166534',
        bgElevated: '#14532d',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.18)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#14532d',
      },
      header: {
        bg: '#16a34a',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  {
    id: 'slate',
    name: '深空灰',
    swatches: ['#334155', '#64748b'],
    colors: {
      primary: '#475569',
      sidebar: {
        bg: '#334155',
        bgElevated: '#1e293b',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.16)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#1e293b',
      },
      header: {
        bg: '#475569',
        text: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  {
    id: 'dawn',
    name: '拂晓',
    swatches: ['#e8eef7', '#1e4d8c'],
    colors: {
      primary: '#1e4d8c',
      sidebar: {
        bg: '#e8eef7',
        bgElevated: '#dbe4f0',
        text: '#64748b',
        textActive: '#0f172a',
        active: '#1e4d8c',
        activeBg: 'rgba(30, 77, 140, 0.12)',
        hoverBg: 'rgba(15, 23, 42, 0.05)',
        border: '#d0d9e8',
        railBg: '#dbe4f0',
      },
      header: {
        bg: '#f1f5f9',
        text: '#334155',
        border: '#e2e8f0',
      },
    },
  },
]

export const DEFAULT_THEME_ID = 'blue'

export function findTheme(id: string): AppTheme {
  return builtinThemes.find((t) => t.id === id) ?? builtinThemes[0]
}

export function findAppearanceTheme(mode: AppearanceMode): AppTheme {
  return appearanceThemes[mode]
}

export interface ResolveThemeInput {
  source: ThemeSource
  themeId: string
  appearance: AppearanceMode
  customParts: CustomThemeParts
}

/** 按当前生效的一类主题，解析完整配色 */
export function resolveActiveTheme(input: ResolveThemeInput): AppTheme {
  if (input.source === 'appearance') {
    return findAppearanceTheme(input.appearance)
  }
  if (input.source === 'custom') {
    const colors = buildThemeColorsFromParts(input.customParts)
    return {
      id: CUSTOM_THEME_ID,
      name: '个性化',
      swatches: [input.customParts.sidebarBg, input.customParts.primary],
      colors,
    }
  }
  return findTheme(input.themeId)
}

/** @deprecated 请用 resolveActiveTheme；保留给旧调用兼容 */
export function resolveThemeColors(
  themeId: string,
  customParts: CustomThemeParts,
): ThemeColors {
  if (themeId === CUSTOM_THEME_ID) {
    return buildThemeColorsFromParts(customParts)
  }
  return findTheme(themeId).colors
}
