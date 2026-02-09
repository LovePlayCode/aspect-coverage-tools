/**
 * CI 适配器模块统一导出
 */

export type { CiAdapter, CiEnvironment } from './types';

export { cnbAdapter } from './cnb';
export { githubActionsAdapter } from './github-actions';
export { localAdapter } from './local';

import { cnbAdapter } from './cnb';
import { githubActionsAdapter } from './github-actions';
import { localAdapter } from './local';
import type { CiAdapter, CiEnvironment } from './types';

/**
 * 所有可用的 CI 适配器（按检测优先级排序）
 */
const adapters: CiAdapter[] = [cnbAdapter, githubActionsAdapter];

/**
 * 自动检测当前 CI 环境并返回对应适配器
 * @returns CI 适配器，如果不在 CI 环境中则返回 null
 */
export function detectCiAdapter(): CiAdapter | null {
  for (const adapter of adapters) {
    if (adapter.isActive()) {
      return adapter;
    }
  }
  return null;
}

/**
 * 获取当前活跃的 CI 适配器
 * 如果不在 CI 环境中，返回本地适配器作为 fallback
 */
export function getActiveAdapter(): CiAdapter {
  return detectCiAdapter() || localAdapter;
}

/**
 * 获取当前 CI 环境信息
 */
export function getCiEnvironment(): CiEnvironment {
  const adapter = getActiveAdapter();
  const isCi = adapter.name !== 'local';

  return {
    isCi,
    isPr: adapter.isPrContext(),
    branch: adapter.getBranch(),
    commit: adapter.getCommit(),
    prNumber: adapter.getPrNumber(),
    targetBranch: adapter.getTargetBranch(),
    adapterName: adapter.name,
  };
}

/**
 * 检查是否在 CI 环境中运行
 */
export function isCiEnvironment(): boolean {
  return detectCiAdapter() !== null;
}
