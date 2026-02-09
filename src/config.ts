/**
 * 配置加载和解析模块
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CoverageConfig, ResolvedConfig, ReporterFunction } from './types';
import { getPreset, defaultPreset } from './presets/index';

/**
 * 配置文件名列表（按优先级排序）
 */
const CONFIG_FILES = [
  'coverage.config.mjs',
  'coverage.config.js',
  'coverage.config.ts',
  '.coveragerc.mjs',
  '.coveragerc.js',
];

/**
 * 解析布尔类型环境变量
 */
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * 解析数字类型环境变量
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const num = parseFloat(value);
  return Number.isNaN(num) ? defaultValue : num;
}

/**
 * 将字符串或正则表达式数组转换为正则表达式数组
 */
function toRegExpArray(patterns: (string | RegExp)[] | undefined): RegExp[] {
  if (!patterns) return [];
  return patterns.map((p) => (typeof p === 'string' ? new RegExp(p) : p));
}

/**
 * 查找配置文件
 */
export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const filename of CONFIG_FILES) {
    const filepath = path.join(cwd, filename);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }
  return null;
}

/**
 * 加载配置文件
 */
export async function loadConfigFile(filepath: string): Promise<CoverageConfig> {
  try {
    // 使用 dynamic import 加载 ES 模块
    const fileUrl = pathToFileURL(filepath).href;
    const module = await import(fileUrl);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load config file: ${filepath}`, error);
    return {};
  }
}

/**
 * 合并配置（用户配置覆盖预设配置）
 */
export function mergeConfig(
  userConfig: CoverageConfig,
  presetConfig: CoverageConfig
): CoverageConfig {
  return {
    ...presetConfig,
    ...userConfig,
    thresholds: {
      ...presetConfig.thresholds,
      ...userConfig.thresholds,
    },
    fileFilter: {
      ...presetConfig.fileFilter,
      ...userConfig.fileFilter,
    },
  };
}

/**
 * 从环境变量中获取阈值配置
 */
function getThresholdsFromEnv(defaults: Required<ResolvedConfig['thresholds']>): Required<ResolvedConfig['thresholds']> {
  return {
    lines: parseNumber(process.env.COVERAGE_THRESHOLD_LINES, defaults.lines),
    branches: parseNumber(process.env.COVERAGE_THRESHOLD_BRANCHES, defaults.branches),
    functions: parseNumber(process.env.COVERAGE_THRESHOLD_FUNCTIONS, defaults.functions),
    statements: parseNumber(process.env.COVERAGE_THRESHOLD_STATEMENTS, defaults.statements),
  };
}

/**
 * 解析完整配置（填充默认值）
 */
export function resolveConfig(config: CoverageConfig): ResolvedConfig {
  // 获取预设配置
  const presetName = config.preset || 'default';
  const presetConfig = getPreset(presetName);

  // 合并配置
  const merged = mergeConfig(config, presetConfig);

  // 基础默认值
  const baseThresholds = {
    lines: merged.thresholds?.lines ?? 60,
    branches: merged.thresholds?.branches ?? 50,
    functions: merged.thresholds?.functions ?? 50,
    statements: merged.thresholds?.statements ?? 60,
  };

  // 从环境变量覆盖阈值
  const thresholds = getThresholdsFromEnv(baseThresholds);

  return {
    preset: presetName,
    reporter: merged.reporter || 'console',
    coverageFile: merged.coverageFile || path.join(process.cwd(), 'coverage/lcov.info'),
    thresholds,
    fileFilter: {
      extensions: merged.fileFilter?.extensions || ['.ts', '.tsx', '.js', '.jsx', '.vue'],
      include: toRegExpArray(merged.fileFilter?.include),
      exclude: toRegExpArray(merged.fileFilter?.exclude),
    },
    strictMode: parseBoolean(process.env.COVERAGE_STRICT, merged.strictMode ?? false),
    baselineBranch: merged.baselineBranch || process.env.BASELINE_BRANCH || 'master',
  };
}

/**
 * 加载并解析配置
 */
export async function loadConfig(
  configPath?: string,
  cwd: string = process.cwd()
): Promise<ResolvedConfig> {
  let userConfig: CoverageConfig = {};

  // 加载配置文件
  const filepath = configPath || findConfigFile(cwd);
  if (filepath) {
    userConfig = await loadConfigFile(filepath);
  }

  return resolveConfig(userConfig);
}
