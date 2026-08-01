import axios from 'axios'
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { isApiRegistered, isRegistryLoaded, isWhitelisted } from '@/utils/api-guard'
import { normalizeDateTimes } from '@/utils/datetime'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

const warnedApis = new Set<string>()

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const method = (config.method ?? 'get').toUpperCase()
  const rawUrl = config.url ?? ''
  const path = (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`).split('?')[0]
  const fullPath = `/api${path}`

  // 未在「权限内容」登记的接口一律拦截（开发/生产一致）
  if (isRegistryLoaded() && !isWhitelisted(fullPath) && !isApiRegistered(method, fullPath)) {
    const key = `${method} ${fullPath}`
    if (!warnedApis.has(key)) {
      warnedApis.add(key)
      ElMessage.error(`接口未在权限内容中登记，无法访问：${key}`)
    }
    return Promise.reject(new Error(`接口未登记，已拦截：${key}`))
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 统一把 ISO 时间串格式化为 YYYY-MM-DD HH:mm:ss，避免页面直接展示 T/毫秒
    if (res.data !== undefined) {
      res.data = normalizeDateTimes(res.data)
    }
    return res
  },
  (error) => {
    const status = error.response?.status as number | undefined
    if (status === 401) {
      void import('@/stores/user').then(({ useUserStore }) => {
        useUserStore().logout(false)
      })
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else if (status === 403) {
      ElMessage.error(error.response?.data?.message || '无权限')
    } else if (status === 423 || status === 429) {
      ElMessage.error(error.response?.data?.message || (status === 429 ? '请求过于频繁' : '账号已锁定'))
    } else {
      const message = error.response?.data?.message || error.message || '网络错误'
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export default request
