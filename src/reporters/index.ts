/**
 * Reporters 模块统一导出
 */

export { consoleReporter, formatPct, getModeText } from './console';
export { cnbReporter } from './cnb';
export { githubActionsReporter } from './github-actions';

import { consoleReporter } from './console';
import { cnbReporter } from './cnb';
import { githubActionsReporter } from './github-actions';
import type { ReporterFunction } from '../types';

/**
 * 报告器映射
 */
export const reporters: Record<string, ReporterFunction> = {
  console: consoleReporter,
  cnb: cnbReporter,
  'github-actions': githubActionsReporter,
};

/**
 * 根据名称获取报告器
 */
export function getReporter(name: string): ReporterFunction {
  return reporters[name] || consoleReporter;
}

export default reporters;
