## 1. 错误处理基础设施

- [x] 1.1 创建 `src/errors/index.ts`，定义 CoverageToolError 基类
- [x] 1.2 实现 GitError 类，包含 command 上下文
- [x] 1.3 实现 LcovParseError 类，包含 filePath 上下文
- [x] 1.4 实现 ConfigError 类，包含配置字段上下文
- [x] 1.5 在 `src/index.ts` 中导出所有错误类型

## 2. CI 适配器层

- [x] 2.1 创建 `src/ci-adapter/types.ts`，定义 CiAdapter 接口
- [x] 2.2 实现 `src/ci-adapter/cnb.ts` CNB 平台适配器
- [x] 2.3 实现 `src/ci-adapter/github-actions.ts` GitHub Actions 适配器
- [x] 2.4 实现 `src/ci-adapter/local.ts` 本地环境适配器（fallback）
- [x] 2.5 创建 `src/ci-adapter/index.ts`，实现 detectCiAdapter() 自动检测

## 3. 类型定义优化

- [x] 3.1 重构 FileResult 继承 FileCoverage，减少字段重复
- [x] 3.2 新增 RunResult 类型定义
- [x] 3.3 更新 ReporterOptions 使用 RunResult

## 4. Runner 模块重构

- [x] 4.1 修改 run() 函数签名，返回 RunResult
- [x] 4.2 移除 run() 中的 console.log 调用
- [x] 4.3 移除 run() 中的 process.exit 调用
- [x] 4.4 将 printRunInfo 逻辑移至 reporter
- [x] 4.5 将 outputEmptyResult 逻辑移至 reporter

## 5. Git Utils 重构

- [x] 5.1 修改 git-utils 使用 CI 适配器获取环境信息
- [x] 5.2 更新 runner 抛出 LcovParseError 而不是 process.exit
- [x] 5.3 更新 getRunContext 使用适配器

## 6. Reporter 模块更新

- [x] 6.1 更新 ReporterFunction 类型签名接受 RunResult
- [x] 6.2 更新 consoleReporter 打印运行上下文信息
- [x] 6.3 更新 cnbReporter 使用 CI 适配器输出变量
- [x] 6.4 更新 githubActionsReporter 使用 CI 适配器输出

## 7. CLI 增强

- [x] 7.1 添加 parseArgs 参数验证（preset、reporter 名称检查）
- [x] 7.2 添加参数越界检查（--preset 后缺少值）
- [x] 7.3 重构 main() 基于 RunResult 决定退出码
- [x] 7.4 在 main() 中调用 reporter 输出结果

## 8. 单元测试

- [x] 8.1 配置 vitest，创建 `vitest.config.ts`
- [x] 8.2 添加 `tests/lcov-parser.test.ts` 测试用例
- [x] 8.3 添加 `tests/calculator.test.ts` 测试用例
- [x] 8.4 添加 `tests/ci-adapter.test.ts` 测试用例
- [x] 8.5 添加 package.json test 脚本

## 9. 文档和收尾

- [x] 9.1 更新 README.md 文档（API 变更说明）
- [x] 9.2 运行 typecheck 确保类型正确
- [x] 9.3 运行测试确保全部通过
- [x] 9.4 更新 package.json 版本号至 2.0.0
