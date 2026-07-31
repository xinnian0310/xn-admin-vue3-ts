import type { Component } from 'vue'
import { markRaw } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

export type IconType = 'element' | 'iconify' | 'svg'

export interface ParsedIcon {
  type: IconType
  /** 用于存储/回显的完整值，如 Setting / mdi:home / svg:demo-star */
  value: string
  /** Element 组件名 / Iconify 名 / SVG 文件名（不含扩展名） */
  name: string
}

const elementIconMap = ElementPlusIcons as Record<string, Component>

/** 本地 SVG：src/assets/icons/*.svg */
const svgModules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svgRawMap = new Map<string, string>()
for (const [path, raw] of Object.entries(svgModules)) {
  const file = path.split('/').pop() || ''
  const name = file.replace(/\.svg$/i, '')
  if (name) svgRawMap.set(name, raw)
}

/** 兼容历史数据：无前缀视为 Element 图标名 */
export function parseIcon(value?: string | null): ParsedIcon | null {
  if (!value?.trim()) return null
  const raw = value.trim()

  if (raw.startsWith('svg:')) {
    return { type: 'svg', value: raw, name: raw.slice(4) }
  }
  if (raw.startsWith('element:') || raw.startsWith('ep:')) {
    const name = raw.includes(':') ? raw.slice(raw.indexOf(':') + 1) : raw
    return { type: 'element', value: name, name }
  }
  // Iconify 常见格式 collection:name
  if (raw.includes(':')) {
    return { type: 'iconify', value: raw, name: raw }
  }
  return { type: 'element', value: raw, name: raw }
}

export function resolveElementIcon(name?: string): Component | undefined {
  if (!name) return undefined
  const comp = elementIconMap[name]
  return comp ? markRaw(comp) : undefined
}

/** @deprecated 兼容旧调用，仅解析 Element 图标 */
export function resolveIcon(name?: string): Component | undefined {
  const parsed = parseIcon(name)
  if (!parsed || parsed.type !== 'element') return undefined
  return resolveElementIcon(parsed.name)
}

export function listElementIconNames(): string[] {
  return Object.keys(elementIconMap).sort((a, b) => a.localeCompare(b))
}

export function listSvgIconNames(): string[] {
  return Array.from(svgRawMap.keys()).sort((a, b) => a.localeCompare(b))
}

export function getSvgRaw(name: string): string | undefined {
  return svgRawMap.get(name)
}

export function buildIconValue(type: IconType, name: string): string {
  const n = name.trim()
  if (!n) return ''
  if (type === 'svg') return `svg:${n.replace(/^svg:/, '')}`
  if (type === 'iconify') return n
  // Element：存裸名，兼容历史菜单数据
  return n.replace(/^(element|ep):/, '')
}

/** 后台常用 Iconify 预设（可按需扩展） */
export const ICONIFY_PRESETS: string[] = [
  'mdi:home',
  'mdi:view-dashboard',
  'mdi:account',
  'mdi:account-group',
  'mdi:shield-account',
  'mdi:lock',
  'mdi:key',
  'mdi:cog',
  'mdi:menu',
  'mdi:file-tree',
  'mdi:routes',
  'mdi:database',
  'mdi:cloud',
  'mdi:server',
  'mdi:bell',
  'mdi:chart-box',
  'mdi:clipboard-list',
  'mdi:folder',
  'carbon:settings',
  'carbon:user-multiple',
  'carbon:security',
  'carbon:api',
  'ri:dashboard-line',
  'ri:settings-3-line',
  'ri:shield-keyhole-line',
  'ri:route-line',
]

export { elementIconMap as iconMap }
