/**
 * CNB 平台 CI 适配器
 * 腾讯云 CNB 平台的环境变量适配
 */

import type { CiAdapter } from './types';

/**
 * CNB 平台适配器
 */
export const cnbAdapter: CiAdapter = {
  name: 'cnb',

  isActive(): boolean {
    // CNB 平台会设置 CNB_COMMIT 环境变量
    return !!process.env.CNB_COMMIT;
  },

  getBranch(): string | null {
    return process.env.CNB_BRANCH || null;
  },

  getCommit(): string | null {
    return process.env.CNB_COMMIT || null;
  },

  isPrContext(): boolean {
    const prValue = process.env.CNB_PULL_REQUEST;
    // 只有当值存在且不是 "false"、"0"、空字符串时才认为是 PR 场景
    return !!prValue && prValue !== 'false' && prValue !== '0';
  },

  getPrNumber(): string | null {
    const prValue = process.env.CNB_PULL_REQUEST;
    if (prValue && prValue !== 'false' && prValue !== '0') {
      return prValue;
    }
    return null;
  },

  getTargetBranch(): string | null {
    // CNB 平台：合并类事件触发时，CNB_BRANCH 就是目标分支
    if (this.isPrContext()) {
      return process.env.CNB_BRANCH || null;
    }
    return null;
  },

  setOutput(key: string, value: string): void {
    console.log(`##[set-output ${key}=${value}]`);
  },

  setWarning(message: string): void {
    console.log(`##[warning]${message}`);
  },

  setError(message: string): void {
    console.log(`##[error]${message}`);
  },
};

export default cnbAdapter;
