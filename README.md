# @aspect/coverage-tools

增量覆盖率检测工具，支持 Vue、React、小程序等多种项目类型。

## 特性

- 🚀 **多种运行模式**: 支持 pre-commit、commit、CI、PR 四种模式
- 📦 **预设配置**: 内置 Vue、React、小程序等项目的预设配置
- 📊 **多平台报告**: 支持 CNB、GitHub Actions、Console 等多种报告器
- 🔧 **高度可配置**: 支持配置文件和环境变量
- 📝 **TypeScript**: 完整的类型定义

## 安装

```bash
npm install @aspect/coverage-tools -D
# 或
pnpm add @aspect/coverage-tools -D
```

## 快速开始

### CLI 使用

```bash
# 检测暂存区文件（pre-commit）
npx coverage-check --staged

# 使用 Vue 预设
npx coverage-check --preset vue --ci

# 使用 CNB 报告器
npx coverage-check --reporter cnb --ci
```

### 配置文件

创建 `coverage.config.mjs`:

```javascript
export default {
  preset: 'vue',
  reporter: 'cnb',
  thresholds: {
    lines: 60,
    branches: 50,
    functions: 50,
    statements: 60,
  },
};
```

### API 调用

```typescript
import { runCoverageCheck, presets } from '@aspect/coverage-tools';

await runCoverageCheck({
  ...presets.vue,
  reporter: 'cnb',
  thresholds: { lines: 80 },
});
```

## 预设配置

### Vue 项目

```javascript
export default {
  preset: 'vue',
};
```

### React 项目

```javascript
export default {
  preset: 'react',
};
```

### 小程序项目

```javascript
export default {
  preset: 'miniprogram',
};
```

## 报告器

- `console`: 纯控制台输出
- `cnb`: CNB 平台（输出环境变量）
- `github-actions`: GitHub Actions（输出 workflow 命令）

## 配置项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `preset` | string | 'default' | 预设名称 |
| `reporter` | string | 'console' | 报告器名称 |
| `coverageFile` | string | 'coverage/lcov.info' | 覆盖率文件路径 |
| `thresholds.lines` | number | 60 | 行覆盖率阈值 |
| `thresholds.branches` | number | 50 | 分支覆盖率阈值 |
| `thresholds.functions` | number | 50 | 函数覆盖率阈值 |
| `thresholds.statements` | number | 60 | 语句覆盖率阈值 |
| `strictMode` | boolean | false | 严格模式 |
| `baselineBranch` | string | 'master' | 基准分支 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `COVERAGE_THRESHOLD_LINES` | 行覆盖率阈值 |
| `COVERAGE_THRESHOLD_BRANCHES` | 分支覆盖率阈值 |
| `COVERAGE_THRESHOLD_FUNCTIONS` | 函数覆盖率阈值 |
| `COVERAGE_THRESHOLD_STATEMENTS` | 语句覆盖率阈值 |
| `COVERAGE_STRICT` | 严格模式 |
| `BASELINE_BRANCH` | 基准分支 |

## License

MIT
