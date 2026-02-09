/**
 * Git 操作工具模块
 * 提供获取暂存区文件、单次 commit 变更文件等功能
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import type { FileFilterConfig } from '../types';

/**
 * 内部使用的过滤选项
 */
interface InternalFilterOptions {
  extensions: string[];
  include: RegExp[];
  exclude: RegExp[];
}

/**
 * 执行 git 命令并返回结果
 * @param command - git 命令
 * @returns 命令输出或 null
 */
export function execGit(command: string): string | null {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

/**
 * 获取当前分支名
 */
export function getCurrentBranch(): string {
  return process.env.CNB_BRANCH || execGit('git rev-parse --abbrev-ref HEAD') || 'unknown';
}

/**
 * 获取当前提交 SHA
 */
export function getCurrentCommit(): string {
  return process.env.CNB_COMMIT || execGit('git rev-parse HEAD') || 'HEAD';
}

/**
 * 将用户配置转换为内部过滤选项
 */
function normalizeFilterOptions(options: FileFilterConfig): InternalFilterOptions {
  const extensions = options.extensions || ['.ts', '.tsx', '.js', '.jsx', '.vue'];

  const include = (options.include || []).map((pattern) =>
    typeof pattern === 'string' ? new RegExp(pattern) : pattern
  );

  const exclude = (options.exclude || []).map((pattern) =>
    typeof pattern === 'string' ? new RegExp(pattern) : pattern
  );

  return { extensions, include, exclude };
}

/**
 * 过滤文件列表
 */
function filterFiles(files: string[], options: FileFilterConfig): string[] {
  const { extensions, include, exclude } = normalizeFilterOptions(options);

  return files.filter((file) => {
    if (!file) return false;

    // 检查扩展名
    const ext = path.extname(file);
    if (!extensions.includes(ext)) return false;

    // 检查排除模式
    if (exclude.some((pattern) => pattern.test(file))) return false;

    // 检查包含路径（如果配置了，则只检测这些路径下的文件）
    if (include.length > 0) {
      return include.some((pattern) => pattern.test(file));
    }

    return true;
  });
}

/**
 * 获取暂存区（staged）的文件列表
 * 用于本地 pre-commit 场景
 */
export function getStagedFiles(options: FileFilterConfig = {}): string[] {
  // git diff --cached --name-only --diff-filter=ACMR 获取暂存区文件
  // --diff-filter=ACMR: 只包含 Added, Copied, Modified, Renamed，排除 Deleted
  const output = execGit('git diff --cached --name-only --diff-filter=ACMR');
  if (!output) {
    return [];
  }

  return filterFiles(output.split('\n'), options);
}

/**
 * 获取指定 commit 的变更文件列表
 * 用于本地 commit 检测和 CI 流水线场景
 */
export function getCommitFiles(commitSha: string, options: FileFilterConfig = {}): string[] {
  // git show --name-only --format="" --diff-filter=ACMR 获取单次 commit 的文件
  const output = execGit(`git show --name-only --format="" --diff-filter=ACMR ${commitSha}`);
  if (!output) {
    return [];
  }

  return filterFiles(output.split('\n'), options);
}

/**
 * 获取 PR 相对于目标分支的所有变更文件
 * 用于 PR 场景，获取整个 PR 的累计变更
 */
export function getPrFiles(targetBranch: string, options: FileFilterConfig = {}): string[] {
  // 先 fetch 确保有最新的远程分支信息
  execGit(`git fetch origin ${targetBranch} --depth=50`);

  // 尝试多种方式获取变更文件
  let output: string | null = null;

  // 方式1: 使用 CNB_COMMIT（如果是 merge commit）
  if (process.env.CNB_COMMIT) {
    output = execGit(
      `git diff --name-only --diff-filter=ACMR origin/${targetBranch}...${process.env.CNB_COMMIT}`
    );
  }

  // 方式2: 使用 HEAD（当前 checkout 的位置）
  if (!output) {
    output = execGit(`git diff --name-only --diff-filter=ACMR origin/${targetBranch}...HEAD`);
  }

  // 方式3: 使用两点语法（fallback）
  if (!output) {
    output = execGit(`git diff --name-only --diff-filter=ACMR origin/${targetBranch}..HEAD`);
  }

  if (!output) {
    return [];
  }

  return filterFiles(output.split('\n'), options);
}

/**
 * 检测当前是否在 PR 场景
 */
export function isPrContext(): boolean {
  // CNB 平台 PR 场景会设置 CNB_PULL_REQUEST 环境变量
  const prValue = process.env.CNB_PULL_REQUEST;
  // 只有当值存在且不是 "false"、"0"、空字符串时才认为是 PR 场景
  return !!prValue && prValue !== 'false' && prValue !== '0';
}

/**
 * 获取 PR 的目标分支
 */
export function getPrTargetBranch(): string {
  // CNB 平台：合并类事件触发时，CNB_BRANCH 就是目标分支
  return process.env.CNB_BRANCH || process.env.BASELINE_BRANCH || 'master';
}

/**
 * 获取 Git 仓库根目录
 */
export function getRepoRoot(): string | null {
  return execGit('git rev-parse --show-toplevel');
}

/**
 * 获取暂存区文件数量
 */
export function getStagedFileCount(): number {
  const output = execGit('git diff --cached --name-only');
  if (!output) return 0;
  return output.split('\n').filter(Boolean).length;
}
