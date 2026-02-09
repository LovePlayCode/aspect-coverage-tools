/**
 * CI 适配器接口定义
 * 抽象不同 CI 平台的环境信息获取和输出格式
 */

/**
 * CI 适配器接口
 */
export interface CiAdapter {
  /** 适配器名称 */
  readonly name: string;

  /**
   * 检查当前环境是否为该 CI 平台
   */
  isActive(): boolean;

  /**
   * 获取当前分支名
   */
  getBranch(): string | null;

  /**
   * 获取当前 commit SHA
   */
  getCommit(): string | null;

  /**
   * 检查是否为 PR 场景
   */
  isPrContext(): boolean;

  /**
   * 获取 PR 编号
   */
  getPrNumber(): string | null;

  /**
   * 获取 PR 目标分支
   */
  getTargetBranch(): string | null;

  /**
   * 设置输出变量（CI 平台特定格式）
   */
  setOutput(key: string, value: string): void;

  /**
   * 设置警告消息
   */
  setWarning(message: string): void;

  /**
   * 设置错误消息
   */
  setError(message: string): void;
}

/**
 * CI 环境信息
 */
export interface CiEnvironment {
  /** 是否在 CI 环境 */
  isCi: boolean;
  /** 是否为 PR 场景 */
  isPr: boolean;
  /** 当前分支 */
  branch: string | null;
  /** 当前 commit */
  commit: string | null;
  /** PR 编号 */
  prNumber: string | null;
  /** 目标分支 */
  targetBranch: string | null;
  /** 适配器名称 */
  adapterName: string;
}
