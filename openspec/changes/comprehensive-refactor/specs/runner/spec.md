## MODIFIED Requirements

### Requirement: Run Function Return Type
run() 函数 SHALL 返回结构化的 RunResult 对象，而不是直接返回布尔值和调用 process.exit()。

#### Scenario: Successful run returns result
- **WHEN** 覆盖率检测执行成功且满足阈值
- **THEN** run() 返回 RunResult，其中 success 为 true

#### Scenario: Failed run returns result
- **WHEN** 覆盖率检测执行成功但不满足阈值
- **THEN** run() 返回 RunResult，其中 success 为 false，thresholdResult 包含详情

#### Scenario: No changed files returns result
- **WHEN** 没有变更文件需要检测
- **THEN** run() 返回 RunResult，其中 success 为 true，changedFiles 为空数组

### Requirement: Run Function No Side Effects
run() 函数 SHALL 不产生副作用（不输出到控制台，不调用 process.exit）。

#### Scenario: Run does not print
- **WHEN** 调用 run() 函数
- **THEN** 函数不直接输出到 console

#### Scenario: Run does not exit
- **WHEN** 调用 run() 函数且检测失败
- **THEN** 函数不调用 process.exit，而是返回失败结果

### Requirement: Run Result Structure
RunResult SHALL 包含完整的运行上下文和结果数据。

#### Scenario: Result contains context
- **WHEN** run() 执行完成
- **THEN** RunResult 包含 context 字段（mode、currentBranch、currentCommit 等）

#### Scenario: Result contains coverage data
- **WHEN** run() 执行完成
- **THEN** RunResult 包含 incremental（增量覆盖率）和 total（全量覆盖率）
