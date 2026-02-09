/**
 * GitHub Actions 报告器
 * 在控制台报告基础上，输出 GitHub Actions 的输出变量和工作流命令
 */

import type { ReporterOptions } from '../types';
import { consoleReporter, formatPct } from './console';
import { githubActionsAdapter } from '../ci-adapter/github-actions';

/**
 * 输出 GitHub Actions 环境变量（使用适配器）
 */
function outputGhaVariables(options: ReporterOptions): void {
  const { incremental, total, thresholdResult, changedFiles } = options;
  const summary = incremental.summary;
  const adapter = githubActionsAdapter;

  // 无变更文件时输出默认值
  if (changedFiles.length === 0) {
    adapter.setOutput('incr_lines_pct', '100%');
    adapter.setOutput('incr_statements_pct', '100%');
    adapter.setOutput('incr_branches_pct', '100%');
    adapter.setOutput('incr_functions_pct', '100%');
    adapter.setOutput('incr_lines_covered', '0');
    adapter.setOutput('incr_lines_total', '0');
    adapter.setOutput('incr_files_total', '0');
    adapter.setOutput('incr_files_covered', '0');
    adapter.setOutput('passed', 'true');
    return;
  }

  // 增量覆盖率变量
  adapter.setOutput('incr_lines_pct', formatPct(summary.lines.pct));
  adapter.setOutput('incr_statements_pct', formatPct(summary.statements.pct));
  adapter.setOutput('incr_branches_pct', formatPct(summary.branches.pct));
  adapter.setOutput('incr_functions_pct', formatPct(summary.functions.pct));
  adapter.setOutput('incr_lines_covered', String(summary.lines.covered));
  adapter.setOutput('incr_lines_total', String(summary.lines.total));

  // 文件统计
  const filesTotal = incremental.files.length;
  const filesCovered = incremental.files.filter((f) => f.hasCoverage && f.lines.pct > 0).length;
  adapter.setOutput('incr_files_total', String(filesTotal));
  adapter.setOutput('incr_files_covered', String(filesCovered));
  adapter.setOutput('passed', String(thresholdResult.passed));

  // 全量覆盖率变量
  if (total) {
    adapter.setOutput('total_lines_pct', formatPct(total.lines.pct));
    adapter.setOutput('total_branches_pct', formatPct(total.branches.pct));
    adapter.setOutput('total_functions_pct', formatPct(total.functions.pct));
  }

  // 如果未通过，输出警告
  if (!thresholdResult.passed) {
    for (const detail of thresholdResult.details) {
      if (!detail.passed) {
        adapter.setWarning(`${detail.name}未达标: ${detail.actual}% < ${detail.threshold}%`);
      }
    }
  }
}

/**
 * GitHub Actions 报告器
 */
export function githubActionsReporter(options: ReporterOptions): boolean {
  // 先执行控制台报告
  const passed = consoleReporter(options);

  // 输出 GitHub Actions 环境变量
  outputGhaVariables(options);

  return passed;
}

export default githubActionsReporter;
