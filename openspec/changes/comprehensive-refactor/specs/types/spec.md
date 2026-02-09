## MODIFIED Requirements

### Requirement: FileResult Type Optimization
FileResult 类型 SHALL 继承 FileCoverage，减少字段重复。

#### Scenario: FileResult has coverage metrics
- **WHEN** 访问 FileResult 的 lines、statements、branches、functions 字段
- **THEN** 这些字段从 FileCoverage 继承而来

#### Scenario: FileResult has additional fields
- **WHEN** 访问 FileResult 的 file、hasCoverage、isTypeOnly 字段
- **THEN** 这些字段是 FileResult 独有的

### Requirement: RunResult Type
系统 SHALL 新增 RunResult 类型定义。

#### Scenario: RunResult contains all execution data
- **WHEN** 定义 RunResult 类型
- **THEN** 类型包含 success、context、changedFiles、incremental、total、thresholdResult 字段

### Requirement: Error Types Export
系统 SHALL 从主入口导出所有错误类型。

#### Scenario: Import error types
- **WHEN** 从 '@aspect/coverage-tools' 导入
- **THEN** 可以导入 CoverageToolError、GitError、LcovParseError、ConfigError
