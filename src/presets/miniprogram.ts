/**
 * 预设配置 - 微信小程序项目
 * 适用于原生小程序和 Taro 等框架
 */

import type { CoverageConfig } from '../types';

export const miniprogramPreset: CoverageConfig = {
  preset: 'miniprogram',
  coverageFile: 'coverage/lcov.info',
  thresholds: {
    lines: 50,
    branches: 40,
    functions: 50,
    statements: 50,
  },
  fileFilter: {
    extensions: ['.ts', '.js', '.wxs'],
    include: [
      'miniprogram/',
      'src/',
      'pages/',
      'components/',
      'utils/',
    ],
    exclude: [
      // 类型定义文件
      '\\.d\\.ts$',
      // 测试文件
      '\\.test\\.(ts|js)$',
      '\\.spec\\.(ts|js)$',
      '__tests__',
      // 配置文件
      'app\\.(ts|js)$',
      'project\\.config\\.json$',
      'sitemap\\.json$',
      '\\.config\\.(ts|js)$',
      // 构建产物
      'miniprogram_npm/',
      // API 相关
      'api/',
      'services/',
    ],
  },
  strictMode: false,
  baselineBranch: 'master',
};

export default miniprogramPreset;
