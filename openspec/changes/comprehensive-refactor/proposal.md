## Why

当前代码库存在多个架构问题：错误处理不统一（有些返回 null，有些静默失败，有些直接 process.exit）、runner.ts 职责过重（混合了运行逻辑、输出逻辑、退出逻辑）、CI 环境变量硬编码（仅支持 CNB 平台）、类型定义存在冗余。这些问题影响代码的可维护性、可测试性和可扩展性。

## What Changes

- **BREAKING**: `run()` 函数不再直接调用 `process.exit()`，改为返回结构化结果，由调用方决定退出行为
- 引入统一的错误处理机制，使用自定义 Error 类型和 Result 模式
- 拆分 runner 模块，将输出逻辑完全移至 reporter
- 创建 CI 平台适配层，抽象环境变量访问，支持 CNB、GitHub Actions 等多平台
- 优化类型定义，使用泛型和工具类型减少重复
- 增强 CLI 参数解析，添加边界检查和参数验证
- 添加核心模块的单元测试

## Capabilities

### New Capabilities

- `error-handling`: 统一的错误处理机制，包含自定义 Error 类型、Result 模式和错误边界
- `ci-adapter`: CI 平台适配层，抽象不同 CI 平台的环境变量和输出格式
- `unit-tests`: 核心模块（lcov-parser、calculator、git-utils）的单元测试

### Modified Capabilities

- `runner`: 职责拆分，移除输出逻辑和 process.exit，返回结构化结果
- `types`: 优化类型定义，减少冗余，增强类型安全
- `cli`: 增强参数解析，添加验证和错误提示

## Impact

- **代码变更**:
  - `src/types.ts` - 新增 Error 类型和 Result 类型
  - `src/runner.ts` - 重构为纯函数，移除副作用
  - `src/cli.ts` - 增强参数解析和错误处理
  - `src/core/git-utils.ts` - 使用 CI 适配器
  - `src/reporters/*.ts` - 承接原 runner 的输出逻辑
  - 新增 `src/ci-adapter/` 目录
  - 新增 `src/errors/` 目录
  - 新增 `tests/` 目录

- **API 变更**:
  - `run()` 返回类型从 `Promise<boolean>` 改为 `Promise<RunResult>`
  - `runCoverageCheck()` 同步更新返回类型

- **依赖变更**:
  - 新增 `vitest` 作为测试框架（devDependencies）
