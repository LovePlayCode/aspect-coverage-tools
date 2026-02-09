/**
 * Core 模块统一导出
 */

export { parseLcov, readLcovFile, getFileCoverage, getTotalCoverage } from './lcov-parser';

export {
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
} from './git-utils';

export {
  calculateIncrementalCoverage,
  calculateTotalCoverage,
  checkThresholds,
} from './calculator';
