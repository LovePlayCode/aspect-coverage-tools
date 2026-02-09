## Context

当前项目是一个增量覆盖率检测工具，支持多种运行模式（staged、commit、ci、pr）和多个 CI 平台（CNB、GitHub Actions）。代码约 1500 行，分布在 18 个 TypeScript 文件中。

**现状问题**：
- 错误处理分散：git-utils 返回 null，lcov-parser 静默失败，runner 直接 process.exit
- runner.ts 承担过多职责：运行逻辑 + 控制台输出 + CI 变量输出 + 进程退出
- CI 环境变量硬编码：`CNB_BRANCH`、`CNB_COMMIT` 等散落在多个文件
- 类型重复：FileCoverage 和 FileResult 有 4 个相同字段

**约束**：
- 保持零运行时依赖（仅 devDependencies）
- 兼容现有 CLI 接口
- 兼容现有配置文件格式

## Goals / Non-Goals

**Goals:**
- 统一错误处理，提高可调试性
- 拆分模块职责，提高可测试性
- 抽象 CI 平台，提高可扩展性
- 减少类型冗余，提高可维护性
- 添加核心模块测试，保证重构质量

**Non-Goals:**
- 不改变 CLI 的命令行接口
- 不改变配置文件的格式
- 不添加新的覆盖率计算功能
- 不支持新的报告格式

## Decisions

### D1: 错误处理策略 - 使用自定义 Error 类 + 类型守卫

**选择**: 自定义 Error 类层次结构 + 类型守卫函数

**替代方案考虑**:
- Result<T, E> 模式：类型安全但增加使用复杂度，需要处理每个函数返回值
- 简单 throw Error：缺乏结构化错误信息

**理由**: 
- 自定义 Error 类可以携带上下文信息（如文件路径、命令等）
- 类型守卫让 catch 块中的错误处理更安全
- 与 Node.js 生态习惯一致，学习成本低

**实现**:
```typescript
// src/errors/index.ts
export class CoverageToolError extends Error {
  constructor(message: string, public code: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = 'CoverageToolError';
  }
}

export class GitError extends CoverageToolError { ... }
export class LcovParseError extends CoverageToolError { ... }
export class ConfigError extends CoverageToolError { ... }
```

### D2: Runner 职责拆分 - 返回结构化结果

**选择**: runner 返回 `RunResult` 对象，由 CLI 决定输出和退出

**替代方案考虑**:
- 使用事件发射器：过度设计，增加复杂度
- 传入回调函数：接口不直观

**理由**:
- 纯函数更易测试
- 职责单一：runner 只负责计算，CLI 负责 I/O
- 结果对象可被多种消费者使用（CLI、API、测试）

**实现**:
```typescript
// src/types.ts
interface RunResult {
  success: boolean;
  context: RunContext;
  changedFiles: string[];
  incremental: IncrementalResult;
  total: FileCoverage | null;
  thresholdResult: ThresholdCheckResult;
}

// src/runner.ts
export async function run(options: RunOptions): Promise<RunResult> {
  // 纯计算，不输出，不退出
}

// src/cli.ts
const result = await run(options);
reporter(result);  // 输出
process.exit(result.success ? 0 : 1);  // 退出
```

### D3: CI 平台适配 - 适配器模式

**选择**: 创建 CiAdapter 接口和具体实现

**替代方案考虑**:
- 环境变量映射表：不够灵活，难以处理复杂逻辑（如 isPrContext）
- 条件分支：代码分散，难维护

**理由**:
- 适配器模式清晰隔离平台差异
- 新增 CI 平台只需添加新适配器
- 便于单元测试（可 mock 适配器）

**实现**:
```typescript
// src/ci-adapter/types.ts
interface CiAdapter {
  name: string;
  isActive(): boolean;
  getBranch(): string | null;
  getCommit(): string | null;
  isPrContext(): boolean;
  getPrNumber(): string | null;
  getTargetBranch(): string | null;
  setOutput(key: string, value: string): void;
}

// src/ci-adapter/cnb.ts
export const cnbAdapter: CiAdapter = { ... }

// src/ci-adapter/github-actions.ts
export const githubActionsAdapter: CiAdapter = { ... }

// src/ci-adapter/index.ts
export function detectCiAdapter(): CiAdapter | null { ... }
```

### D4: 类型优化 - 使用交叉类型

**选择**: FileResult extends FileCoverage

**实现**:
```typescript
// 优化前
interface FileResult {
  file: string;
  hasCoverage: boolean;
  isTypeOnly: boolean;
  lines: CoverageMetric;      // 重复
  statements: CoverageMetric; // 重复
  branches: CoverageMetric;   // 重复
  functions: CoverageMetric;  // 重复
}

// 优化后
interface FileResult extends FileCoverage {
  file: string;
  hasCoverage: boolean;
  isTypeOnly: boolean;
}
```

### D5: 测试框架 - 使用 Vitest

**选择**: Vitest

**替代方案考虑**:
- Jest：配置较重，ESM 支持需要额外配置
- Node.js test runner：API 不够成熟

**理由**:
- 原生 ESM 支持，与项目配置一致
- 零配置启动，与 Vite 生态兼容
- 更快的执行速度

## Risks / Trade-offs

### R1: API Breaking Change
**风险**: `run()` 返回类型变更可能影响外部使用者
**缓解**: 
- 在 CHANGELOG 中明确标记 BREAKING CHANGE
- 提供迁移指南
- 版本号升至 2.0.0

### R2: 重构引入 Bug
**风险**: 大规模重构可能引入回归问题
**缓解**:
- 先写测试再重构
- 分阶段提交，每阶段验证
- 保留原有功能的集成测试

### R3: 过度工程
**风险**: 为小项目引入过多抽象
**缓解**:
- 保持适配器和错误类的简洁
- 不过度泛化，只解决现有问题

## Open Questions

1. ~~是否需要支持更多 CI 平台？~~ → 先支持 CNB 和 GitHub Actions，其他按需添加
2. 是否需要保留 `runCoverageCheck` 便捷方法的旧签名作为兼容？ → 建议不保留，直接升级
