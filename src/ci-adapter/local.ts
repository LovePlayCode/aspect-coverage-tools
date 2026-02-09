/**
 * 本地环境适配器
 * 用于非 CI 环境的 fallback
 */

import type { CiAdapter } from './types';

/**
 * 本地环境适配器
 */
export const localAdapter: CiAdapter = {
  name: 'local',

  isActive(): boolean {
    // 本地环境作为 fallback，总是可用
    return true;
  },

  getBranch(): string | null {
    // 本地环境不提供分支信息，由 git-utils 获取
    return null;
  },

  getCommit(): string | null {
    // 本地环境不提供 commit 信息，由 git-utils 获取
    return null;
  },

  isPrContext(): boolean {
    return false;
  },

  getPrNumber(): string | null {
    return null;
  },

  getTargetBranch(): string | null {
    return process.env.BASELINE_BRANCH || null;
  },

  setOutput(key: string, value: string): void {
    // 本地环境不输出 CI 变量，仅打印到控制台供调试
    console.log(`[OUTPUT] ${key}=${value}`);
  },

  setWarning(message: string): void {
    console.warn(`⚠️  ${message}`);
  },

  setError(message: string): void {
    console.error(`❌ ${message}`);
  },
};

export default localAdapter;
