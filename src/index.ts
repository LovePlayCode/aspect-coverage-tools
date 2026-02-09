/**
 * @aspect/coverage-tools
 * 增量覆盖率检测工具
 *
 * 主入口文件 - 导出所有公共 API
 */

// 类型导出
export type {
  // 覆盖率类型
  CoverageMetric,
  FileCoverage,
  FileResult,
  IncrementalResult,
  // 配置类型
  ThresholdsConfig,
  FileFilterConfig,
  CoverageConfig,
  ResolvedConfig,
  // 运行时类型
  RunMode,
  RunContext,
  RunResult,
  // 报告器类型
  ThresholdCheckDetail,
  ThresholdCheckResult,
  ReporterOptions,
  ReporterFunction,
  // CLI 类型
  CliOptions,
  PresetName,
  ReporterName,
} from './types';

// 常量导出
export { AVAILABLE_PRESETS, AVAILABLE_REPORTERS } from './types';

// 错误类型导出
export {
  CoverageToolError,
  GitError,
  LcovParseError,
  ConfigError,
  CliError,
  ErrorCodes,
  isCoverageToolError,
  isGitError,
  isLcovParseError,
  isConfigError,
  isCliError,
} from './errors/index';

export type { ErrorCode } from './errors/index';

// CI 适配器导出
export type { CiAdapter, CiEnvironment } from './ci-adapter/types';

export {
  cnbAdapter,
  githubActionsAdapter,
  localAdapter,
  detectCiAdapter,
  getActiveAdapter,
  getCiEnvironment,
  isCiEnvironment,
} from './ci-adapter/index';

// Core 模块
export {
  // LCOV 解析
  parseLcov,
  readLcovFile,
  getFileCoverage,
  getTotalCoverage,
  // Git 工具
  execGit,
  getCurrentBranch,
  getCurrentCommit,
  getStagedFiles,
  getCommitFiles,
  getPrFiles,
  isPrContext,
  getPrTargetBranch,
  getRepoRoot,
  getStagedFileCount,
  // 计算器
  calculateIncrementalCoverage,
  calculateTotalCoverage,
  checkThresholds,
} from './core/index';

// 配置模块
export {
  findConfigFile,
  loadConfigFile,
  mergeConfig,
  resolveConfig,
  loadConfig,
} from './config';

// 预设模块
export {
  vuePreset,
  reactPreset,
  miniprogramPreset,
  defaultPreset,
  presets,
  getPreset,
} from './presets/index';

// 报告器模块
export {
  consoleReporter,
  cnbReporter,
  githubActionsReporter,
  reporters,
  getReporter,
  formatPct,
  getModeText,
} from './reporters/index';

// 运行器
export { run, parseMode, getRunContext, getChangedFiles } from './runner';
export type { RunOptions } from './runner';

/**
 * 便捷方法：运行覆盖率检测
 * @example
 * ```typescript
 * import { runCoverageCheck, presets } from '@aspect/coverage-tools';
 *
 * const result = await runCoverageCheck({
 *   ...presets.vue,
 *   reporter: 'cnb',
 *   thresholds: { lines: 80 }
 * });
 *
 * console.log(result.success); // true or false
 * console.log(result.incremental.summary.lines.pct); // 覆盖率百分比
 * ```
 */
export async function runCoverageCheck(config?: CoverageConfig): Promise<RunResult> {
  const { loadConfig } = await import('./config');
  const { run } = await import('./runner');

  const resolvedConfig = await loadConfig();

  // 合并用户传入的配置
  if (config) {
    Object.assign(resolvedConfig, {
      ...config,
      thresholds: { ...resolvedConfig.thresholds, ...config.thresholds },
      fileFilter: { ...resolvedConfig.fileFilter, ...config.fileFilter },
    });
  }

  return run({ config: resolvedConfig });
}

// 导入类型用于 runCoverageCheck
import type { CoverageConfig, RunResult } from './types';
