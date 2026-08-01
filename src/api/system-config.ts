import axios from 'axios'
import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { AppConfig } from '@/config/app'

/** 后端系统配置（不含 theme 色） */
export type SystemConfigPayload = {
  app: AppConfig['app']
  session: AppConfig['session']
  ui: {
    dialog: AppConfig['ui']['dialog']
    layout: { mode: AppConfig['ui']['layout']['mode'] }
    fontSize: AppConfig['ui']['fontSize']
    tagsView: AppConfig['ui']['tagsView']
    elementPlus: AppConfig['ui']['elementPlus']
  }
  storage: AppConfig['storage']
  logRetention: AppConfig['logRetention']
}

/** 公开配置（登录前，无需鉴权） */
export function getPublicConfig() {
  return axios
    .get<any, ApiResponse<SystemConfigPayload>>('/api/system-config/public', { timeout: 10000 })
    .then((res) => {
      const data = res.data as ApiResponse<SystemConfigPayload>
      if (data.code !== 200) {
        return Promise.reject(new Error(data.message || '获取系统配置失败'))
      }
      return data
    })
}

export function getSystemConfig() {
  return request.get<any, ApiResponse<SystemConfigPayload>>('/system-config')
}

export function updateSystemConfig(data: SystemConfigPayload) {
  return request.put<any, ApiResponse<SystemConfigPayload>>('/system-config', data)
}

export function uploadBrandAsset(file: File) {
  const form = new FormData()
  form.append('file', file)
  return request.post<any, ApiResponse<{ url: string }>>('/system-config/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
