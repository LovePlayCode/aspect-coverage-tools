/**
 * Calculator 单元测试
 */

import { describe, it, expect } from 'vitest';
import { calculateIncrementalCoverage, checkThresholds } from '../src/core/calculator';
import type { FileCoverage } from '../src/types';

describe('calculateIncrementalCoverage', () => {
  it('should calculate coverage for changed files', () => {
    const coverageData = new Map<string, FileCoverage>();
    coverageData.set('/project/src/file1.ts', {
      lines: { covered: 8, total: 10, pct: 80 },
      statements: { covered: 8, total: 10, pct: 80 },
      branches: { covered: 2, total: 4, pct: 50 },
      functions: { covered: 1, total: 2, pct: 50 },
    });
    coverageData.set('/project/src/file2.ts', {
      lines: { covered: 15, total: 20, pct: 75 },
      statements: { covered: 15, total: 20, pct: 75 },
      branches: { covered: 3, total: 6, pct: 50 },
      functions: { covered: 2, total: 4, pct: 50 },
    });

    const changedFiles = ['src/file1.ts'];
    const result = calculateIncrementalCoverage(coverageData, changedFiles, '/project');

    expect(result.files).toHaveLength(1);
    expect(result.files[0].file).toBe('src/file1.ts');
    expect(result.files[0].hasCoverage).toBe(true);
    expect(result.summary.lines.pct).toBe(80);
  });

  it('should handle files without coverage data', () => {
    const coverageData = new Map<string, FileCoverage>();

    const changedFiles = ['src/new-file.ts'];
    const result = calculateIncrementalCoverage(coverageData, changedFiles, '/project');

    expect(result.files).toHaveLength(1);
    expect(result.files[0].hasCoverage).toBe(false);
    expect(result.summary.lines.pct).toBe(0);
  });

  it('should identify type-only files', () => {
    const coverageData = new Map<string, FileCoverage>();
    coverageData.set('/project/src/types.ts', {
      lines: { covered: 0, total: 0, pct: 100 },
      statements: { covered: 0, total: 0, pct: 100 },
      branches: { covered: 0, total: 0, pct: 100 },
      functions: { covered: 0, total: 0, pct: 100 },
    });

    const changedFiles = ['src/types.ts'];
    const result = calculateIncrementalCoverage(coverageData, changedFiles, '/project');

    expect(result.typeOnlyFiles).toHaveLength(1);
    expect(result.typeOnlyFiles[0].isTypeOnly).toBe(true);
    expect(result.files).toHaveLength(0);
    expect(result.summary.lines.pct).toBe(100);
  });

  it('should return empty result for no changed files', () => {
    const coverageData = new Map<string, FileCoverage>();

    const result = calculateIncrementalCoverage(coverageData, [], '/project');

    expect(result.files).toHaveLength(0);
    expect(result.typeOnlyFiles).toHaveLength(0);
    expect(result.summary.lines.pct).toBe(0);
  });

  it('should sort files by coverage (lowest first)', () => {
    const coverageData = new Map<string, FileCoverage>();
    coverageData.set('/project/src/high.ts', {
      lines: { covered: 9, total: 10, pct: 90 },
      statements: { covered: 9, total: 10, pct: 90 },
      branches: { covered: 4, total: 4, pct: 100 },
      functions: { covered: 2, total: 2, pct: 100 },
    });
    coverageData.set('/project/src/low.ts', {
      lines: { covered: 3, total: 10, pct: 30 },
      statements: { covered: 3, total: 10, pct: 30 },
      branches: { covered: 1, total: 4, pct: 25 },
      functions: { covered: 0, total: 2, pct: 0 },
    });

    const changedFiles = ['src/high.ts', 'src/low.ts'];
    const result = calculateIncrementalCoverage(coverageData, changedFiles, '/project');

    expect(result.files[0].file).toBe('src/low.ts');
    expect(result.files[1].file).toBe('src/high.ts');
  });
});

describe('checkThresholds', () => {
  it('should pass when all metrics meet thresholds', () => {
    const summary: FileCoverage = {
      lines: { covered: 80, total: 100, pct: 80 },
      statements: { covered: 80, total: 100, pct: 80 },
      branches: { covered: 60, total: 100, pct: 60 },
      functions: { covered: 60, total: 100, pct: 60 },
    };

    const thresholds = {
      lines: 60,
      branches: 50,
      functions: 50,
      statements: 60,
    };

    const result = checkThresholds(summary, thresholds);

    expect(result.passed).toBe(true);
    expect(result.details.every((d) => d.passed)).toBe(true);
  });

  it('should fail when any metric is below threshold', () => {
    const summary: FileCoverage = {
      lines: { covered: 50, total: 100, pct: 50 },
      statements: { covered: 50, total: 100, pct: 50 },
      branches: { covered: 60, total: 100, pct: 60 },
      functions: { covered: 60, total: 100, pct: 60 },
    };

    const thresholds = {
      lines: 60,
      branches: 50,
      functions: 50,
      statements: 60,
    };

    const result = checkThresholds(summary, thresholds);

    expect(result.passed).toBe(false);

    const linesDetail = result.details.find((d) => d.key === 'lines')!;
    expect(linesDetail.passed).toBe(false);
    expect(linesDetail.actual).toBe(50);
    expect(linesDetail.threshold).toBe(60);
  });

  it('should include key in threshold check details', () => {
    const summary: FileCoverage = {
      lines: { covered: 80, total: 100, pct: 80 },
      statements: { covered: 80, total: 100, pct: 80 },
      branches: { covered: 60, total: 100, pct: 60 },
      functions: { covered: 60, total: 100, pct: 60 },
    };

    const thresholds = {
      lines: 60,
      branches: 50,
      functions: 50,
      statements: 60,
    };

    const result = checkThresholds(summary, thresholds);

    expect(result.details).toHaveLength(4);
    expect(result.details.map((d) => d.key)).toEqual(['lines', 'branches', 'functions', 'statements']);
  });
});
