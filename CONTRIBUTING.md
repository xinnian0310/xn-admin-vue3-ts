# 工程规范

## 本地命令

```bash
npm run lint
npm run typecheck
npm run test
npm run ci
```

- `lint` / `typecheck` / `test`：单项检查
- `ci`：typecheck + lint + format:check + test + build

## Git Hooks

安装依赖后 Husky 会配置本地 hooks。

| Hook         | 作用                                  |
| ------------ | ------------------------------------- |
| `pre-commit` | lint-staged（ESLint 修复 + Prettier） |
| `commit-msg` | Conventional Commits                  |

## 提交信息

```
<type>(optional-scope): <subject>

feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert
```

示例：`feat(logs): 增加操作日志详情弹窗`

## CI

- Gitee Go：`.workflow/ci.yml`（需在控制台启用流水线）
