## MODIFIED Requirements

### Requirement: CLI Argument Validation
CLI SHALL 验证参数值的有效性。

#### Scenario: Invalid preset name
- **WHEN** 用户指定 --preset unknown-preset
- **THEN** CLI 输出错误信息并列出可用预设

#### Scenario: Missing argument value
- **WHEN** 用户指定 --preset 但不提供值
- **THEN** CLI 输出错误信息提示缺少参数值

#### Scenario: Invalid reporter name
- **WHEN** 用户指定 --reporter unknown-reporter
- **THEN** CLI 输出错误信息并列出可用报告器

### Requirement: CLI Exit Code Handling
CLI SHALL 基于 run() 返回的结果决定退出码。

#### Scenario: Success exit code
- **WHEN** run() 返回 success: true
- **THEN** CLI 以退出码 0 退出

#### Scenario: Failure exit code in strict mode
- **WHEN** run() 返回 success: false 且 strictMode 为 true
- **THEN** CLI 以退出码 1 退出

#### Scenario: Warning in non-strict mode
- **WHEN** run() 返回 success: false 且 strictMode 为 false
- **THEN** CLI 以退出码 0 退出，但输出警告信息

### Requirement: CLI Reporter Invocation
CLI SHALL 在获取 run() 结果后调用报告器输出。

#### Scenario: Reporter receives run result
- **WHEN** run() 执行完成
- **THEN** CLI 将 RunResult 传递给选定的报告器

#### Scenario: Reporter determines output format
- **WHEN** 使用 cnb 报告器
- **THEN** 报告器负责输出 CNB 格式的环境变量
