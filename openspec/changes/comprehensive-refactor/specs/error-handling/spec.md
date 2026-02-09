## ADDED Requirements

### Requirement: Custom Error Classes
系统 SHALL 提供一组自定义 Error 类，用于结构化错误处理。

#### Scenario: Git command fails
- **WHEN** git 命令执行失败
- **THEN** 系统抛出 GitError，包含失败的命令和错误信息

#### Scenario: LCOV file parse fails
- **WHEN** LCOV 文件格式无效或解析失败
- **THEN** 系统抛出 LcovParseError，包含文件路径和解析位置

#### Scenario: Config file invalid
- **WHEN** 配置文件格式错误或字段无效
- **THEN** 系统抛出 ConfigError，包含配置文件路径和具体字段

### Requirement: Error Hierarchy
所有自定义错误 SHALL 继承自 CoverageToolError 基类。

#### Scenario: Error instanceof check
- **WHEN** 捕获到 GitError 实例
- **THEN** `error instanceof CoverageToolError` 返回 true

#### Scenario: Error has code property
- **WHEN** 抛出任何 CoverageToolError 子类
- **THEN** 错误对象包含 `code` 属性用于程序化识别（如 'GIT_COMMAND_FAILED'）

### Requirement: Error Context
每个错误 SHALL 支持携带上下文信息。

#### Scenario: Git error with context
- **WHEN** git 命令 `git diff --cached` 失败
- **THEN** GitError 的 context 包含 `{ command: 'git diff --cached' }`

#### Scenario: Lcov error with context
- **WHEN** 解析 `/path/to/lcov.info` 失败
- **THEN** LcovParseError 的 context 包含 `{ filePath: '/path/to/lcov.info' }`
