# xn-admin-vue3-ts

心念后台管理系统前端：Vue 3 + TypeScript + Vite + Element Plus。

对接微服务后端 [`xn-admin-cloud`](../xn-admin-cloud/)（经网关 `8088`），提供 JWT 登录、RBAC、动态路由/菜单、page-ui 驱动 CRUD、主题、通知与系统监控等能力。

## 质量检查

```bash
npm run lint          # ESLint：代码规范与潜在问题检查
npm run typecheck     # TypeScript / vue-tsc：仅做类型检查，不产出构建
npm run test          # Vitest：跑单元测试（非 watch）
npm run ci            # 全量检查：typecheck + lint + format:check + test + build
```

提交前会经 Husky 跑 lint-staged（ESLint 修复 + Prettier 格式化）；提交信息需符合 [Conventional Commits](https://www.conventionalcommits.org/)（如 `feat: xxx`）。Gitee Go 流水线见 `.workflow/ci.yml`。

在 Cursor / VS Code 中打开本仓库并安装推荐扩展后：**保存文件会自动 Prettier 格式化，并执行 ESLint 可自动修复项**（见 `.vscode/settings.json`）。

## 技术栈

| 类别          | 技术                                                     |
| ------------- | -------------------------------------------------------- |
| 框架          | Vue 3.5、TypeScript 6、Vite 8                            |
| UI            | Element Plus、@element-plus/icons-vue、Iconify           |
| 状态 / 路由   | Pinia 4、Vue Router 5                                    |
| 请求          | Axios                                                    |
| 图表 / 编辑器 | ECharts、wangEditor                                      |
| Excel         | ExcelJS、xlsx                                            |
| 工程化        | ESLint、Prettier、Vitest、Husky、lint-staged、commitlint |

## 快速启动

要求：Node.js 20+（见 `.nvmrc`）

```bash
npm install           # 安装依赖
npm run dev           # 启动开发服务
```

开发地址：http://localhost:5173

Vite 已代理到网关：

| 前缀       | 目标                                 |
| ---------- | ------------------------------------ |
| `/api`     | `http://localhost:8088`              |
| `/uploads` | `http://localhost:8088`              |
| `/ws`      | `http://localhost:8088`（WebSocket） |

```bash
npm run build         # vue-tsc 类型检查 + vite 生产构建
npm run preview       # 本地预览构建产物
npm run format        # Prettier：格式化代码
npm run format:check  # Prettier：仅检查格式，不改文件
npm run lint:fix     # ESLint：自动修复可修复项
npm run test:watch    # Vitest：watch 模式
```

## 目录结构

```
src/
├── api/            # 接口模块（auth、user、role、route、notice、logs…）
├── components/     # 通用组件（各目录含 README.md）
├── composables/    # usePageUi、useCrudApi
├── config/         # 应用 / 菜单 / 主题 / 首页配置
├── directives/     # v-permission
├── layouts/        # AdminLayout 及 Side / Top / Mix / Columns
├── router/         # 静态路由 + 动态注册与守卫
├── stores/         # user、permission、menu、tagsView、theme、notice
├── types/          # 类型定义
├── utils/          # request、icons、excel、download、route-register…
└── views/          # 业务页面（含 system/logs 登录/操作/异常日志）
```

## 通用组件

每个组件目录下有独立文档，入口如下：

| 组件           | 说明                                | 文档                                                |
| -------------- | ----------------------------------- | --------------------------------------------------- |
| xnAppIcon      | 统一图标（Element / Iconify / SVG） | [README](./src/components/xnAppIcon/README.md)      |
| xnAppBrandLogo | 品牌 Logo                           | [README](./src/components/xnAppBrandLogo/README.md) |
| xnIconPicker   | 图标选择器                          | [README](./src/components/xnIconPicker/README.md)   |
| xnNoticeInbox  | 消息中心抽屉                        | [README](./src/components/xnNoticeInbox/README.md)  |
| xnPageLayout   | 列表页骨架                          | [README](./src/components/xnPageLayout/README.md)   |
| xnRichEditor   | 富文本编辑器                        | [README](./src/components/xnRichEditor/README.md)   |
| xnSidebarMenu  | 多级菜单                            | [README](./src/components/xnSidebarMenu/README.md)  |
| xnTagsView     | 页面标签栏                          | [README](./src/components/xnTagsView/README.md)     |
| xnThemePicker  | 主题设置                            | [README](./src/components/xnThemePicker/README.md)  |
| xnTreePanel    | 左侧树面板                          | [README](./src/components/xnTreePanel/README.md)    |
| xnButton       | 工具栏 / 行操作按钮                 | [README](./src/components/xnButton/README.md)       |
| xnImport       | Excel 导入对话框                    | [README](./src/components/xnImport/README.md)       |
| xnSearch       | 配置化搜索表单                      | [README](./src/components/xnSearch/README.md)       |
| xnTable        | 配置化表格                          | [README](./src/components/xnTable/README.md)        |

典型列表页组合：

```
xnPageLayout
├── #aside → xnTreePanel（可选）
├── #search → xnSearch
├── #toolbar → xnButton
└── #table → xnTable
```

配置通常来自后端 page-ui（`usePageUi`）与路由权限。

## 功能概览

- JWT 登录与会话刷新；`v-permission` 按钮级权限
- 动态菜单 / 路由注册（后端路由 + 视图懒加载）
- 角色、权限、用户、单位、字典、公告、站内信、登录页配置、系统配置、安全策略
- 页面标签栏、多布局模式、主题（含自定义色与背景）
- 表格列个性化、Excel 导入；日志 CSV 导出
- 系统监控：在线用户 / 服务 / Redis / SQL
- 日志管理：登录日志、操作日志、异常日志（查询、删除、清空、导出）
- 文件管理、定时任务、接口文档页
- 公告 WebSocket 推送（`/ws`）

## 环境与约定

- 路径别名：`@` → `src/`
- 鉴权 Token 由 `utils/request` 注入；未登录跳转登录页
- CRUD 列表优先用 `xnTable` 的 `api` 模式对接 `src/api/*.ts` 标准接口
- 日志等特殊导出走 `utils/download.ts`（带鉴权拉取文件流）

更完整的仓库说明见 [根 README](../README.md)。
