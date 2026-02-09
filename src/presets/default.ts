/**
 * 预设配置 - 默认配置
 * 通用的基础配置
 */

import type { CoverageConfig } from '../types';

export const defaultPreset: CoverageConfig = {
  preset: 'default',
  coverageFile: 'coverage/lcov.info',
  thresholds: {
    lines: 60,
    branches: 50,
    functions: 50,
    statements: 60,
  },
  fileFilter: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    include: ['src/'],
    exclude: [
      // 类型定义文件
      '\\.d\\.ts$',
      // 测试文件
      '\\.test\\.(ts|tsx|js|jsx)$',
      '\\.spec\\.(ts|tsx|js|jsx)$',
      '__tests__',
      // 配置文件
      '\\.config\\.(ts|js|mjs)$',
    ],
  },
  strictMode: false,
  baselineBranch: 'master',
};

export default defaultPreset;
