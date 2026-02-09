/**
 * 预设配置 - React 项目
 * 适用于 React 项目（.tsx, .ts, .jsx, .js）
 */

import type { CoverageConfig } from '../types';

export const reactPreset: CoverageConfig = {
  preset: 'react',
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
      // 测试配置
      'src/test/',
      'src/setupTests\\.',
      // 入口文件
      'index\\.(ts|tsx|js|jsx)$',
      'main\\.(ts|tsx|js|jsx)$',
      // 配置文件
      '\\.config\\.(ts|js|mjs)$',
      // API 相关
      'src/api/',
      'src/services/',
      // 路由配置
      'src/router/',
      'src/routes/',
      // 样式文件入口
      'src/styles/',
    ],
  },
  strictMode: false,
  baselineBranch: 'master',
};

export default reactPreset;
