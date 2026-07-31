import type { MenuItem } from '@/types/menu'

/** 仅作结构参考；实际菜单与图标均来自后端 /api/auth/menus（sys_route.icon） */
export const menus: MenuItem[] = [
  {
    id: 'dashboard',
    title: '首页',
    path: '/dashboard',
    permission: 'menu:dashboard',
    affix: true,
  },
  {
    id: 'personal',
    title: '个人中心',
    permission: 'menu:personal',
    children: [
      {
        id: 'profile',
        title: '个人信息',
        path: '/profile',
        permission: 'menu:profile',
      },
    ],
  },
  {
    id: 'monitor',
    title: '系统监控',
    permission: 'menu:monitor',
    children: [
      {
        id: 'monitor-online',
        title: '在线用户',
        path: '/monitor/online',
        permission: 'menu:monitor:online',
      },
      {
        id: 'monitor-server',
        title: '服务监控',
        path: '/monitor/server',
        permission: 'menu:monitor:server',
      },
      {
        id: 'logs',
        title: '日志管理',
        permission: 'menu:monitor:logs',
        children: [
          {
            id: 'login-log',
            title: '登录日志',
            path: '/system/logs/login',
            permission: 'menu:system:login-log',
          },
          {
            id: 'oper-log',
            title: '操作日志',
            path: '/system/logs/oper',
            permission: 'menu:system:oper-log',
          },
        ],
      },
    ],
  },
  {
    id: 'system',
    title: '系统管理',
    permission: 'menu:system',
    children: [
      {
        id: 'org',
        title: '组织与账号',
        permission: 'menu:system:org',
        children: [
          {
            id: 'user',
            title: '用户管理',
            path: '/users',
            permission: 'menu:system:user',
          },
          {
            id: 'unit',
            title: '单位管理',
            path: '/system/units',
            permission: 'menu:system:unit',
          },
        ],
      },
      {
        id: 'rbac',
        title: '权限与安全',
        permission: 'menu:system:rbac',
        children: [
          {
            id: 'role-list',
            title: '角色列表',
            path: '/system/roles',
            permission: 'menu:system:role',
          },
          {
            id: 'permission',
            title: '角色权限',
            path: '/system/permissions',
            permission: 'menu:system:permission',
          },
          {
            id: 'permission-content',
            title: '权限内容',
            path: '/system/permissions-content',
            permission: 'menu:system:permission-content',
          },
          {
            id: 'route',
            title: '路由管理',
            path: '/system/routes',
            permission: 'menu:system:route',
          },
        ],
      },
      {
        id: 'content',
        title: '内容运营',
        permission: 'menu:system:content',
        children: [
          {
            id: 'notice',
            title: '公告管理',
            path: '/system/notices',
            permission: 'menu:system:notice',
          },
        ],
      },
      {
        id: 'dict',
        title: '字典管理',
        path: '/system/dicts',
        permission: 'menu:system:dict',
      },
    ],
  },
]
