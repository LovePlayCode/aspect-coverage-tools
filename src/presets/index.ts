/**
 * Presets 模块统一导出
 */

export { vuePreset } from './vue';
export { reactPreset } from './react';
export { miniprogramPreset } from './miniprogram';
export { defaultPreset } from './default';

import { vuePreset } from './vue';
import { reactPreset } from './react';
import { miniprogramPreset } from './miniprogram';
import { defaultPreset } from './default';
import type { CoverageConfig } from '../types';

/**
 * 预设配置映射
 */
export const presets: Record<string, CoverageConfig> = {
  vue: vuePreset,
  react: reactPreset,
  miniprogram: miniprogramPreset,
  default: defaultPreset,
};

/**
 * 根据名称获取预设
 */
export function getPreset(name: string): CoverageConfig {
  return presets[name] || defaultPreset;
}

export default presets;
