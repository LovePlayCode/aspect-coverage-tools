/**
 * CNB 平台报告器
 * 在控制台报告基础上，额外输出 CNB 平台的环境变量
 */

import type { ReporterOptions } from '../types';
import { consoleReporter, formatPct } from './console';

/**
 * 输出 CNB 环境变量
 */
function outputCnbVariables(options: ReporterOptions): void {
  const { incremental, total } = options;
  const summary = incremental.summary;

  // 增量覆盖率变量
  console.log(`##[set-output INCR_LINES_PCT=${formatPct(summary.lines.pct)}]`);
  console.log(`##[set-output INCR_STATEMENTS_PCT=${formatPct(summary.statements.pct)}]`);
  console.log(`##[set-output INCR_BRANCHES_PCT=${formatPct(summary.branches.pct)}]`);
  console.log(`##[set-output INCR_FUNCTIONS_PCT=${formatPct(summary.functions.pct)}]`);
  console.log(`##[set-output INCR_LINES_COVERED=${summary.lines.covered}]`);
  console.log(`##[set-output INCR_LINES_TOTAL=${summary.lines.total}]`);

  // 文件统计
  const filesTotal = incremental.files.length;
  const filesCovered = incremental.files.filter((f) => f.hasCoverage && f.lines.pct > 0).length;
  console.log(`##[set-output INCR_FILES_TOTAL=${filesTotal}]`);
  console.log(`##[set-output INCR_FILES_COVERED=${filesCovered}]`);

  // 全量覆盖率变量
  if (total) {
    console.log(`##[set-output TOTAL_LINES_PCT=${formatPct(total.lines.pct)}]`);
    console.log(`##[set-output TOTAL_BRANCHES_PCT=${formatPct(total.branches.pct)}]`);
    console.log(`##[set-output TOTAL_FUNCTIONS_PCT=${formatPct(total.functions.pct)}]`);
  }
}

/**
 * CNB 报告器
 */
export function cnbReporter(options: ReporterOptions): boolean {
  // 先执行控制台报告
  const passed = consoleReporter(options);

  // 输出 CNB 环境变量
  outputCnbVariables(options);

  return passed;
}

export default cnbReporter;
