/**
 * GitHub Actions 报告器
 * 在控制台报告基础上，输出 GitHub Actions 的输出变量和工作流命令
 */

import type { ReporterOptions } from '../types';
import { consoleReporter } from './console';

/**
 * 格式化百分比值（GitHub Actions 格式）
 */
function formatGhaPct(value: number | undefined | null): string {
  return value !== undefined && value !== null ? `${value}%` : 'N/A';
}

/**
 * 输出 GitHub Actions 环境变量
 * 使用 GITHUB_OUTPUT 文件方式（推荐）
 */
function outputGhaVariables(options: ReporterOptions): void {
  const { incremental, total, thresholdResult } = options;
  const summary = incremental.summary;

  // 使用 echo 方式输出到 GITHUB_OUTPUT（新版语法）
  const outputFile = process.env.GITHUB_OUTPUT;

  if (outputFile) {
    // 新版 GitHub Actions 语法
    const fs = require('node:fs');

    const outputs = [
      `incr_lines_pct=${formatGhaPct(summary.lines.pct)}`,
      `incr_statements_pct=${formatGhaPct(summary.statements.pct)}`,
      `incr_branches_pct=${formatGhaPct(summary.branches.pct)}`,
      `incr_functions_pct=${formatGhaPct(summary.functions.pct)}`,
      `incr_lines_covered=${summary.lines.covered}`,
      `incr_lines_total=${summary.lines.total}`,
      `incr_files_total=${incremental.files.length}`,
      `incr_files_covered=${incremental.files.filter((f) => f.hasCoverage && f.lines.pct > 0).length}`,
      `passed=${thresholdResult.passed}`,
    ];

    if (total) {
      outputs.push(
        `total_lines_pct=${formatGhaPct(total.lines.pct)}`,
        `total_branches_pct=${formatGhaPct(total.branches.pct)}`,
        `total_functions_pct=${formatGhaPct(total.functions.pct)}`
      );
    }

    fs.appendFileSync(outputFile, outputs.join('\n') + '\n');
  } else {
    // 兼容旧版语法（::set-output）
    console.log(`::set-output name=incr_lines_pct::${formatGhaPct(summary.lines.pct)}`);
    console.log(`::set-output name=incr_branches_pct::${formatGhaPct(summary.branches.pct)}`);
    console.log(`::set-output name=incr_functions_pct::${formatGhaPct(summary.functions.pct)}`);
    console.log(`::set-output name=passed::${thresholdResult.passed}`);
  }

  // 如果未通过，输出警告
  if (!thresholdResult.passed) {
    for (const detail of thresholdResult.details) {
      if (!detail.passed) {
        console.log(`::warning::${detail.name}未达标: ${detail.actual}% < ${detail.threshold}%`);
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
