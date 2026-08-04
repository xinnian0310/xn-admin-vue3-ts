import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import {
  getApiRegistry,
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  updateCurrentUser,
} from '@/api/auth'
import type { ProfileUpdatePayload } from '@/api/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tagsView'
import { resetDynamicRoutes } from '@/utils/route-register'
import { clearApiRegistry, setApiRegistry } from '@/utils/api-guard'
import { normalizeDateTimes } from '@/utils/datetime'
import { useNoticeStore } from '@/stores/notice'
import { startSessionGuard, stopSessionGuard } from '@/utils/session-guard'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(getStoredUser())
  const permissionStore = usePermissionStore()

  function getStoredUser(): User | null {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      const parsed = normalizeDateTimes(JSON.parse(raw) as User)
      if (parsed.roles && parsed.permissions) {
        permissionStore.setAuthData(parsed.roles, parsed.permissions)
      }
      return parsed
    } catch {
      return null
    }
  }

  function clearSessionViews() {
    useTagsViewStore().resetViews()
  }

  function setAuth(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    permissionStore.setAuthData(newUser.roles || [], newUser.permissions || [])
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    permissionStore.clear()
    clearApiRegistry()
  }

  async function loadRegistry() {
    try {
      const res = await getApiRegistry()
      setApiRegistry(res.data)
    } catch (error) {
      console.warn('[api-guard] 加载权限内容注册表失败', error)
    }
  }

  async function login(
    username: string,
    password: string,
    captcha?: { captchaId?: string; captchaCode?: string },
  ) {
    clearSessionViews()
    // 重新登录必须重置动态路由/菜单，否则会沿用内存里旧菜单树（看不到新加的「代码生成」等）
    resetDynamicRoutes()
    const res = await loginApi({
      username,
      password,
      captchaId: captcha?.captchaId,
      captchaCode: captcha?.captchaCode,
    })
    setAuth(res.data.token, res.data.user)
    await loadRegistry()
    startSessionGuard()
    return res.data
  }

  /** 滑动续期：仅更新 token（及用户信息），不清空标签 */
  async function refreshToken() {
    const res = await refreshTokenApi()
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    if (res.data.user) {
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify(res.data.user))
      permissionStore.setAuthData(res.data.user.roles || [], res.data.user.permissions || [])
    }
    return res.data
  }

  async function fetchProfile() {
    const res = await getCurrentUser()
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    permissionStore.setAuthData(res.data.roles || [], res.data.permissions || [])
    return res.data
  }

  async function updateProfile(payload: ProfileUpdatePayload) {
    const res = await updateCurrentUser(payload)
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    permissionStore.setAuthData(res.data.roles || [], res.data.permissions || [])
    return res.data
  }

  /**
   * 退出登录。先清理本地态（保证可立即跳转登录页），再尽力通知服务端拉黑 token。
   * @param remote 是否调用服务端 /auth/logout；401 场景应传 false
   */
  async function logout(remote = true) {
    const currentToken = token.value
    stopSessionGuard()
    useNoticeStore().stopRealtime()
    clearSessionViews()
    clearAuth()
    resetDynamicRoutes()

    if (remote && currentToken) {
      try {
        await logoutApi(currentToken)
      } catch {
        // 本地已退出，忽略服务端失败
      }
    }
  }

  return {
    token,
    user,
    login,
    refreshToken,
    fetchProfile,
    updateProfile,
    loadRegistry,
    logout,
    clearAuth,
  }
})
