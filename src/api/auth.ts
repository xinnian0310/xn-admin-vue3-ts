import request from '@/utils/request'
import type { ApiResponse, LoginResult, User } from '@/types'

export function login(username: string, password: string) {
  return request.post<any, ApiResponse<LoginResult>>('/auth/login', { username, password })
}

/** 滑动续期：换发新 JWT */
export function refreshToken() {
  return request.post<any, ApiResponse<LoginResult>>('/auth/refresh')
}

export function getCurrentUser() {
  return request.get<any, ApiResponse<User>>('/auth/me')
}

export interface ProfileUpdatePayload {
  nickname?: string
  email?: string
  phone?: string
  password?: string
}

export function updateCurrentUser(data: ProfileUpdatePayload) {
  return request.put<any, ApiResponse<User>>('/auth/me', data)
}

export function getAuthMenus() {
  return request.get<any, ApiResponse<import('@/types').SysRoute[]>>('/auth/menus')
}

export interface ApiRegistry {
  apis: { method: string; path: string }[]
  codes: string[]
}

export function getApiRegistry() {
  return request.get<any, ApiResponse<ApiRegistry>>('/auth/api-registry')
}
