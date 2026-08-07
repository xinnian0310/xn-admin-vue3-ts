/** 内置主题：侧栏 / 顶栏 / 主色（各预设侧栏色明显区分） */

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
  sidebarBg: '#337ecc',
  headerBg: mixHex('#337ecc', '#ffffff', 0.14),
}

/** 从完整主题提取个性化三项 */
export function themeToCustomParts(theme: AppTheme): CustomThemeParts {
  return {
    primary: theme.colors.primary,
    sidebarBg: theme.colors.sidebar.bg,
    headerBg: theme.colors.header.bg,
  }
}

/** 品牌色侧栏 */
function brandSider(bg: string): ThemeColors['sidebar'] {
  return {
    bg,
    bgElevated: mixHex(bg, '#000000', 0.1),
    text: 'rgba(255, 255, 255, 0.85)',
    textActive: '#ffffff',
    active: '#ffffff',
    activeBg: 'rgba(255, 255, 255, 0.22)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.14)',
    railBg: mixHex(bg, '#000000', 0.2),
  }
}

/** 深色侧栏：选中用主色块 */
function darkSider(primary: string, siderBg: string): ThemeColors['sidebar'] {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.06),
    text: 'rgba(255, 255, 255, 0.75)',
    textActive: '#ffffff',
    active: '#ffffff',
    activeBg: primary,
    hoverBg: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    railBg: mixHex(siderBg, '#000000', 0.25),
  }
}

/** 浅色侧栏 */
function softSider(primary: string, siderBg: string): ThemeColors['sidebar'] {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.45),
    text: '#64748b',
    textActive: '#0f172a',
    active: primary,
    activeBg: `rgba(${hexToRgbCss(primary)}, 0.12)`,
    hoverBg: 'rgba(15, 23, 42, 0.05)',
    border: mixHex(siderBg, '#000000', 0.1),
    railBg: mixHex(siderBg, '#000000', 0.05),
  }
}

/** 顶栏：相对侧栏只略提亮，色差保持很小 */
function liftHeader(siderBg: string, whiteMix = 0.14): ThemeColors['header'] {
  const bg = mixHex(siderBg, '#ffffff', whiteMix)
  const light = isLightColor(bg)
  return {
    bg,
    text: light ? '#334155' : 'rgba(255, 255, 255, 0.92)',
    border: light ? mixHex(bg, '#000000', 0.08) : 'rgba(255, 255, 255, 0.12)',
  }
}

/** 外观模式：亮色 / 暗色各为完整主题 */
export const appearanceThemes: Record<AppearanceMode, AppTheme> = {
  light: {
    id: 'appearance-light',
    name: '亮色',
    swatches: ['#d9ecff', mixHex('#d9ecff', '#ffffff', 0.12)],
    colors: {
      primary: '#409eff',
      sidebar: softSider('#409eff', '#d9ecff'),
      header: liftHeader('#d9ecff', 0.12),
    },
  },
  dark: {
    id: 'appearance-dark',
    name: '暗色',
    swatches: ['#141414', '#1d1e1f'],
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
      header: liftHeader('#141414', 0.12),
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
      activeBg: sidebarLight ? `rgba(${hexToRgbCss(primary)}, 0.12)` : 'rgba(255, 255, 255, 0.16)',
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
    swatches: ['#337ecc', mixHex('#337ecc', '#ffffff', 0.14)],
    colors: {
      primary: '#409eff',
      sidebar: brandSider('#337ecc'),
      header: liftHeader('#337ecc'),
    },
  },
  {
    id: 'indigo',
    name: '靛蓝',
    swatches: ['#312e81', mixHex('#312e81', '#ffffff', 0.14)],
    colors: {
      primary: '#4f46e5',
      sidebar: darkSider('#4f46e5', '#312e81'),
      header: liftHeader('#312e81'),
    },
  },
  {
    id: 'teal',
    name: '青绿',
    swatches: ['#115e59', mixHex('#115e59', '#ffffff', 0.14)],
    colors: {
      primary: '#0d9488',
      sidebar: brandSider('#115e59'),
      header: liftHeader('#115e59'),
    },
  },
  {
    id: 'emerald',
    name: '翠绿',
    swatches: ['#14532d', mixHex('#14532d', '#ffffff', 0.14)],
    colors: {
      primary: '#16a34a',
      sidebar: brandSider('#14532d'),
      header: liftHeader('#14532d'),
    },
  },
  {
    id: 'orange',
    name: '日落橙',
    swatches: ['#9a3412', mixHex('#9a3412', '#ffffff', 0.14)],
    colors: {
      primary: '#ea580c',
      sidebar: brandSider('#9a3412'),
      header: liftHeader('#9a3412'),
    },
  },
  {
    id: 'rose',
    name: '玫红',
    swatches: ['#9f1239', mixHex('#9f1239', '#ffffff', 0.14)],
    colors: {
      primary: '#e11d48',
      sidebar: brandSider('#9f1239'),
      header: liftHeader('#9f1239'),
    },
  },
  {
    id: 'slate',
    name: '深空灰',
    swatches: ['#1e293b', mixHex('#1e293b', '#ffffff', 0.14)],
    colors: {
      primary: '#475569',
      sidebar: darkSider('#64748b', '#1e293b'),
      header: liftHeader('#1e293b'),
    },
  },
  {
    id: 'sky',
    name: '晴空',
    swatches: ['#93c5fd', mixHex('#93c5fd', '#ffffff', 0.14)],
    colors: {
      primary: '#2563eb',
      sidebar: softSider('#2563eb', '#93c5fd'),
      header: liftHeader('#93c5fd'),
    },
  },
  {
    id: 'dawn',
    name: '拂晓',
    swatches: ['#cbd5e1', mixHex('#cbd5e1', '#ffffff', 0.14)],
    colors: {
      primary: '#1e4d8c',
      sidebar: softSider('#1e4d8c', '#cbd5e1'),
      header: liftHeader('#cbd5e1'),
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
export function resolveThemeColors(themeId: string, customParts: CustomThemeParts): ThemeColors {
  if (themeId === CUSTOM_THEME_ID) {
    return buildThemeColorsFromParts(customParts)
  }
  return findTheme(themeId).colors
}
