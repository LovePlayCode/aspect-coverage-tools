/**
 * 基础报告器
 * 提供控制台输出的核心逻辑，其他报告器可以继承使用
 */

import type { ReporterOptions, FileResult, ThresholdCheckResult } from '../types';

/**
 * 格式化百分比值
 */
export function formatPct(value: number | undefined | null): string {
  return value !== undefined && value !== null ? `${value}%` : 'N/A';
}

/**
 * 获取运行模式文本描述
 */
export function getModeText(mode: string): string {
  const modeTextMap: Record<string, string> = {
    staged: '暂存区文件 (pre-commit)',
    commit: '本次 commit 文件',
    ci: 'CI 流水线 (本次 commit)',
    pr: 'PR 变更文件',
  };
  return modeTextMap[mode] || mode;
}

/**
 * 打印分隔线
 */
export function printDivider(char: string = '=', length: number = 70): void {
  console.log(char.repeat(length));
}

/**
 * 打印文件统计
 */
export function printFileStats(
  changedFiles: string[],
  files: FileResult[],
  typeOnlyFiles: FileResult[]
): void {
  const coveredFiles = files.filter((f) => f.hasCoverage && f.lines.pct > 0).length;
  const uncoveredFiles = files.filter((f) => !f.hasCoverage || f.lines.pct === 0).length;
  const typeOnlyCount = typeOnlyFiles.length;

  console.log('\n📁 文件统计:');
  console.log(`   总计: ${changedFiles.length} 个文件`);
  console.log(`   有测试覆盖: ${coveredFiles} 个`);
  console.log(`   无测试覆盖: ${uncoveredFiles} 个`);
  if (typeOnlyCount > 0) {
    console.log(`   纯类型文件: ${typeOnlyCount} 个（无需测试）`);
  }
}

/**
 * 打印纯类型文件列表
 */
export function printTypeOnlyFiles(typeOnlyFiles: FileResult[]): void {
  if (typeOnlyFiles.length > 0) {
    console.log('\n📝 纯类型文件（编译后无可执行代码，自动跳过）:');
    for (const file of typeOnlyFiles) {
      console.log(`   📄 ${file.file}`);
    }
  }
}

/**
 * 打印文件明细
 */
export function printFileDetails(files: FileResult[], lineThreshold: number): void {
  if (files.length > 0) {
    console.log('\n📋 文件明细（按覆盖率排序）:');

    for (const file of files) {
      const icon = file.lines.pct >= lineThreshold ? '✅' : '⚠️';
      console.log(`${icon} ${file.file}`);
      console.log(
        `   行: ${file.lines.pct}% (${file.lines.covered}/${file.lines.total}) | 分支: ${file.branches.pct}% | 函数: ${file.functions.pct}%`
      );
    }
  }
}

/**
 * 打印覆盖率汇总
 */
export function printSummary(summary: {
  lines: { pct: number; covered: number; total: number };
  statements: { pct: number; covered: number; total: number };
  branches: { pct: number; covered: number; total: number };
  functions: { pct: number; covered: number; total: number };
}): void {
  console.log('\n📊 覆盖率汇总:');
  console.log(`  📏 行覆盖率:   ${summary.lines.pct}% (${summary.lines.covered}/${summary.lines.total})`);
  console.log(`  📝 语句覆盖率: ${summary.statements.pct}% (${summary.statements.covered}/${summary.statements.total})`);
  console.log(`  🌿 分支覆盖率: ${summary.branches.pct}% (${summary.branches.covered}/${summary.branches.total})`);
  console.log(`  🔧 函数覆盖率: ${summary.functions.pct}% (${summary.functions.covered}/${summary.functions.total})`);
}

/**
 * 打印阈值检查结果
 */
export function printThresholdCheck(thresholdResult: ThresholdCheckResult): void {
  console.log('\n🎯 阈值检查:');
  for (const detail of thresholdResult.details) {
    const icon = detail.passed ? '✅' : '❌';
    const status = detail.passed ? '通过' : '未通过';
    console.log(`  ${icon} ${detail.name}: ${detail.actual}% (阈值: ${detail.threshold}%) - ${status}`);
  }
}

/**
 * 打印全量覆盖率（参考）
 */
export function printTotalCoverage(total: {
  lines: { pct: number; covered: number; total: number };
  branches: { pct: number; covered: number; total: number };
  functions: { pct: number; covered: number; total: number };
} | null): void {
  if (total) {
    console.log('\n📈 全量覆盖率（整个项目，仅供参考）');
    printDivider('-');
    console.log(`  📏 行覆盖率:   ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);
    console.log(`  🌿 分支覆盖率: ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
    console.log(`  🔧 函数覆盖率: ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
  }
}

/**
 * 打印最终结果
 */
export function printFinalResult(passed: boolean, strictMode: boolean): void {
  console.log('');
  printDivider();

  if (passed) {
    console.log('✅ 增量覆盖率检测通过\n');
  } else {
    console.log('❌ 增量覆盖率检测未通过');
    if (strictMode) {
      console.log('⚠️  严格模式已启用，流程将被阻断\n');
    }
    console.log('');
  }
}

/**
 * 控制台报告器 - 基础实现
 */
export function consoleReporter(options: ReporterOptions): boolean {
  const { mode, changedFiles, incremental, total, thresholdResult, config } = options;

  console.log('\n📊 增量覆盖率报告');
  printDivider();
  console.log(`   模式: ${getModeText(mode)}`);

  console.log('\n📈 本次提交覆盖率');
  printDivider('-');

  // 文件统计
  printFileStats(changedFiles, incremental.files, incremental.typeOnlyFiles);

  // 纯类型文件明细
  printTypeOnlyFiles(incremental.typeOnlyFiles);

  // 文件明细
  printFileDetails(incremental.files, config.thresholds.lines);

  // 汇总
  printSummary(incremental.summary);

  // 阈值检查
  printThresholdCheck(thresholdResult);

  // 全量覆盖率（参考）
  printTotalCoverage(total);

  // 最终结果
  const passed = thresholdResult.passed;
  printFinalResult(passed, config.strictMode);

  return passed;
}

export default consoleReporter;
