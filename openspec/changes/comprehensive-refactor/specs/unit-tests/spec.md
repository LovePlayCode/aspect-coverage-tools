## ADDED Requirements

### Requirement: LCOV Parser Tests
系统 SHALL 包含 lcov-parser 模块的单元测试。

#### Scenario: Parse valid LCOV content
- **WHEN** 传入有效的 LCOV 格式字符串
- **THEN** parseLcov() 返回正确的文件覆盖率映射

#### Scenario: Parse empty LCOV content
- **WHEN** 传入空字符串
- **THEN** parseLcov() 返回空 Map

#### Scenario: Get file coverage by relative path
- **WHEN** 使用相对路径查询覆盖率数据
- **THEN** getFileCoverage() 返回对应文件的覆盖率

### Requirement: Calculator Tests
系统 SHALL 包含 calculator 模块的单元测试。

#### Scenario: Calculate incremental coverage
- **WHEN** 传入覆盖率数据和变更文件列表
- **THEN** calculateIncrementalCoverage() 返回正确的增量覆盖率结果

#### Scenario: Handle type-only files
- **WHEN** 变更文件为纯类型定义文件（无可执行代码）
- **THEN** 该文件被归类到 typeOnlyFiles，覆盖率视为 100%

#### Scenario: Check thresholds pass
- **WHEN** 所有覆盖率指标满足阈值
- **THEN** checkThresholds() 返回 { passed: true }

#### Scenario: Check thresholds fail
- **WHEN** 任一覆盖率指标低于阈值
- **THEN** checkThresholds() 返回 { passed: false } 并列出未通过的指标

### Requirement: CI Adapter Tests
系统 SHALL 包含 CI adapter 模块的单元测试。

#### Scenario: CNB adapter environment detection
- **WHEN** 设置 CNB_COMMIT 环境变量
- **THEN** cnbAdapter.isActive() 返回 true

#### Scenario: GitHub Actions adapter environment detection
- **WHEN** 设置 GITHUB_ACTIONS='true' 环境变量
- **THEN** githubActionsAdapter.isActive() 返回 true

#### Scenario: Mock environment in tests
- **WHEN** 运行 CI adapter 测试
- **THEN** 测试能够 mock 环境变量而不影响其他测试
