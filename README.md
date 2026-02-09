# @aspect/coverage-tools

增量覆盖率检测工具，支持 Vue、React、小程序等多种项目类型。

## 特性

- 🚀 **多种运行模式**: 支持 pre-commit、commit、CI、PR 四种模式
- 📦 **预设配置**: 内置 Vue、React、小程序等项目的预设配置
- 📊 **多平台报告**: 支持 CNB、GitHub Actions、Console 等多种报告器
- 🔧 **高度可配置**: 支持配置文件和环境变量
- 📝 **TypeScript**: 完整的类型定义
- 🛡️ **统一错误处理**: 结构化的错误类型，便于程序化处理
- 🔌 **CI 平台适配**: 自动检测 CI 环境，支持多平台

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

// v2.0 返回结构化的 RunResult 对象
const result = await runCoverageCheck({
  ...presets.vue,
  reporter: 'cnb',
  thresholds: { lines: 80 },
});

console.log(result.success); // true or false
console.log(result.incremental.summary.lines.pct); // 覆盖率百分比
console.log(result.thresholdResult.details); // 各指标检查详情
```

## v2.0 Breaking Changes

### `run()` 返回类型变更

v1.x:
```typescript
const passed: boolean = await run({ config });
```

v2.0:
```typescript
const result: RunResult = await run({ config });
// result.success 等价于之前的 passed
```

### `RunResult` 结构

```typescript
interface RunResult {
  success: boolean;           // 是否满足所有阈值
  context: RunContext;        // 运行上下文（模式、分支、CI 信息）
  changedFiles: string[];     // 变更的文件列表
  incremental: IncrementalResult;  // 增量覆盖率结果
  total: FileCoverage | null;      // 全量覆盖率结果
  thresholdResult: ThresholdCheckResult;  // 阈值检查结果
  config: ResolvedConfig;     // 使用的配置
}
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

## CI 平台支持

工具会自动检测当前 CI 环境：

- **CNB**: 通过 `CNB_COMMIT` 环境变量检测
- **GitHub Actions**: 通过 `GITHUB_ACTIONS` 环境变量检测
- **本地环境**: 无 CI 环境变量时使用本地适配器

### 使用 CI 适配器

```typescript
import { getCiEnvironment, getActiveAdapter } from '@aspect/coverage-tools';

// 获取当前 CI 环境信息
const env = getCiEnvironment();
console.log(env.isCi);       // 是否在 CI 环境
console.log(env.isPr);       // 是否为 PR 场景
console.log(env.branch);     // 当前分支
console.log(env.adapterName); // 适配器名称

// 使用适配器输出变量
const adapter = getActiveAdapter();
adapter.setOutput('COVERAGE_PCT', '80%');
```

## 错误处理

v2.0 引入了统一的错误处理机制：

```typescript
import { 
  runCoverageCheck, 
  isCoverageToolError,
  isLcovParseError 
} from '@aspect/coverage-tools';

try {
  const result = await runCoverageCheck();
} catch (error) {
  if (isLcovParseError(error)) {
    console.error('覆盖率文件解析失败:', error.context?.filePath);
  } else if (isCoverageToolError(error)) {
    console.error(`错误 [${error.code}]:`, error.message);
  }
}
```

### 错误类型

- `CoverageToolError`: 基础错误类
- `GitError`: Git 命令执行错误
- `LcovParseError`: LCOV 文件解析错误
- `ConfigError`: 配置加载/解析错误
- `CliError`: CLI 参数错误

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
