/**
 * 覆盖率工具类型定义
 */

// ============================================================
// 覆盖率指标类型
// ============================================================

/**
 * 单个覆盖率指标
 */
export interface CoverageMetric {
  /** 已覆盖数量 */
  covered: number;
  /** 总数量 */
  total: number;
  /** 百分比 */
  pct: number;
}

/**
 * 文件覆盖率数据
 */
export interface FileCoverage {
  /** 行覆盖率 */
  lines: CoverageMetric;
  /** 语句覆盖率 */
  statements: CoverageMetric;
  /** 分支覆盖率 */
  branches: CoverageMetric;
  /** 函数覆盖率 */
  functions: CoverageMetric;
}

/**
 * 文件覆盖率结果
 */
export interface FileResult {
  /** 文件路径 */
  file: string;
  /** 是否有覆盖率数据 */
  hasCoverage: boolean;
  /** 是否为纯类型文件 */
  isTypeOnly: boolean;
  /** 行覆盖率 */
  lines: CoverageMetric;
  /** 语句覆盖率 */
  statements: CoverageMetric;
  /** 分支覆盖率 */
  branches: CoverageMetric;
  /** 函数覆盖率 */
  functions: CoverageMetric;
}

/**
 * 增量覆盖率结果
 */
export interface IncrementalResult {
  /** 文件级结果 */
  files: FileResult[];
  /** 纯类型文件 */
  typeOnlyFiles: FileResult[];
  /** 汇总数据 */
  summary: FileCoverage;
}

// ============================================================
// 配置类型
// ============================================================

/**
 * 覆盖率阈值配置
 */
export interface ThresholdsConfig {
  /** 行覆盖率阈值 */
  lines?: number;
  /** 分支覆盖率阈值 */
  branches?: number;
  /** 函数覆盖率阈值 */
  functions?: number;
  /** 语句覆盖率阈值 */
  statements?: number;
}

/**
 * 文件过滤配置
 */
export interface FileFilterConfig {
  /** 包含的扩展名 */
  extensions?: string[];
  /** 包含的路径模式（正则表达式） */
  include?: (string | RegExp)[];
  /** 排除的路径模式（正则表达式） */
  exclude?: (string | RegExp)[];
}

/**
 * 覆盖率工具完整配置
 */
export interface CoverageConfig {
  /** 预设名称 */
  preset?: 'vue' | 'react' | 'miniprogram' | 'default';
  /** 报告器类型 */
  reporter?: 'cnb' | 'github-actions' | 'console' | ReporterFunction;
  /** 覆盖率报告文件路径 */
  coverageFile?: string;
  /** 覆盖率阈值 */
  thresholds?: ThresholdsConfig;
  /** 文件过滤配置 */
  fileFilter?: FileFilterConfig;
  /** 严格模式：低于阈值时退出码为 1 */
  strictMode?: boolean;
  /** 基准分支（用于 PR 场景） */
  baselineBranch?: string;
}

/**
 * 解析后的内部配置（所有字段都有默认值）
 */
export interface ResolvedConfig {
  preset: string;
  reporter: string | ReporterFunction;
  coverageFile: string;
  thresholds: Required<ThresholdsConfig>;
  fileFilter: {
    extensions: string[];
    include: RegExp[];
    exclude: RegExp[];
  };
  strictMode: boolean;
  baselineBranch: string;
}

// ============================================================
// 运行模式类型
// ============================================================

/**
 * 运行模式
 */
export type RunMode = 'staged' | 'commit' | 'ci' | 'pr';

/**
 * 运行上下文
 */
export interface RunContext {
  /** 运行模式 */
  mode: RunMode;
  /** 当前分支 */
  currentBranch: string;
  /** 当前 commit SHA */
  currentCommit: string;
  /** 是否在 CI 环境 */
  isCi: boolean;
  /** 是否是 PR 场景 */
  isPr: boolean;
  /** PR 目标分支 */
  targetBranch: string | null;
}

// ============================================================
// 报告器类型
// ============================================================

/**
 * 阈值检查详情
 */
export interface ThresholdCheckDetail {
  /** 指标名称 */
  name: string;
  /** 实际值 */
  actual: number;
  /** 阈值 */
  threshold: number;
  /** 是否通过 */
  passed: boolean;
}

/**
 * 阈值检查结果
 */
export interface ThresholdCheckResult {
  /** 是否全部通过 */
  passed: boolean;
  /** 检查详情 */
  details: ThresholdCheckDetail[];
}

/**
 * 报告器选项
 */
export interface ReporterOptions {
  /** 运行模式 */
  mode: RunMode;
  /** 变更的文件列表 */
  changedFiles: string[];
  /** 增量覆盖率结果 */
  incremental: IncrementalResult;
  /** 全量覆盖率结果 */
  total: FileCoverage | null;
  /** 阈值检查结果 */
  thresholdResult: ThresholdCheckResult;
  /** 配置 */
  config: ResolvedConfig;
}

/**
 * 报告器函数类型
 */
export type ReporterFunction = (options: ReporterOptions) => boolean;

// ============================================================
// CLI 类型
// ============================================================

/**
 * CLI 参数
 */
export interface CliOptions {
  /** 预设 */
  preset?: string;
  /** 报告器 */
  reporter?: string;
  /** 配置文件路径 */
  config?: string;
  /** 运行模式 */
  mode?: RunMode;
  /** 严格模式 */
  strict?: boolean;
  /** 显示帮助 */
  help?: boolean;
  /** 显示版本 */
  version?: boolean;
}
