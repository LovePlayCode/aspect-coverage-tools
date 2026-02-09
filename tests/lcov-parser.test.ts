/**
 * LCOV Parser 单元测试
 */

import { describe, it, expect } from 'vitest';
import { parseLcov, getFileCoverage, getTotalCoverage } from '../src/core/lcov-parser';

describe('parseLcov', () => {
  it('should parse valid LCOV content', () => {
    const lcovContent = `SF:/path/to/file.ts
FNF:2
FNH:1
LF:10
LH:8
BRF:4
BRH:2
end_of_record
`;

    const result = parseLcov(lcovContent);

    expect(result.size).toBe(1);
    expect(result.has('/path/to/file.ts')).toBe(true);

    const coverage = result.get('/path/to/file.ts')!;
    expect(coverage.lines.total).toBe(10);
    expect(coverage.lines.covered).toBe(8);
    expect(coverage.lines.pct).toBe(80);
    expect(coverage.functions.total).toBe(2);
    expect(coverage.functions.covered).toBe(1);
    expect(coverage.functions.pct).toBe(50);
    expect(coverage.branches.total).toBe(4);
    expect(coverage.branches.covered).toBe(2);
    expect(coverage.branches.pct).toBe(50);
  });

  it('should parse empty LCOV content', () => {
    const result = parseLcov('');
    expect(result.size).toBe(0);
  });

  it('should parse multiple files', () => {
    const lcovContent = `SF:/path/to/file1.ts
LF:10
LH:10
FNF:1
FNH:1
BRF:0
BRH:0
end_of_record
SF:/path/to/file2.ts
LF:20
LH:15
FNF:2
FNH:2
BRF:2
BRH:1
end_of_record
`;

    const result = parseLcov(lcovContent);

    expect(result.size).toBe(2);
    expect(result.has('/path/to/file1.ts')).toBe(true);
    expect(result.has('/path/to/file2.ts')).toBe(true);

    const file1 = result.get('/path/to/file1.ts')!;
    expect(file1.lines.pct).toBe(100);

    const file2 = result.get('/path/to/file2.ts')!;
    expect(file2.lines.pct).toBe(75);
  });

  it('should handle files with zero totals', () => {
    const lcovContent = `SF:/path/to/types.ts
LF:0
LH:0
FNF:0
FNH:0
BRF:0
BRH:0
end_of_record
`;

    const result = parseLcov(lcovContent);
    const coverage = result.get('/path/to/types.ts')!;

    // 零总数应该视为 100% 覆盖率
    expect(coverage.lines.pct).toBe(100);
    expect(coverage.functions.pct).toBe(100);
    expect(coverage.branches.pct).toBe(100);
  });
});

describe('getFileCoverage', () => {
  it('should get coverage by absolute path', () => {
    const coverageData = new Map();
    coverageData.set('/project/src/file.ts', {
      lines: { covered: 8, total: 10, pct: 80 },
      statements: { covered: 8, total: 10, pct: 80 },
      branches: { covered: 2, total: 4, pct: 50 },
      functions: { covered: 1, total: 2, pct: 50 },
    });

    const result = getFileCoverage(coverageData, '/project/src/file.ts');

    expect(result).not.toBeNull();
    expect(result!.lines.pct).toBe(80);
  });

  it('should get coverage by relative path', () => {
    const coverageData = new Map();
    coverageData.set('/project/src/file.ts', {
      lines: { covered: 8, total: 10, pct: 80 },
      statements: { covered: 8, total: 10, pct: 80 },
      branches: { covered: 2, total: 4, pct: 50 },
      functions: { covered: 1, total: 2, pct: 50 },
    });

    const result = getFileCoverage(coverageData, 'src/file.ts', '/project');

    expect(result).not.toBeNull();
    expect(result!.lines.pct).toBe(80);
  });

  it('should return null for non-existent file', () => {
    const coverageData = new Map();
    const result = getFileCoverage(coverageData, 'non-existent.ts');

    expect(result).toBeNull();
  });
});

describe('getTotalCoverage', () => {
  it('should calculate total coverage across all files', () => {
    const coverageData = new Map();
    coverageData.set('/file1.ts', {
      lines: { covered: 8, total: 10, pct: 80 },
      statements: { covered: 8, total: 10, pct: 80 },
      branches: { covered: 2, total: 4, pct: 50 },
      functions: { covered: 1, total: 2, pct: 50 },
    });
    coverageData.set('/file2.ts', {
      lines: { covered: 12, total: 20, pct: 60 },
      statements: { covered: 12, total: 20, pct: 60 },
      branches: { covered: 3, total: 6, pct: 50 },
      functions: { covered: 2, total: 4, pct: 50 },
    });

    const total = getTotalCoverage(coverageData);

    // 20 covered / 30 total = 66.67%
    expect(total.lines.covered).toBe(20);
    expect(total.lines.total).toBe(30);
    expect(total.lines.pct).toBe(66.67);

    // 5 covered / 10 total = 50%
    expect(total.branches.covered).toBe(5);
    expect(total.branches.total).toBe(10);
    expect(total.branches.pct).toBe(50);
  });

  it('should return 100% for empty coverage data', () => {
    const coverageData = new Map();
    const total = getTotalCoverage(coverageData);

    expect(total.lines.pct).toBe(100);
    expect(total.branches.pct).toBe(100);
    expect(total.functions.pct).toBe(100);
  });
});
