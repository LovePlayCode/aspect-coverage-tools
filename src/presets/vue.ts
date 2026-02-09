/**
 * 预设配置 - Vue 项目
 * 适用于 Vue 2/3 项目（.vue, .ts, .tsx）
 */

import type { CoverageConfig } from '../types';

export const vuePreset: CoverageConfig = {
  preset: 'vue',
  coverageFile: 'coverage/lcov.info',
  thresholds: {
    lines: 60,
    branches: 50,
    functions: 50,
    statements: 60,
  },
  fileFilter: {
    extensions: ['.ts', '.tsx', '.vue'],
    include: ['src/'],
    exclude: [
      // 类型定义文件
      '\\.d\\.ts$',
      // 测试文件
      '\\.test\\.ts$',
      '\\.spec\\.ts$',
      '__tests__',
      // 测试配置
      'src/test/',
      // 入口文件
      'main\\.ts$',
      // 配置文件
      '\\.config\\.(ts|js|mjs)$',
      // API 相关（自动生成或封装层）
      'src/api/',
      'openApi/',
      // 路由配置
      'src/router/',
    ],
  },
  strictMode: false,
  baselineBranch: 'master',
};

export default vuePreset;
