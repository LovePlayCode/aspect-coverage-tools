/**
 * CNB 平台报告器
 * 在控制台报告基础上，额外输出 CNB 平台的环境变量
 */

import type { ReporterOptions } from '../types';
import { consoleReporter, formatPct } from './console';
import { getActiveAdapter } from '../ci-adapter/index';

/**
 * 输出 CI 变量（使用适配器）
 */
function outputCiVariables(options: ReporterOptions): void {
  const { incremental, total, changedFiles } = options;
  const summary = incremental.summary;
  const adapter = getActiveAdapter();

  // 无变更文件时输出默认值
  if (changedFiles.length === 0) {
    adapter.setOutput('INCR_LINES_PCT', '100%');
    adapter.setOutput('INCR_STATEMENTS_PCT', '100%');
    adapter.setOutput('INCR_BRANCHES_PCT', '100%');
    adapter.setOutput('INCR_FUNCTIONS_PCT', '100%');
    adapter.setOutput('INCR_LINES_COVERED', '0');
    adapter.setOutput('INCR_LINES_TOTAL', '0');
    adapter.setOutput('INCR_FILES_TOTAL', '0');
    adapter.setOutput('INCR_FILES_COVERED', '0');
    return;
  }

  // 增量覆盖率变量
  adapter.setOutput('INCR_LINES_PCT', formatPct(summary.lines.pct));
  adapter.setOutput('INCR_STATEMENTS_PCT', formatPct(summary.statements.pct));
  adapter.setOutput('INCR_BRANCHES_PCT', formatPct(summary.branches.pct));
  adapter.setOutput('INCR_FUNCTIONS_PCT', formatPct(summary.functions.pct));
  adapter.setOutput('INCR_LINES_COVERED', String(summary.lines.covered));
  adapter.setOutput('INCR_LINES_TOTAL', String(summary.lines.total));

  // 文件统计
  const filesTotal = incremental.files.length;
  const filesCovered = incremental.files.filter((f) => f.hasCoverage && f.lines.pct > 0).length;
  adapter.setOutput('INCR_FILES_TOTAL', String(filesTotal));
  adapter.setOutput('INCR_FILES_COVERED', String(filesCovered));

  // 全量覆盖率变量
  if (total) {
    adapter.setOutput('TOTAL_LINES_PCT', formatPct(total.lines.pct));
    adapter.setOutput('TOTAL_BRANCHES_PCT', formatPct(total.branches.pct));
    adapter.setOutput('TOTAL_FUNCTIONS_PCT', formatPct(total.functions.pct));
  }
}

/**
 * CNB 报告器
 */
export function cnbReporter(options: ReporterOptions): boolean {
  // 先执行控制台报告
  const passed = consoleReporter(options);

  // 输出 CI 变量
  outputCiVariables(options);

  return passed;
}

export default cnbReporter;
