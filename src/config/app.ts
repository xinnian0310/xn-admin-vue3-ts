/**
 * 应用全局配置
 *
 * - 项目名称 / 副标题 / 页脚：改 app.name、app.subtitle、app.footer
 * - favicon / 侧栏 Logo：改 app.favicon、app.logo、app.logoWidth / logoHeight（null 表示按比例自适应；图片放 public/）
 * - UI 行为（弹窗高度等）在此集中管理
 * - Element Plus 组件尺寸只改 ui.elementPlus.size，页面/组件不要再写 size
 * - 布局区域字号由此写入 CSS 变量
 * - 后续 MinIO、第三方服务地址等也可放在这里
 * - 若改为后端「系统配置」下发，启动时 merge 覆盖本配置即可
 */
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import type { Language } from 'element-plus/es/locale'
import type { AppearanceMode, ThemeColors, ThemeSource } from '@/config/themes'
import {
  DEFAULT_CUSTOM_PARTS,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_SOURCE,
  resolveActiveTheme,
  type CustomThemeParts,
} from '@/config/themes'
import { buildPrimaryScale, mixHex } from '@/utils/color'

export type ElementPlusLocale = 'zh-cn' | 'en'
export type ElementPlusSize = 'large' | 'default' | 'small'
/** 后台整体布局：side 左侧 | top 顶部 | mix 顶+侧 | columns 双列侧栏 */
export type LayoutMode = 'side' | 'top' | 'mix' | 'columns'

const elementPlusLocales: Record<ElementPlusLocale, Language> = {
  'zh-cn': zhCn,
  en,
}

