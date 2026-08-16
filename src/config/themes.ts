/** 内置主题：侧栏 / 顶栏 / 主色（与 xn-admin-react-ts 共享预设；默认 blue 保留 Element Plus 原生色） */

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
  /** 预览色块（侧栏色 + 顶栏色） */
  swatches: [string, string]
  colors: ThemeColors
}

export const CUSTOM_THEME_ID = 'custom'

/** 三类主题互斥：同一时刻只生效一类 */
export type ThemeSource = 'preset' | 'appearance' | 'custom'

export const DEFAULT_THEME_SOURCE: ThemeSource = 'appearance'

/** Element Plus 默认主色 / 经典蓝侧栏 */
export const EP_PRIMARY = '#409eff'
export const EP_SIDER_BG = '#337ecc'

export const DEFAULT_CUSTOM_PARTS: CustomThemeParts = {
  primary: EP_PRIMARY,
  sidebarBg: EP_SIDER_BG,
  headerBg: mixHex(EP_SIDER_BG, '#ffffff', 0.14),
}

/** 旧主题 id → 新共享 id（两栈统一后兼容 localStorage） */
const THEME_ID_ALIASES: Record<string, string> = {
  'tech-blue': 'indigo',
  cyan: 'teal',
  green: 'emerald',
  purple: 'violet',
  orange: 'amber',
  magenta: 'rose',
  daybreak: 'sky',
  dawn: 'sky',
}

/** 从完整主题提取个性化三项 */
export function themeToCustomParts(theme: AppTheme): CustomThemeParts {
  return {
    primary: theme.colors.primary,
    sidebarBg: theme.colors.sidebar.bg,
    headerBg: theme.colors.header.bg,
  }
}

/** Pro 深色侧栏：选中用主色块 */
function darkSider(primary: string, siderBg: string): ThemeColors['sidebar'] {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.06),
    text: 'rgba(255, 255, 255, 0.65)',
    textActive: '#ffffff',
    active: '#ffffff',
    activeBg: primary,
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    border: 'transparent',
    railBg: mixHex(siderBg, '#000000', 0.35),
  }
}

/** 品牌色侧栏：侧栏即主色系，选中用半透明白 */
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
    railBg: mixHex(bg, '#000000', 0.22),
  }
}

/** 浅色侧栏：浅底 + 主色高亮 */
function softSider(primary: string, siderBg: string): ThemeColors['sidebar'] {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.45),
    text: 'rgba(15, 23, 42, 0.65)',
    textActive: 'rgba(15, 23, 42, 0.92)',
    active: primary,
    activeBg: `rgba(${hexToRgbCss(primary)}, 0.12)`,
    hoverBg: 'rgba(15, 23, 42, 0.05)',
    border: mixHex(siderBg, '#000000', 0.08),
    railBg: mixHex(siderBg, '#000000', 0.04),
  }
}

/** 顶栏：相对侧栏只略提亮，色差保持很小 */
function liftHeader(siderBg: string, whiteMix = 0.14): ThemeColors['header'] {
  const bg = mixHex(siderBg, '#ffffff', whiteMix)
  const light = isLightColor(bg)
  return {
    bg,
    text: light ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
    border: light ? mixHex(bg, '#000000', 0.06) : 'rgba(255, 255, 255, 0.1)',
  }
}

