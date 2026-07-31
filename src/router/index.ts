import { createRouter, createWebHistory } from 'vue-router'
import '@/types/menu'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useMenuStore } from '@/stores/menu'
import { useTagsViewStore } from '@/stores/tagsView'
import { registerDynamicRoutes } from '@/utils/route-register'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'AdminLayout',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', affix: true, permission: 'menu:dashboard' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '个人信息', hidden: true },
        },
        {
          path: '403',
          name: 'Forbidden',
          component: () => import('@/views/error/ForbiddenView.vue'),
          meta: { title: '无权限', hidden: true },
        },
        {
          path: 'redirect/:path(.*)',
          name: 'Redirect',
          component: () => import('@/views/redirect/index.vue'),
          meta: { hidden: true, noCache: true },
        },
      ],
    },
    // 注意：通配 404 不在此静态声明。
    // 若在动态路由注册前就 redirect 到 /403，硬刷新深层页面会丢失原始路径。
    // 通配路由在 registerDynamicRoutes 完成后再挂载。
  ],
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const menuStore = useMenuStore()

  if (!to.meta.public && !userStore.token) {
    return '/login'
  }
  if (to.path === '/login' && userStore.token) {
    return '/dashboard'
  }

  // 先注册动态路由，再决定是否无权限（避免硬刷时被通配路由抢先打到 403）
  if (!to.meta.public && userStore.token && !menuStore.routesRegistered) {
    await registerDynamicRoutes(router)
    return {
      path: to.path,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }

  if (to.path === '/403') {
    return true
  }

  // 动态路由注册后仍未匹配到任何页面
  if (to.name === 'NotFound' || to.matched.length === 0) {
    return '/403'
  }

  if (to.meta.public || !to.meta.permission) {
    return true
  }

  if (userStore.token) {
    try {
      const needsRefresh =
        !permissionStore.permissions.length ||
        !userStore.user?.roles?.length ||
        !userStore.user?.permissions?.length
      if (needsRefresh) {
        await userStore.fetchProfile()
      }
    } catch {
      // 获取用户信息失败（token 失效/过期），清除登录态避免 /login 与目标页互相跳转死循环
      userStore.logout()
      return '/login'
    }
  }

  if (permissionStore.isSuperAdmin || permissionStore.hasPermission(to.meta.permission as string)) {
    return true
  }

  return '/403'
})

router.afterEach((to) => {
  const tagsViewStore = useTagsViewStore()
  tagsViewStore.initTags()
  tagsViewStore.addView(to)
})

export default router
