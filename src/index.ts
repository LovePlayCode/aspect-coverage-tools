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
  // 报告器类型
  ThresholdCheckDetail,
  ThresholdCheckResult,
  ReporterOptions,
  ReporterFunction,
  // CLI 类型
  CliOptions,
} from './types';

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
 * await runCoverageCheck({
 *   ...presets.vue,
 *   reporter: 'cnb',
 *   thresholds: { lines: 80 }
 * });
 * ```
 */
export async function runCoverageCheck(config?: CoverageConfig): Promise<boolean> {
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
import type { CoverageConfig } from './types';
