/**
 * 覆盖率检测主运行器
 */

import type {
  ResolvedConfig,
  RunMode,
  RunContext,
  IncrementalResult,
  FileCoverage,
  ReporterFunction,
  ReporterOptions,
} from './types';
import {
  getCurrentBranch,
  getCurrentCommit,
  getStagedFiles,
  getCommitFiles,
  getPrFiles,
  isPrContext,
  getPrTargetBranch,
} from './core/git-utils';
import { readLcovFile } from './core/lcov-parser';
import { calculateIncrementalCoverage, calculateTotalCoverage, checkThresholds } from './core/calculator';
import { getReporter } from './reporters/index';

/**
 * 运行选项
 */
export interface RunOptions {
  /** 运行模式 */
  mode?: RunMode;
  /** 配置 */
  config: ResolvedConfig;
}

/**
 * 解析运行模式
 */
export function parseMode(args: string[] = []): RunMode {
  if (args.includes('--staged') || args.includes('--pre-commit')) {
    return 'staged';
  }

  // CI 模式下自动检测是否为 PR 场景
  if (args.includes('--ci') || process.env.CNB_COMMIT) {
    if (isPrContext()) {
      return 'pr';
    }
    return 'ci';
  }

  if (args.includes('--commit')) {
    return 'commit';
  }

  // 默认：如果在 CI 环境中则为 ci 模式，否则为 commit 模式
  if (process.env.CI) {
    return isPrContext() ? 'pr' : 'ci';
  }

  return 'commit';
}

/**
 * 获取运行上下文
 */
export function getRunContext(mode: RunMode): RunContext {
  const isPr = mode === 'pr';
  const isCi = mode === 'ci' || isPr;

  return {
    mode,
    currentBranch: getCurrentBranch(),
    currentCommit: getCurrentCommit(),
    isCi,
    isPr,
    targetBranch: isPr ? getPrTargetBranch() : null,
  };
}

/**
 * 获取变更文件
 */
export function getChangedFiles(context: RunContext, config: ResolvedConfig): string[] {
  const filterOptions = {
    extensions: config.fileFilter.extensions,
    include: config.fileFilter.include,
    exclude: config.fileFilter.exclude,
  };

  switch (context.mode) {
    case 'staged':
      return getStagedFiles(filterOptions);
    case 'pr':
      return getPrFiles(context.targetBranch!, filterOptions);
    default:
      return getCommitFiles(context.currentCommit, filterOptions);
  }
}

/**
 * 打印运行信息
 */
function printRunInfo(context: RunContext, changedFilesCount: number): void {
  console.log('\n🔍 增量覆盖率检测');

  // CNB 环境变量调试信息
  if (context.isCi) {
    console.log('\n📋 CNB 环境变量:');
    console.log(`   CNB_PULL_REQUEST: ${process.env.CNB_PULL_REQUEST || '(未设置)'}`);
    console.log(`   CNB_BRANCH: ${process.env.CNB_BRANCH || '(未设置)'}`);
    console.log(`   CNB_COMMIT: ${process.env.CNB_COMMIT || '(未设置)'}`);
  }

  if (context.isPr) {
    console.log(`\n   策略: 计算 PR 相对于 ${context.targetBranch} 分支的所有变更文件`);
  } else {
    console.log(`\n   策略: 只计算本次 ${context.mode === 'staged' ? '暂存区' : 'commit'} 的文件`);
  }

  const modeText: Record<RunMode, string> = {
    staged: '暂存区检测 (pre-commit)',
    commit: '本地 commit 检测',
    ci: 'CI 流水线',
    pr: `PR 检测 (目标分支: ${context.targetBranch})`,
  };

  console.log(`   模式: ${modeText[context.mode]}`);
  console.log(`   分支: ${context.currentBranch}`);
  if (context.mode !== 'staged') {
    console.log(`   Commit: ${context.currentCommit.substring(0, 8)}`);
  }
  if (context.isPr && process.env.CNB_PULL_REQUEST) {
    console.log(`   PR: #${process.env.CNB_PULL_REQUEST}`);
  }

  console.log(`\n📁 变更文件: ${changedFilesCount} 个`);
}

/**
 * 输出无变更文件时的 CI 变量
 */
function outputEmptyResult(isCi: boolean): void {
  if (isCi) {
    console.log('##[set-output INCR_LINES_PCT=100%]');
    console.log('##[set-output INCR_STATEMENTS_PCT=100%]');
    console.log('##[set-output INCR_BRANCHES_PCT=100%]');
    console.log('##[set-output INCR_FUNCTIONS_PCT=100%]');
    console.log('##[set-output INCR_LINES_COVERED=0]');
    console.log('##[set-output INCR_LINES_TOTAL=0]');
    console.log('##[set-output INCR_FILES_TOTAL=0]');
    console.log('##[set-output INCR_FILES_COVERED=0]');
  }
}

/**
 * 运行覆盖率检测
 */
export async function run(options: RunOptions): Promise<boolean> {
  const { config } = options;
  const mode = options.mode || parseMode(process.argv.slice(2));
  const context = getRunContext(mode);

  // 获取变更文件
  const changedFiles = getChangedFiles(context, config);

  // 打印运行信息
  printRunInfo(context, changedFiles.length);

  // 无变更文件
  if (changedFiles.length === 0) {
    console.log('\n✅ 没有需要检测覆盖率的源代码变更\n');
    outputEmptyResult(context.isCi);
    return true;
  }

  // 读取覆盖率数据
  const coverageData = readLcovFile(config.coverageFile);
  if (!coverageData) {
    console.error(`\n❌ 覆盖率报告不存在: ${config.coverageFile}`);
    console.error('   请先运行测试生成覆盖率报告\n');
    process.exit(1);
  }

  // 计算覆盖率
  const incremental = calculateIncrementalCoverage(coverageData, changedFiles);
  const total = calculateTotalCoverage(coverageData);

  // 检查阈值
  const thresholdResult = checkThresholds(incremental.summary, config.thresholds);

  // 获取报告器
  let reporter: ReporterFunction;
  if (typeof config.reporter === 'function') {
    reporter = config.reporter;
  } else {
    reporter = getReporter(config.reporter);
  }

  // 生成报告
  const reporterOptions: ReporterOptions = {
    mode,
    changedFiles,
    incremental,
    total,
    thresholdResult,
    config,
  };

  const passed = reporter(reporterOptions);

  // 严格模式下，未通过则返回非零退出码
  if (config.strictMode && !passed) {
    process.exit(1);
  }

  return passed;
}

export default run;
