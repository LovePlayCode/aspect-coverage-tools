/**
 * GitHub Actions CI 适配器
 */

import fs from 'node:fs';
import type { CiAdapter } from './types';

/**
 * GitHub Actions 适配器
 */
export const githubActionsAdapter: CiAdapter = {
  name: 'github-actions',

  isActive(): boolean {
    return process.env.GITHUB_ACTIONS === 'true';
  },

  getBranch(): string | null {
    // PR 场景使用 head ref，否则使用 ref name
    return process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || null;
  },

  getCommit(): string | null {
    return process.env.GITHUB_SHA || null;
  },

  isPrContext(): boolean {
    return process.env.GITHUB_EVENT_NAME === 'pull_request' || process.env.GITHUB_EVENT_NAME === 'pull_request_target';
  },

  getPrNumber(): string | null {
    // GitHub Actions 的 PR 号需要从 GITHUB_REF 中解析
    // 格式: refs/pull/{number}/merge
    const ref = process.env.GITHUB_REF;
    if (ref && ref.startsWith('refs/pull/')) {
      const match = ref.match(/refs\/pull\/(\d+)\/merge/);
      return match ? match[1] : null;
    }
    return null;
  },

  getTargetBranch(): string | null {
    // PR 场景的目标分支
    return process.env.GITHUB_BASE_REF || null;
  },

  setOutput(key: string, value: string): void {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      // 新版 GitHub Actions 输出方式
      fs.appendFileSync(outputFile, `${key}=${value}\n`);
    } else {
      // 旧版方式（已废弃但保持兼容）
      console.log(`::set-output name=${key}::${value}`);
    }
  },

  setWarning(message: string): void {
    console.log(`::warning::${message}`);
  },

  setError(message: string): void {
    console.log(`::error::${message}`);
  },
};

export default githubActionsAdapter;
