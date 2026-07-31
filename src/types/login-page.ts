export type LoginCaptchaType = 'IMAGE' | 'SLIDER'

/** 背景适应：覆盖铺满 / 完整适应 / 拉伸填满 / 居中原图 */
export type LoginBackgroundFit = 'COVER' | 'CONTAIN' | 'STRETCH' | 'CENTER'

export interface LoginPageConfig {
  id: number
  name: string
  backgroundUrl?: string | null
  backgroundFit?: LoginBackgroundFit | null
  /** 为空表示默认居中 */
  boxX?: number | null
  boxY?: number | null
  captchaEnabled: boolean
  captchaType?: LoginCaptchaType | null
  status: number
  remark?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginPageConfigForm {
  name: string
  backgroundUrl?: string
  backgroundFit: LoginBackgroundFit
  boxX?: number | null
  boxY?: number | null
  captchaEnabled: boolean
  captchaType?: LoginCaptchaType | ''
  status: number
  remark?: string
}

export const BACKGROUND_FIT_OPTIONS: { value: LoginBackgroundFit; label: string; tip: string }[] = [
  { value: 'COVER', label: '覆盖铺满', tip: '保持比例铺满可视区，多余部分裁切' },
  { value: 'CONTAIN', label: '完整适应', tip: '保持比例完整显示，可能留白' },
  { value: 'STRETCH', label: '拉伸填满', tip: '不保持比例，强制拉满可视区' },
  { value: 'CENTER', label: '居中原图', tip: '按原始尺寸居中显示' },
]

export function resolveBackgroundSize(fit?: string | null): string {
  switch (fit) {
    case 'CONTAIN':
      return 'contain'
    case 'STRETCH':
      return '100% 100%'
    case 'CENTER':
      return 'auto'
    case 'COVER':
    default:
      return 'cover'
  }
}