/** 外观模式：亮色 / 暗色各为完整主题（主色保留 Element 默认） */
export const appearanceThemes: Record<AppearanceMode, AppTheme> = {
  light: {
    id: 'appearance-light',
    name: '亮色',
    swatches: ['#ffffff', '#f5f5f5'],
    colors: {
      primary: EP_PRIMARY,
      sidebar: {
        bg: '#ffffff',
        bgElevated: '#fafafa',
        text: 'rgba(0, 0, 0, 0.65)',
        textActive: 'rgba(0, 0, 0, 0.88)',
        active: EP_PRIMARY,
        activeBg: '#ecf5ff',
        hoverBg: 'rgba(0, 0, 0, 0.04)',
        border: '#f0f0f0',
        railBg: '#fafafa',
      },
      header: {
        bg: '#ffffff',
        text: 'rgba(0, 0, 0, 0.88)',
        border: '#f0f0f0',
      },
    },
  },
  dark: {
    id: 'appearance-dark',
    name: '暗色',
    swatches: ['#141414', '#1d1e1f'],
    colors: {
      primary: EP_PRIMARY,
      sidebar: {
        bg: '#141414',
        bgElevated: '#1d1e1f',
        text: 'rgba(255, 255, 255, 0.65)',
        textActive: '#ffffff',
        active: EP_PRIMARY,
        activeBg: 'rgba(64, 158, 255, 0.25)',
        hoverBg: 'rgba(255, 255, 255, 0.08)',
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
      text: sidebarLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
      textActive: sidebarLight ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
      active: sidebarLight ? primary : '#ffffff',
      activeBg: sidebarLight ? `rgba(${hexToRgbCss(primary)}, 0.12)` : primary,
      hoverBg: sidebarLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.08)',
      border: sidebarLight ? mixHex(sidebarBg, '#000000', 0.08) : 'transparent',
      railBg: mixHex(sidebarBg, sidebarLight ? '#000000' : '#ffffff', 0.1),
    },
    header: {
      bg: headerBg,
      text: headerLight ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
      border: headerLight ? mixHex(headerBg, '#000000', 0.06) : 'rgba(255, 255, 255, 0.1)',
    },
  }
}

/** 共享预设（与 React 端 id / 色值一致；blue 为各自框架默认） */
export const builtinThemes: AppTheme[] = [
  {
    id: 'blue',
    name: '经典蓝',
    swatches: [EP_SIDER_BG, mixHex(EP_SIDER_BG, '#ffffff', 0.14)],
    colors: {
      primary: EP_PRIMARY,
      sidebar: brandSider(EP_SIDER_BG),
      header: liftHeader(EP_SIDER_BG),
    },
  },
  {
    id: 'indigo',
    name: '靛蓝',
    swatches: ['#312e81', mixHex('#312e81', '#ffffff', 0.14)],
    colors: {
      primary: '#6366f1',
      sidebar: darkSider('#6366f1', '#312e81'),
      header: liftHeader('#312e81'),
    },
  },
  {
    id: 'teal',
    name: '青碧',
    swatches: ['#0f766e', mixHex('#0f766e', '#ffffff', 0.14)],
    colors: {
      primary: '#14b8a6',
      sidebar: brandSider('#0f766e'),
      header: liftHeader('#0f766e'),
    },
  },
  {
    id: 'emerald',
    name: '翠绿',
    swatches: ['#065f46', mixHex('#065f46', '#ffffff', 0.14)],
    colors: {
      primary: '#10b981',
      sidebar: brandSider('#065f46'),
      header: liftHeader('#065f46'),
    },
  },
  {
    id: 'violet',
    name: '紫罗兰',
    swatches: ['#5b21b6', mixHex('#5b21b6', '#ffffff', 0.14)],
    colors: {
      primary: '#8b5cf6',
      sidebar: brandSider('#5b21b6'),
      header: liftHeader('#5b21b6'),
    },
  },
  {
    id: 'amber',
    name: '琥珀',
    swatches: ['#92400e', mixHex('#92400e', '#ffffff', 0.14)],
    colors: {
      primary: '#f59e0b',
      sidebar: brandSider('#92400e'),
      header: liftHeader('#92400e'),
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
      primary: '#64748b',
      sidebar: darkSider('#64748b', '#1e293b'),
      header: liftHeader('#1e293b'),
    },
  },
  {
    id: 'sky',
    name: '晴空',
    swatches: ['#bae6fd', mixHex('#bae6fd', '#ffffff', 0.14)],
    colors: {
      primary: '#0ea5e9',
      sidebar: softSider('#0ea5e9', '#bae6fd'),
      header: liftHeader('#bae6fd'),
    },
  },
]

export const DEFAULT_THEME_ID = 'blue'

export function findTheme(id: string): AppTheme {
  const resolved = THEME_ID_ALIASES[id] ?? id
  return builtinThemes.find((t) => t.id === resolved) ?? builtinThemes[0]
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
