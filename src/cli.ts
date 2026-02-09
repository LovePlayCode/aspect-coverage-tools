#!/usr/bin/env node
/**
 * Coverage Tools CLI
 * 增量覆盖率检测命令行工具
 */

import { loadConfig } from './config';
import { run, parseMode } from './runner';
import { getReporter } from './reporters/index';
import { CliError, isCoverageToolError } from './errors/index';
import type { RunMode, ReporterFunction, CoverageConfig } from './types';
import { AVAILABLE_PRESETS, AVAILABLE_REPORTERS } from './types';

const VERSION = '2.0.0';

const HELP_TEXT = `
📊 @aspect/coverage-tools - 增量覆盖率检测工具

用法:
  coverage-check [选项]

运行模式:
  --staged, --pre-commit    检测暂存区文件（pre-commit 钩子使用）
  --commit                  检测当前 commit 的文件
  --ci                      CI 流水线模式（自动检测是否为 PR）
  --pr                      强制 PR 模式

选项:
  --preset <name>           使用预设配置 (${AVAILABLE_PRESETS.join(', ')})
  --reporter <name>         指定报告器 (${AVAILABLE_REPORTERS.join(', ')})
  --config <path>           指定配置文件路径
  --strict                  严格模式，低于阈值时退出码为 1
  --help, -h                显示帮助信息
  --version, -v             显示版本号

环境变量:
  COVERAGE_THRESHOLD_LINES       行覆盖率阈值（默认 60）
  COVERAGE_THRESHOLD_BRANCHES    分支覆盖率阈值（默认 50）
  COVERAGE_THRESHOLD_FUNCTIONS   函数覆盖率阈值（默认 50）
  COVERAGE_THRESHOLD_STATEMENTS  语句覆盖率阈值（默认 60）
  COVERAGE_STRICT                严格模式（true/false）
  BASELINE_BRANCH                基准分支（默认 master）

配置文件:
  支持以下配置文件（按优先级）:
  - coverage.config.mjs
  - coverage.config.js
  - coverage.config.ts
  - .coveragerc.mjs
  - .coveragerc.js

示例:
  # 本地 pre-commit
  coverage-check --staged

  # 使用 Vue 预设
  coverage-check --preset vue --ci

  # 指定报告器
  coverage-check --reporter cnb --ci

  # 严格模式
  coverage-check --strict --ci
`;

/**
 * 解析命令行参数
 */
function parseArgs(args: string[]): {
  mode?: RunMode;
  preset?: string;
  reporter?: string;
  config?: string;
  strict?: boolean;
  help?: boolean;
  version?: boolean;
} {
  const result: ReturnType<typeof parseArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        result.help = true;
        break;
      case '--version':
      case '-v':
        result.version = true;
        break;
      case '--staged':
      case '--pre-commit':
        result.mode = 'staged';
        break;
      case '--commit':
        result.mode = 'commit';
        break;
      case '--ci':
        result.mode = 'ci';
        break;
      case '--pr':
        result.mode = 'pr';
        break;
      case '--strict':
        result.strict = true;
        break;
      case '--preset': {
        const value = args[++i];
        if (!value || value.startsWith('-')) {
          throw CliError.missingValue('--preset');
        }
        if (!AVAILABLE_PRESETS.includes(value as typeof AVAILABLE_PRESETS[number])) {
          throw CliError.invalidArgument('--preset', value, [...AVAILABLE_PRESETS]);
        }
        result.preset = value;
        break;
      }
      case '--reporter': {
        const value = args[++i];
        if (!value || value.startsWith('-')) {
          throw CliError.missingValue('--reporter');
        }
        if (!AVAILABLE_REPORTERS.includes(value as typeof AVAILABLE_REPORTERS[number])) {
          throw CliError.invalidArgument('--reporter', value, [...AVAILABLE_REPORTERS]);
        }
        result.reporter = value;
        break;
      }
      case '--config': {
        const value = args[++i];
        if (!value || value.startsWith('-')) {
          throw CliError.missingValue('--config');
        }
        result.config = value;
        break;
      }
    }
  }

  return result;
}

/**
 * CLI 主函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  try {
    const parsedArgs = parseArgs(args);

    // 显示帮助
    if (parsedArgs.help) {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    // 显示版本
    if (parsedArgs.version) {
      console.log(`@aspect/coverage-tools v${VERSION}`);
      process.exit(0);
    }

    // 准备命令行覆盖参数
    const cliOverrides: Partial<CoverageConfig> = {};
    if (parsedArgs.preset) {
      cliOverrides.preset = parsedArgs.preset as CoverageConfig['preset'];
    }
    if (parsedArgs.reporter) {
      cliOverrides.reporter = parsedArgs.reporter as CoverageConfig['reporter'];
    }
    if (parsedArgs.strict !== undefined) {
      cliOverrides.strictMode = parsedArgs.strict;
    }

    // 加载配置，命令行参数优先级最高
    const config = await loadConfig(parsedArgs.config, cliOverrides);

    // 运行检测
    const mode = parsedArgs.mode || parseMode(args);
    const result = await run({ mode, config });

    // 获取报告器并输出结果
    let reporter: ReporterFunction;
    if (typeof config.reporter === 'function') {
      reporter = config.reporter;
    } else {
      reporter = getReporter(config.reporter);
    }

    reporter(result);

    // 根据结果决定退出码
    if (!result.success && config.strictMode) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    if (isCoverageToolError(error)) {
      console.error(`❌ ${error.message}`);
      if (error.context) {
        console.error('   上下文:', JSON.stringify(error.context, null, 2));
      }
    } else {
      console.error('❌ 运行出错:', error);
    }
    process.exit(1);
  }
}

// 运行
main();
