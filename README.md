# xn-admin-vue3-ts

心念后台管理系统前端：Vue 3 + TypeScript + Vite + Element Plus。

对接后端 [`xn-admin-server`](../xn-admin-server/)，提供 JWT 登录、RBAC、动态路由/菜单、page-ui 驱动 CRUD、主题、通知与系统监控等能力。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5、TypeScript 6、Vite 8 |
| UI | Element Plus、@element-plus/icons-vue、Iconify |
| 状态 / 路由 | Pinia、Vue Router 5 |
| 请求 | Axios |
| 图表 / 编辑器 | ECharts、wangEditor |
| Excel | ExcelJS、xlsx |

## 快速启动

要求：Node.js 18+

```bash
npm install
npm run dev
```

开发地址：http://localhost:8848

Vite 已代理：

| 前缀 | 目标 |
|------|------|
| `/api` | `http://localhost:8080` |
| `/uploads` | `http://localhost:8080` |
| `/ws` | `http://localhost:8080`（WebSocket） |

```bash
npm run build    # vue-tsc + vite build
npm run preview  # 预览构建产物
```

## 目录结构

```
src/
├── api/            # 接口模块（auth、user、role、route、notice…）
├── components/     # 通用组件（各目录含 README.md）
├── composables/    # usePageUi、useCrudApi
├── config/         # 应用 / 菜单 / 主题 / 首页配置
├── directives/     # v-permission
├── layouts/        # AdminLayout 及 Side / Top / Mix / Columns
├── router/         # 静态路由 + 动态注册与守卫
├── stores/         # user、permission、menu、tagsView、theme、notice
├── types/          # 类型定义
├── utils/          # request、icons、excel、route-register…
└── views/          # 业务页面
```

## 通用组件

每个组件目录下有独立文档，入口如下：

| 组件 | 说明 | 文档 |
|------|------|------|
| AppIcon | 统一图标（Element / Iconify / SVG） | [README](./src/components/AppIcon/README.md) |
| AppBrandLogo | 品牌 Logo | [README](./src/components/AppBrandLogo/README.md) |
| IconPicker | 图标选择器 | [README](./src/components/IconPicker/README.md) |
| NoticeInbox | 消息中心抽屉 | [README](./src/components/NoticeInbox/README.md) |
| PageLayout | 列表页骨架 | [README](./src/components/PageLayout/README.md) |
| RichEditor | 富文本编辑器 | [README](./src/components/RichEditor/README.md) |
| SidebarMenu | 多级菜单 | [README](./src/components/SidebarMenu/README.md) |
| TagsView | 页面标签栏 | [README](./src/components/TagsView/README.md) |
| ThemePicker | 主题设置 | [README](./src/components/ThemePicker/README.md) |
| TreePanel | 左侧树面板 | [README](./src/components/TreePanel/README.md) |
| xnButton | 工具栏 / 行操作按钮 | [README](./src/components/xnButton/README.md) |
| xnImport | Excel 导入对话框 | [README](./src/components/xnImport/README.md) |
| xnSearch | 配置化搜索表单 | [README](./src/components/xnSearch/README.md) |
| xnTable | 配置化表格 | [README](./src/components/xnTable/README.md) |

典型列表页组合：

```
PageLayout
├── #aside → TreePanel（可选）
├── #search → xnSearch
├── #toolbar → xnButton
└── #table → xnTable
```

配置通常来自后端 page-ui（`usePageUi`）与路由权限。

## 功能概览

- JWT 登录与会话刷新；`v-permission` 按钮级权限
- 动态菜单 / 路由注册（后端路由 + 视图懒加载）
- 角色、权限、用户、单位、字典、公告、登录页配置
- 页面标签栏、多布局模式、主题（含自定义色与背景）
- 表格列个性化、Excel 导入导出
- 在线用户 / 服务监控、登录与操作日志
- 公告 WebSocket 推送（`/ws`）

## 环境与约定

- 路径别名：`@` → `src/`
- 鉴权 Token 由 `utils/request` 注入；未登录跳转登录页
- CRUD 列表优先用 `xnTable` 的 `api` 模式对接 `src/api/*.ts` 标准接口

更完整的仓库说明见 [根 README](../README.md)。
