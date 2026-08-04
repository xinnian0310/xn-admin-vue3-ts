/**
 * 首页展示配置
 *
 * 首页为纯静态介绍页，内容集中在此维护：
 * - 框架简介 / 技术选型 / 联系信息 / 捐赠情况
 * - intro.version 取自 package.json（构建时由 Vite 注入）
 * - 更新日志由 virtual:git-changelog 在构建时从 git log 同步（feat/fix/refactor）
 */

import wechatQr from '@/assets/payment-qrcode/wechat.jpg'
import alipayQr from '@/assets/payment-qrcode/alipay.jpg'

export interface HomeFeature {
  icon: string
  title: string
  desc: string
}

export interface TechItem {
  name: string
  version: string
  desc: string
}

export interface ContactItem {
  icon: string
  label: string
  value: string
  /** 可点击链接（邮箱用 mailto:，网址用 https://） */
  link?: string
}

export type ChangelogType = 'feature' | 'fix' | 'refactor'

export interface PaymentQrcode {
  label: string
  src: string
}

export const changelogTypeMeta: Record<
  ChangelogType,
  { label: string; tag: 'success' | 'warning' | 'info' }
> = {
  feature: { label: '新增', tag: 'success' },
  fix: { label: '修复', tag: 'warning' },
  refactor: { label: '优化', tag: 'info' },
}

export const homeConfig = {
  intro: {
    title: '心念后台',
    version: `v${__APP_VERSION__}`,
    description:
      '面向中后台的 Vue3 + 微服务管理脚手架：JWT 登录、RBAC 动态路由、page-ui 驱动 CRUD、多布局与主题、通知推送与系统监控一站集成，对接 xn-admin-cloud 网关即可开箱使用。',
    features: [
      {
        icon: 'Lock',
        title: 'RBAC 权限',
        desc: '用户 / 角色 / 单位 / 权限内容四级模型，接口与按钮级管控',
      },
      {
        icon: 'Guide',
        title: '动态路由',
        desc: '菜单与路由由后端下发，前端零改动即可增删页面',
      },
      {
        icon: 'Brush',
        title: '主题布局',
        desc: '预设 / 亮暗色 / 个性化配色与底图，多种布局模式随心切换',
      },
      {
        icon: 'Monitor',
        title: '系统监控',
        desc: '在线用户、服务器 CPU / 内存 / 磁盘实时可视',
      },
      {
        icon: 'Bell',
        title: '消息公告',
        desc: 'WebSocket 实时推送，已读回执与站内信一体',
      },
      {
        icon: 'Grid',
        title: 'page-ui CRUD',
        desc: '后端下发表格与表单配置，通用列表页快速落地',
      },
    ] as HomeFeature[],
  },

  frontendTech: [
    { name: 'Vue', version: '3.5', desc: '渐进式框架 · Composition API' },
    { name: 'TypeScript', version: '6.x', desc: '类型安全的 JavaScript 超集' },
    { name: 'Vite', version: '8.x', desc: '下一代前端构建与开发工具' },
    { name: 'Element Plus', version: '2.14', desc: '桌面端 Vue 组件库' },
    { name: 'Pinia', version: '4.x', desc: '官方推荐状态管理' },
    { name: 'Vue Router', version: '5.x', desc: '官方路由 · 动态注册' },
    { name: 'Axios', version: '1.x', desc: 'HTTP 请求与拦截封装' },
    { name: 'ECharts', version: '6.x', desc: '数据可视化（vue-echarts）' },
    { name: 'wangEditor', version: '5.x', desc: '富文本编辑器' },
    { name: 'Iconify', version: '5.x', desc: '图标集 · 配合 Element Icons' },
    { name: 'dayjs', version: '1.x', desc: '轻量日期时间处理' },
    { name: 'vue-i18n', version: '11.x', desc: '国际化多语言' },
    { name: 'ExcelJS / xlsx', version: '-', desc: 'Excel 导入导出' },
    { name: 'Vitest', version: '4.x', desc: '单元测试' },
    { name: 'ESLint / Prettier', version: '-', desc: '代码规范与格式化' },
    { name: 'Husky', version: '9.x', desc: 'Git hooks · commitlint' },
  ] as TechItem[],

  backendTech: [
    { name: 'Spring Boot', version: '4.1', desc: '微服务应用框架' },
    { name: 'Java', version: '21', desc: 'LTS 长期支持版本' },
    { name: 'Spring Cloud Gateway', version: '2025.1', desc: '统一网关入口' },
    { name: 'Nacos', version: '3.x', desc: '服务注册与发现' },
    { name: 'Spring Security', version: '6.x', desc: '认证与授权' },
    { name: 'Spring Data JPA', version: '4.x', desc: 'ORM 持久层' },
    { name: 'MySQL', version: '8.x', desc: '关系型数据库' },
    { name: 'Redis', version: '7.x', desc: '缓存与会话辅助' },
    { name: 'MinIO', version: '8.x', desc: '对象存储 · 文件服务' },
    { name: 'Flyway', version: '-', desc: '数据库版本迁移' },
    { name: 'Quartz', version: '-', desc: '分布式定时任务' },
    { name: 'JWT', version: '0.12', desc: '无状态令牌鉴权' },
    { name: 'WebSocket', version: '-', desc: '公告与消息实时推送' },
    { name: 'springdoc', version: '3.x', desc: 'OpenAPI / Swagger 文档' },
    { name: 'EasyExcel', version: '4.x', desc: '服务端 Excel 读写' },
    { name: 'Maven', version: '3.x', desc: '多模块依赖与构建' },
  ] as TechItem[],

  contacts: [
    { icon: 'User', label: '公司', value: '心念科技' },
    {
      icon: 'Message',
      label: '邮箱',
      value: 'support@xinnian.com',
      link: 'mailto:support@xinnian.com',
    },
    {
      icon: 'Link',
      label: '官网',
      value: 'https://xinnian.example.com',
      link: 'https://xinnian.example.com',
    },
    { icon: 'ChatDotRound', label: '交流群', value: '123456789' },
  ] as ContactItem[],

  donation: {
    tip: '如果这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕',
    qrcodes: [
      { label: '微信支付', src: wechatQr },
      { label: '支付宝', src: alipayQr },
    ] as PaymentQrcode[],
  },
}

export type HomeConfig = typeof homeConfig
