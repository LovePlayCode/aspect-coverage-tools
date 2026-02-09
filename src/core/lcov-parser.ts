/**
 * LCOV 格式覆盖率报告解析器
 * 支持解析 lcov.info 文件并提供文件级别的覆盖率数据
 */

import fs from 'node:fs';
import path from 'node:path';
import type { FileCoverage, CoverageMetric } from '../types';

/**
 * 创建空的覆盖率数据结构
 */
function createEmptyCoverage(): FileCoverage {
  return {
    lines: { covered: 0, total: 0, pct: 0 },
    statements: { covered: 0, total: 0, pct: 0 },
    branches: { covered: 0, total: 0, pct: 0 },
    functions: { covered: 0, total: 0, pct: 0 },
  };
}

/**
 * 计算覆盖率百分比
 */
function calculatePercentages(data: FileCoverage): void {
  const metrics: (keyof FileCoverage)[] = ['lines', 'statements', 'branches', 'functions'];

  for (const metric of metrics) {
    const { covered, total } = data[metric];
    data[metric].pct = total > 0 ? Math.round((covered / total) * 10000) / 100 : 100;
  }
}

/**
 * 解析 lcov.info 文件内容
 * @param lcovContent - lcov 文件内容
 * @returns 文件路径到覆盖率数据的映射
 */
export function parseLcov(lcovContent: string): Map<string, FileCoverage> {
  const coverage = new Map<string, FileCoverage>();

  let currentFile: string | null = null;
  let currentData: FileCoverage | null = null;

  const lines = lcovContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('SF:')) {
      // 新文件开始
      currentFile = trimmed.substring(3);
      currentData = createEmptyCoverage();
    } else if (trimmed.startsWith('LF:')) {
      // Lines Found (总行数)
      if (currentData) {
        currentData.lines.total = parseInt(trimmed.substring(3), 10);
        currentData.statements.total = currentData.lines.total;
      }
    } else if (trimmed.startsWith('LH:')) {
      // Lines Hit (已覆盖行数)
      if (currentData) {
        currentData.lines.covered = parseInt(trimmed.substring(3), 10);
        currentData.statements.covered = currentData.lines.covered;
      }
    } else if (trimmed.startsWith('BRF:')) {
      // Branches Found (总分支数)
      if (currentData) {
        currentData.branches.total = parseInt(trimmed.substring(4), 10);
      }
    } else if (trimmed.startsWith('BRH:')) {
      // Branches Hit (已覆盖分支数)
      if (currentData) {
        currentData.branches.covered = parseInt(trimmed.substring(4), 10);
      }
    } else if (trimmed.startsWith('FNF:')) {
      // Functions Found (总函数数)
      if (currentData) {
        currentData.functions.total = parseInt(trimmed.substring(4), 10);
      }
    } else if (trimmed.startsWith('FNH:')) {
      // Functions Hit (已覆盖函数数)
      if (currentData) {
        currentData.functions.covered = parseInt(trimmed.substring(4), 10);
      }
    } else if (trimmed === 'end_of_record') {
      // 文件记录结束，计算百分比
      if (currentFile && currentData) {
        calculatePercentages(currentData);
        coverage.set(currentFile, currentData);
      }
      currentFile = null;
      currentData = null;
    }
  }

  return coverage;
}

/**
 * 从文件读取覆盖率数据
 * @param filePath - lcov.info 文件路径
 * @returns 覆盖率数据映射，文件不存在返回 null
 */
export function readLcovFile(filePath: string): Map<string, FileCoverage> | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseLcov(content);
  } catch {
    return null;
  }
}

/**
 * 根据相对路径获取文件覆盖率
 * @param coverageData - 覆盖率数据
 * @param relativePath - 相对路径
 * @param cwd - 当前工作目录
 * @returns 文件覆盖率数据，不存在返回 null
 */
export function getFileCoverage(
  coverageData: Map<string, FileCoverage>,
  relativePath: string,
  cwd: string = process.cwd()
): FileCoverage | null {
  const absolutePath = path.resolve(cwd, relativePath);

  // 直接匹配
  if (coverageData.has(absolutePath)) {
    return coverageData.get(absolutePath)!;
  }

  // 尝试在所有路径中查找
  for (const [key, value] of coverageData.entries()) {
    if (key.endsWith(relativePath) || key.endsWith(relativePath.replace(/\//g, path.sep))) {
      return value;
    }
  }

  return null;
}

/**
 * 获取所有文件的覆盖率汇总
 * @param coverageData - 覆盖率数据
 * @returns 汇总覆盖率
 */
export function getTotalCoverage(coverageData: Map<string, FileCoverage>): FileCoverage {
  const total = createEmptyCoverage();

  for (const data of coverageData.values()) {
    const metrics: (keyof FileCoverage)[] = ['lines', 'statements', 'branches', 'functions'];

    for (const metric of metrics) {
      total[metric].covered += data[metric].covered;
      total[metric].total += data[metric].total;
    }
  }

  calculatePercentages(total);
  return total;
}
