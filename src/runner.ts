/**
 * 覆盖率检测主运行器
 * 纯函数实现，不产生副作用（不输出，不退出）
 */

import type {
  ResolvedConfig,
  RunMode,
  RunContext,
  RunResult,
  IncrementalResult,
  FileCoverage,
} from './types';
import {
  execGit,
  getStagedFiles,
  getCommitFiles,
  getPrFiles,
} from './core/git-utils';
import { readLcovFile } from './core/lcov-parser';
import { calculateIncrementalCoverage, calculateTotalCoverage, checkThresholds } from './core/calculator';
import { getActiveAdapter, getCiEnvironment } from './ci-adapter/index';
import { LcovParseError } from './errors/index';

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

  const ciEnv = getCiEnvironment();

  // CI 模式下自动检测是否为 PR 场景
  if (args.includes('--ci') || ciEnv.isCi) {
    if (ciEnv.isPr) {
      return 'pr';
    }
    return 'ci';
  }

  if (args.includes('--commit')) {
    return 'commit';
  }

  if (args.includes('--pr')) {
    return 'pr';
  }

  // 默认：如果在 CI 环境中则为 ci 模式，否则为 commit 模式
  if (ciEnv.isCi) {
    return ciEnv.isPr ? 'pr' : 'ci';
  }

  return 'commit';
}

/**
 * 获取运行上下文
 */
export function getRunContext(mode: RunMode, config: ResolvedConfig): RunContext {
  const ciEnv = getCiEnvironment();
  const isPr = mode === 'pr';
  const isCi = mode === 'ci' || isPr || ciEnv.isCi;

  // 优先使用 CI 环境变量，否则从 git 获取
  const currentBranch = ciEnv.branch || execGit('git rev-parse --abbrev-ref HEAD') || 'unknown';
  const currentCommit = ciEnv.commit || execGit('git rev-parse HEAD') || 'HEAD';

  // 目标分支：PR 场景优先使用 CI 环境变量
  let targetBranch: string | null = null;
  if (isPr) {
    targetBranch = ciEnv.targetBranch || config.baselineBranch;
  }

  return {
    mode,
    currentBranch,
    currentCommit,
    isCi,
    isPr,
    targetBranch,
    prNumber: ciEnv.prNumber,
    ciAdapter: ciEnv.adapterName,
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
 * 创建空的增量结果（无变更文件时使用）
 */
function createEmptyIncrementalResult(): IncrementalResult {
  return {
    files: [],
    typeOnlyFiles: [],
    summary: {
      lines: { covered: 0, total: 0, pct: 100 },
      statements: { covered: 0, total: 0, pct: 100 },
      branches: { covered: 0, total: 0, pct: 100 },
      functions: { covered: 0, total: 0, pct: 100 },
    },
  };
}

/**
 * 运行覆盖率检测
 * 纯函数：不输出到控制台，不调用 process.exit
 * @returns 运行结果，包含完整的执行信息
 * @throws LcovParseError 当覆盖率文件不存在时
 */
export async function run(options: RunOptions): Promise<RunResult> {
  const { config } = options;
  const mode = options.mode || parseMode(process.argv.slice(2));
  const context = getRunContext(mode, config);

  // 获取变更文件
  const changedFiles = getChangedFiles(context, config);

  // 无变更文件 - 返回成功结果
  if (changedFiles.length === 0) {
    return {
      success: true,
      context,
      changedFiles: [],
      incremental: createEmptyIncrementalResult(),
      total: null,
      thresholdResult: {
        passed: true,
        details: [],
      },
      config,
    };
  }

  // 读取覆盖率数据
  const coverageData = readLcovFile(config.coverageFile);
  if (!coverageData) {
    throw LcovParseError.fileNotFound(config.coverageFile);
  }

  // 计算覆盖率
  const incremental = calculateIncrementalCoverage(coverageData, changedFiles);
  const total = calculateTotalCoverage(coverageData);

  // 检查阈值
  const thresholdResult = checkThresholds(incremental.summary, config.thresholds);

  return {
    success: thresholdResult.passed,
    context,
    changedFiles,
    incremental,
    total,
    thresholdResult,
    config,
  };
}

export default run;