export const appConfig = {
  /**
   * 应用基础信息
   * 改这里即可统一侧栏 Logo、登录页标题、浏览器标签等展示名
   */
  app: {
    /** 项目名称（侧栏 / 顶栏 Logo、登录页主标题） */
    name: '心念后台管理系统',
    /** 公司名称 */
    company: '心念科技',
    /** 副标题（登录页说明文案等） */
    subtitle: '心念科技',
    /**
     * 浏览器标签页图标（favicon）
     * 图片放 public/，路径以 / 开头，如 '/favicon.svg'
     * 留空则不覆盖 index.html 中的默认值
     */
    favicon: '/favicon.svg',
    /**
     * 侧栏 / 顶栏品牌 Logo
     * 图片放 public/，路径以 / 开头，如 '/logo.svg'、'/logo.png'
     * 支持 svg / png / jpg / webp；留空则使用内置 Monitor 图标兜底
     */
    logo: '/logo.svg',
    /**
     * Logo 宽度（px）
     * 设为 null 时按原图比例自适应（需同时给出 logoHeight）
     */
    logoWidth: 28 as number | null,
    /** Logo 显示高度（px）；设为 null 时按原图比例自适应（需同时给出 logoWidth） */
    logoHeight: null as number | null,
    /**
     * 主内容区底部产品信息（main 下方页脚）
     * 留空则不显示页脚
     */
    footer: '心念后台管理系统 · 心念科技 · Copyright © 2026',
  },

  /**
   * 登录会话策略（与后端 JWT 配合）
   * - 固定过期：后端 app.jwt.expiration（当前 24h）
   * - 空闲超时：无操作达到 idleTimeoutMs 自动登出
   * - 滑动续期：有操作且距上次续期超过 refreshIntervalMs 时调用 /auth/refresh 换新 token
   */
  session: {
    /** 是否启用空闲超时自动登出 */
    idleLogoutEnabled: true,
    /** 空闲超时时长（毫秒），默认 30 分钟 */
    idleTimeoutMs: 30 * 60 * 1000,
    /** 是否启用滑动续期 */
    slidingRefreshEnabled: true,
    /** 有操作时的最小续期间隔（毫秒），默认 5 分钟，避免频繁打接口 */
    refreshIntervalMs: 5 * 60 * 1000,
    /** 空闲检测轮询间隔（毫秒） */
    idleCheckIntervalMs: 30 * 1000,
  },

  ui: {
    dialog: {
      /** 弹窗最大高度，超出后仅内容区（body）滚动，弹窗外壳不滚动；弹窗本身上下居中 */
      maxHeight: '95vh',
    },
    /**
     * 后台布局模式
     * - side：经典左侧菜单（默认）
     * - top：顶部横向菜单
     * - mix：顶栏一级 + 左侧子菜单
     * - columns：左侧图标栏 + 二级侧栏
     * 切换后刷新即可生效；后续也可接到「系统设置」页面
     */
    layout: {
      mode: 'side' as LayoutMode,
      /**
       * 侧栏 / 顶栏菜单配色（写入 CSS 变量）
       * 改这里即可统一调整，不必改各布局组件
       */
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
      /** 顶栏：Element Plus 主色 */
      header: {
        bg: '#409eff',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
    /**
     * 布局区域字号（写入 CSS 变量后由各区域读取）
     * 修改此处即可统一调整左侧菜单 / 顶栏 / 标签栏 / 正文
     */
    fontSize: {
      /** 左侧菜单 */
      sidebar: '14px',
      /** 顶部 header */
      header: '14px',
      /** tags-view 标签栏 */
      tagsView: '14px',
      /** main 正文区域 */
      main: '14px',
    },
    /** tags-view 标签栏尺寸 */
    tagsView: {
      /** 标签栏高度 */
      height: '40px',
    },
    /**
     * Element Plus Config Provider 全局配置
     * @see https://element-plus.org/zh-CN/component/config-provider.html
     * 全局组件尺寸只改这里的 size；页面与组件不要再传 size
     */
    elementPlus: {
      /** 语言包：zh-cn | en */
      locale: 'zh-cn' as ElementPlusLocale,
      /** 全局组件尺寸：large | default | small（唯一入口） */
      size: 'default' as ElementPlusSize,
      /** 弹层初始 z-index */
      zIndex: 2000,
      /** 组件类名前缀（配合 $namespace） */
      namespace: 'el',
      /** 按钮相关 */
      button: {
        /** 两个汉字之间是否自动插入空格 */
        autoInsertSpace: false,
      },
      /** 消息提示相关 */
      message: {
        /** 同时显示的消息最大数量 */
        max: 3,
      },
      /** 对话框相关（Element Plus >= 2.10.7） */
      dialog: {
        /** 垂直居中 */
        alignCenter: true,
        /** 可拖拽 */
        draggable: true,
        /** 拖拽时是否限制在可视区域内 */
        overflow: false,
      },
    },
  },

  /**
   * 对象存储 / 文件服务
   * 敏感密钥勿放前端明文，正式环境应由后端代理或下发临时凭证
   */
  storage: {
    minio: {
      endpoint: '',
      bucket: '',
      region: '',
    },
  },
}

export type AppConfig = typeof appConfig

/** 解析给 el-config-provider 使用的 props */
export function getElementPlusProviderProps(config: AppConfig = appConfig) {
  const ep = config.ui.elementPlus
  return {
    locale: elementPlusLocales[ep.locale] ?? zhCn,
    size: ep.size,
    zIndex: ep.zIndex,
    namespace: ep.namespace,
    button: ep.button,
    message: ep.message,
    dialog: ep.dialog,
  }
}

/** 更新浏览器标签页 favicon */
function applyFavicon(href: string) {
  const path = href.trim()
  if (!path) return

  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : 'image/x-icon'
  link.href = path
}

/** 将可影响样式的配置写入 CSS 变量，供全局样式读取 */
export function applyAppConfig(config: AppConfig = appConfig) {
  document.title = config.app.name
  applyFavicon(config.app.favicon)

  const root = document.documentElement
  const { dialog, fontSize, tagsView } = config.ui
  root.style.setProperty('--app-dialog-max-height', dialog.maxHeight)
  root.style.setProperty('--app-font-size-sidebar', fontSize.sidebar)
  root.style.setProperty('--app-font-size-header', fontSize.header)
  root.style.setProperty('--app-font-size-tags-view', fontSize.tagsView)
  root.style.setProperty('--app-font-size-main', fontSize.main)
  root.style.setProperty('--app-tags-view-height', tagsView.height)
  if (config.app.logoWidth != null) {
    root.style.setProperty('--app-logo-width', `${config.app.logoWidth}px`)
  } else {
    root.style.removeProperty('--app-logo-width')
  }
  if (config.app.logoHeight != null) {
    root.style.setProperty('--app-logo-height', `${config.app.logoHeight}px`)
  } else {
    root.style.removeProperty('--app-logo-height')
  }

  // 布局配色（完整状态由 theme store.applyCurrent 再同步一次）
  let source: ThemeSource = DEFAULT_THEME_SOURCE
  let themeId = DEFAULT_THEME_ID
  let appearance: AppearanceMode = 'light'
  let customParts: CustomThemeParts = { ...DEFAULT_CUSTOM_PARTS }
  let mainBgImage: string | null = null
  try {
    const rawSource = localStorage.getItem('xn-theme-source')
    if (rawSource === 'appearance' || rawSource === 'custom' || rawSource === 'preset') {
      source = rawSource
    } else if (localStorage.getItem('xn-theme-id') === 'custom') {
      source = 'custom'
    }
    const rawId = localStorage.getItem('xn-theme-id') || DEFAULT_THEME_ID
    themeId = rawId === 'custom' ? DEFAULT_THEME_ID : rawId
    appearance = (localStorage.getItem('xn-appearance') as AppearanceMode) || 'light'
    const rawParts = localStorage.getItem('xn-theme-custom')
    if (rawParts) customParts = { ...DEFAULT_CUSTOM_PARTS, ...JSON.parse(rawParts) }
    mainBgImage = localStorage.getItem('xn-main-bg-image')
  } catch {
    /* ignore */
  }
  const active = resolveActiveTheme({ source, themeId, appearance, customParts })
  applyLayoutTheme(active.colors, {
    appearance: source === 'appearance' ? appearance : 'light',
    mainBgImage: source === 'custom' ? mainBgImage : null,
  })
}

export interface ApplyLayoutThemeOptions {
  appearance?: AppearanceMode
  mainBgImage?: string | null
}

/** 应用侧栏 / 顶栏 / 主色主题到 CSS 变量（含 Element Plus） */
export function applyLayoutTheme(
  colors: ThemeColors,
  options: ApplyLayoutThemeOptions = {},
) {
  const appearance = options.appearance ?? 'light'
  const mainBgImage = options.mainBgImage ?? null
  const root = document.documentElement
  const dark = appearance === 'dark'

  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'

  const s = colors.sidebar
  root.style.setProperty('--app-sidebar-bg', s.bg)
  root.style.setProperty('--app-sidebar-bg-elevated', s.bgElevated)
  root.style.setProperty('--app-sidebar-text', s.text)
  root.style.setProperty('--app-sidebar-text-active', s.textActive)
  root.style.setProperty('--app-sidebar-active', s.active)
  root.style.setProperty('--app-sidebar-active-bg', s.activeBg)
  root.style.setProperty('--app-sidebar-hover-bg', s.hoverBg)
  root.style.setProperty('--app-sidebar-border', s.border)
  root.style.setProperty('--app-sidebar-rail-bg', s.railBg)

  const h = colors.header
  root.style.setProperty('--app-header-bg', h.bg)
  root.style.setProperty('--app-header-text', h.text)
  root.style.setProperty('--app-header-border', h.border)

  const scale = buildPrimaryScale(colors.primary)
  root.style.setProperty('--app-color-primary', scale.primary)
  root.style.setProperty('--app-color-primary-light-3', scale['light-3'])
  root.style.setProperty('--app-color-primary-light-5', scale['light-5'])
  root.style.setProperty('--app-color-primary-light-7', scale['light-7'])
  root.style.setProperty('--app-color-primary-light-8', scale['light-8'])
  root.style.setProperty('--app-color-primary-light-9', scale['light-9'])
  root.style.setProperty('--app-color-primary-dark-2', scale['dark-2'])
  root.style.setProperty('--app-color-primary-rgb', scale.rgb)

  // 同步 Element Plus：xnButton / xnSearch / xnTable / TreePanel 等自动跟随
  root.style.setProperty('--el-color-primary', scale.primary)
  root.style.setProperty('--el-color-primary-light-3', scale['light-3'])
  root.style.setProperty('--el-color-primary-light-5', scale['light-5'])
  root.style.setProperty('--el-color-primary-light-7', scale['light-7'])
  root.style.setProperty('--el-color-primary-light-8', scale['light-8'])
  root.style.setProperty('--el-color-primary-light-9', scale['light-9'])
  root.style.setProperty('--el-color-primary-dark-2', scale['dark-2'])
  root.style.setProperty('--el-color-primary-rgb', scale.rgb)

  if (dark) {
    root.style.setProperty('--app-page-bg', '#0a0a0a')
    root.style.setProperty('--app-main-bg', '#141414')
    root.style.setProperty('--app-card-bg', '#1d1e1f')
    root.style.setProperty('--app-fill-color', '#262727')
    root.style.setProperty('--app-tags-bg', '#1d1e1f')
    root.style.setProperty('--app-tags-border', '#414243')
    root.style.setProperty('--app-tags-item-bg', '#1d1e1f')
    root.style.setProperty('--app-tags-item-text', '#a3a6ad')
    root.style.setProperty('--app-tags-item-hover-bg', mixHex(colors.primary, '#000000', 0.55))
    root.style.setProperty('--app-tags-item-active-bg', scale.primary)
    root.style.setProperty('--app-tags-item-active-text', '#ffffff')
    root.style.setProperty('--app-tags-scrollbar', '#4c4d4f')
    root.style.setProperty('--app-border-color', '#414243')
    root.style.setProperty('--app-text-muted', '#a3a6ad')
    root.style.setProperty('--app-text-primary', '#e5eaf3')
    root.style.setProperty('--app-surface-soft', mixHex(colors.primary, '#000000', 0.7))
    root.style.setProperty('--app-surface-soft-border', mixHex(colors.primary, '#000000', 0.4))
    root.style.setProperty('--app-card-hover-border', mixHex(colors.primary, '#000000', 0.25))
  } else {
    root.style.setProperty('--app-page-bg', '#f5f7fa')
    root.style.setProperty('--app-main-bg', '#f5f7fa')
    root.style.setProperty('--app-card-bg', '#ffffff')
    root.style.setProperty('--app-fill-color', '#fafbfc')
    root.style.setProperty('--app-tags-bg', '#ffffff')
    root.style.setProperty('--app-tags-border', '#ebeef5')
    root.style.setProperty('--app-tags-item-bg', '#ffffff')
    root.style.setProperty('--app-tags-item-text', '#606266')
    root.style.setProperty('--app-tags-item-hover-bg', scale['light-9'])
    root.style.setProperty('--app-tags-item-active-bg', scale.primary)
    root.style.setProperty('--app-tags-item-active-text', '#ffffff')
    root.style.setProperty('--app-tags-scrollbar', '#dcdfe6')
    root.style.setProperty('--app-border-color', '#ebeef5')
    root.style.setProperty('--app-text-muted', '#909399')
    root.style.setProperty('--app-text-primary', '#303133')
    root.style.setProperty('--app-surface-soft', scale['light-9'])
    root.style.setProperty('--app-surface-soft-border', scale['light-5'])
    root.style.setProperty('--app-card-hover-border', mixHex(colors.primary, '#ffffff', 0.45))
  }

  if (mainBgImage) {
    root.style.setProperty('--app-main-bg-image', `url("${mainBgImage}")`)
  } else {
    root.style.setProperty('--app-main-bg-image', 'none')
  }
}