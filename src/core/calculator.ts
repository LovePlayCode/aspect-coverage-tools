/**
 * 覆盖率计算器模块
 * 负责计算增量覆盖率和全量覆盖率
 */

import { getFileCoverage, getTotalCoverage } from './lcov-parser';
import type {
  FileCoverage,
  FileResult,
  IncrementalResult,
  ThresholdsConfig,
  ThresholdCheckResult,
} from '../types';

/**
 * 创建空的文件结果
 */
function createFileResult(file: string): FileResult {
  return {
    file,
    hasCoverage: false,
    isTypeOnly: false,
    lines: { pct: 0, covered: 0, total: 0 },
    statements: { pct: 0, covered: 0, total: 0 },
    branches: { pct: 0, covered: 0, total: 0 },
    functions: { pct: 0, covered: 0, total: 0 },
  };
}

/**
 * 计算增量覆盖率
 * @param coverageData - 覆盖率数据
 * @param changedFiles - 变更的文件列表
 * @param cwd - 当前工作目录
 */
export function calculateIncrementalCoverage(
  coverageData: Map<string, FileCoverage>,
  changedFiles: string[],
  cwd: string = process.cwd()
): IncrementalResult {
  const results: IncrementalResult = {
    files: [],
    typeOnlyFiles: [],
    summary: {
      lines: { covered: 0, total: 0, pct: 0 },
      statements: { covered: 0, total: 0, pct: 0 },
      branches: { covered: 0, total: 0, pct: 0 },
      functions: { covered: 0, total: 0, pct: 0 },
    },
  };

  const metrics: (keyof FileCoverage)[] = ['lines', 'statements', 'branches', 'functions'];

  for (const file of changedFiles) {
    const coverage = getFileCoverage(coverageData, file, cwd);
    const fileResult = createFileResult(file);

    if (coverage) {
      // 检查是否为纯类型文件（编译后无可执行代码）
      const isTypeOnly =
        coverage.lines.total === 0 &&
        coverage.functions.total === 0 &&
        coverage.branches.total === 0;

      if (isTypeOnly) {
        fileResult.isTypeOnly = true;
        fileResult.hasCoverage = true;
        fileResult.lines.pct = 100; // 纯类型文件视为 100% 覆盖
        results.typeOnlyFiles.push(fileResult);
        continue;
      }

      fileResult.hasCoverage = true;

      // 提取各项指标
      for (const metric of metrics) {
        if (coverage[metric]) {
          fileResult[metric] = {
            pct: coverage[metric].pct || 0,
            covered: coverage[metric].covered || 0,
            total: coverage[metric].total || 0,
          };

          // 累加到汇总
          results.summary[metric].covered += fileResult[metric].covered;
          results.summary[metric].total += fileResult[metric].total;
        }
      }
    }

    results.files.push(fileResult);
  }

  // 计算汇总百分比
  const hasOnlyTypeFiles = results.files.length === 0 && results.typeOnlyFiles.length > 0;
  const hasAnyFilesWithCoverage = results.files.some((f) => f.hasCoverage);

  for (const metric of metrics) {
    const { covered, total } = results.summary[metric];
    if (total > 0) {
      // 有可执行代码，计算实际覆盖率
      results.summary[metric].pct = Math.round((covered / total) * 10000) / 100;
    } else if (hasOnlyTypeFiles || hasAnyFilesWithCoverage) {
      // 只有纯类型文件，或者有覆盖率数据但该指标没有可统计项（如无分支）
      results.summary[metric].pct = 100;
    } else {
      // 有变更文件但没有覆盖率数据 → 0%
      results.summary[metric].pct = 0;
    }
  }

  // 按覆盖率排序（低的在前）
  results.files.sort((a, b) => a.lines.pct - b.lines.pct);

  return results;
}

/**
 * 计算全量覆盖率
 */
export function calculateTotalCoverage(coverageData: Map<string, FileCoverage>): FileCoverage {
  return getTotalCoverage(coverageData);
}

/**
 * 检查覆盖率是否满足阈值
 */
export function checkThresholds(
  summary: FileCoverage,
  thresholds: Required<ThresholdsConfig>
): ThresholdCheckResult {
  const results: ThresholdCheckResult = {
    passed: true,
    details: [],
  };

  const checks = [
    { name: '行覆盖率', key: 'lines' as const, threshold: thresholds.lines },
    { name: '分支覆盖率', key: 'branches' as const, threshold: thresholds.branches },
    { name: '函数覆盖率', key: 'functions' as const, threshold: thresholds.functions },
    { name: '语句覆盖率', key: 'statements' as const, threshold: thresholds.statements },
  ];

  for (const check of checks) {
    const actual = summary[check.key]?.pct ?? 0;
    const passed = actual >= check.threshold;

    results.details.push({
      name: check.name,
      actual,
      threshold: check.threshold,
      passed,
    });

    if (!passed) {
      results.passed = false;
    }
  }

  return results;
}
