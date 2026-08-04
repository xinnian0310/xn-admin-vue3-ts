/**
 * 首页展示配置
 *
 * 首页为纯静态介绍页，内容集中在此维护：
 * - 框架简介 / 技术选型 / 联系信息 / 更新日志 / 捐赠情况
 * 修改文案、增删更新日志或捐赠记录，只需改本文件。
 */

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

export interface ChangelogEntry {
  version: string
  date: string
  items: { type: ChangelogType; text: string }[]
}

export interface DonationItem {
  name: string
  amount: number
  date: string
  message?: string
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
    title: '心念科技',
    version: 'v1.3.0',
    description:
      '心念科技，以“心有所念，码有所成”为理念，专注于IT开发与软件创新。我们致力于将每一个想法转化为可靠的软件产品，通过技术赋能企业数字化发展，提供软件定制开发、系统建设、小程序开发及智能化应用解决方案。心有所念，技术同行，让每一个创意都拥有实现的可能。',
    features: [
      {
        icon: 'Lock',
        title: 'RBAC 权限',
        desc: '用户 / 角色 / 单位 / 权限内容四级模型，接口与按钮级管控',
      },
      { icon: 'Guide', title: '动态路由', desc: '菜单与路由由后端下发，前端零改动即可增删页面' },
      { icon: 'Monitor', title: '系统监控', desc: '在线用户、服务器 CPU / 内存 / 磁盘实时可视' },
      { icon: 'Bell', title: '消息公告', desc: 'WebSocket 实时推送，已读回执与站内信一体' },
    ] as HomeFeature[],
  },

  frontendTech: [
    { name: 'Vue', version: '3.5', desc: '渐进式前端框架，Composition API' },
    { name: 'Vite', version: '8.x', desc: '新一代前端构建工具' },
    { name: 'Element Plus', version: '2.14', desc: '桌面端组件库' },
    { name: 'Pinia', version: '3.x', desc: '轻量状态管理' },
    { name: 'Vue Router', version: '5.x', desc: '官方路由，支持动态注册' },
    { name: 'ECharts', version: '6.x', desc: '数据可视化图表库' },
    { name: 'TypeScript', version: '6.x', desc: '类型安全的 JavaScript 超集' },
    { name: 'Axios', version: '1.x', desc: 'HTTP 请求库' },
  ] as TechItem[],

  backendTech: [
    { name: 'Spring Boot', version: '3.x', desc: '主流企业级 Java 应用框架' },
    { name: 'Java', version: '17', desc: 'LTS 长期支持版本' },
    { name: 'Spring Security', version: '6.x', desc: '认证与授权' },
    { name: 'Spring Data JPA', version: '3.x', desc: 'ORM 持久层' },
    { name: 'MySQL', version: '8.x', desc: '关系型数据库' },
    { name: 'JWT', version: '-', desc: '无状态令牌鉴权' },
    { name: 'WebSocket', version: '-', desc: '公告实时推送' },
    { name: 'Maven', version: '3.x', desc: '依赖与构建管理' },
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

  changelog: [
    {
      version: 'v1.3.0',
      date: '2026-07-30',
      items: [
        { type: 'feature', text: '工作台改版为首页，新增框架 / 技术选型 / 更新日志 / 捐赠展示' },
        { type: 'feature', text: '新增「系统监控」模块：在线用户、服务监控（CPU / 内存 / 磁盘）' },
        { type: 'refactor', text: '侧边栏菜单顺序与图标优化' },
      ],
    },
    {
      version: 'v1.2.0',
      date: '2026-06-18',
      items: [
        { type: 'feature', text: '新增单位管理与单位默认角色' },
        { type: 'feature', text: '公告管理支持 WebSocket 实时推送与已读回执' },
        { type: 'fix', text: '修复权限内容页表格按钮重复登记问题' },
      ],
    },
    {
      version: 'v1.1.0',
      date: '2026-05-09',
      items: [
        { type: 'feature', text: '页面标签栏（xnTagsView）与多种布局模式' },
        { type: 'refactor', text: '主题系统重构，支持一键换肤' },
      ],
    },
    {
      version: 'v1.0.0',
      date: '2026-04-01',
      items: [{ type: 'feature', text: 'RBAC 权限体系与动态路由首个正式版本发布' }],
    },
  ] as ChangelogEntry[],

  donation: {
    /** 收款码图片放 public/ 下，留空则显示占位提示 */
    qrcode: '',
    tip: '如果这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕',
    donors: [
      { name: '张**', amount: 66, date: '2026-07-20', message: '好用，支持一下！' },
      { name: '李**', amount: 20, date: '2026-07-12' },
      { name: '匿名', amount: 100, date: '2026-06-28', message: '感谢开源' },
      { name: '王**', amount: 8.8, date: '2026-06-15' },
      { name: '赵**', amount: 50, date: '2026-05-30', message: '加油' },
    ] as DonationItem[],
  },
}

export type HomeConfig = typeof homeConfig
