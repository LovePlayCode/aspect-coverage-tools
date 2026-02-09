## ADDED Requirements

### Requirement: CI Adapter Interface
系统 SHALL 定义 CiAdapter 接口，抽象 CI 平台的环境信息获取。

#### Scenario: Adapter provides branch info
- **WHEN** 在 CI 环境中运行
- **THEN** adapter.getBranch() 返回当前分支名

#### Scenario: Adapter provides commit info
- **WHEN** 在 CI 环境中运行
- **THEN** adapter.getCommit() 返回当前 commit SHA

#### Scenario: Adapter detects PR context
- **WHEN** 当前运行是 PR 触发
- **THEN** adapter.isPrContext() 返回 true

### Requirement: CNB Adapter
系统 SHALL 提供 CNB 平台的适配器实现。

#### Scenario: CNB branch detection
- **WHEN** CNB_BRANCH 环境变量设置为 'feature/test'
- **THEN** cnbAdapter.getBranch() 返回 'feature/test'

#### Scenario: CNB PR detection
- **WHEN** CNB_PULL_REQUEST 环境变量设置为 '123'
- **THEN** cnbAdapter.isPrContext() 返回 true

#### Scenario: CNB output format
- **WHEN** 调用 cnbAdapter.setOutput('INCR_LINES_PCT', '80%')
- **THEN** 输出 `##[set-output INCR_LINES_PCT=80%]`

### Requirement: GitHub Actions Adapter
系统 SHALL 提供 GitHub Actions 平台的适配器实现。

#### Scenario: GitHub Actions branch detection
- **WHEN** GITHUB_REF_NAME 环境变量设置为 'main'
- **THEN** githubActionsAdapter.getBranch() 返回 'main'

#### Scenario: GitHub Actions PR detection
- **WHEN** GITHUB_EVENT_NAME 环境变量设置为 'pull_request'
- **THEN** githubActionsAdapter.isPrContext() 返回 true

#### Scenario: GitHub Actions output format
- **WHEN** 调用 githubActionsAdapter.setOutput('INCR_LINES_PCT', '80%')
- **THEN** 输出到 GITHUB_OUTPUT 文件

### Requirement: Adapter Auto Detection
系统 SHALL 自动检测当前 CI 环境并返回对应适配器。

#### Scenario: Detect CNB environment
- **WHEN** CNB_COMMIT 环境变量存在
- **THEN** detectCiAdapter() 返回 cnbAdapter

#### Scenario: Detect GitHub Actions environment
- **WHEN** GITHUB_ACTIONS 环境变量为 'true'
- **THEN** detectCiAdapter() 返回 githubActionsAdapter

#### Scenario: No CI environment
- **WHEN** 本地开发环境，无 CI 环境变量
- **THEN** detectCiAdapter() 返回 null
