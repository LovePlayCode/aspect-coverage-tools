/**
 * 统一错误处理模块
 * 提供结构化的错误类型，便于程序化处理和调试
 */

/**
 * 错误代码常量
 */
export const ErrorCodes = {
  // Git 相关错误
  GIT_COMMAND_FAILED: 'GIT_COMMAND_FAILED',
  GIT_NOT_REPOSITORY: 'GIT_NOT_REPOSITORY',

  // LCOV 相关错误
  LCOV_FILE_NOT_FOUND: 'LCOV_FILE_NOT_FOUND',
  LCOV_PARSE_ERROR: 'LCOV_PARSE_ERROR',

  // 配置相关错误
  CONFIG_FILE_NOT_FOUND: 'CONFIG_FILE_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_LOAD_ERROR: 'CONFIG_LOAD_ERROR',

  // CLI 相关错误
  CLI_INVALID_ARGUMENT: 'CLI_INVALID_ARGUMENT',
  CLI_MISSING_VALUE: 'CLI_MISSING_VALUE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * 覆盖率工具基础错误类
 * 所有自定义错误都继承此类
 */
export class CoverageToolError extends Error {
  /** 错误代码，用于程序化识别 */
  readonly code: ErrorCode;
  /** 错误上下文信息 */
  readonly context?: Record<string, unknown>;

  constructor(message: string, code: ErrorCode, context?: Record<string, unknown>) {
    super(message);
    this.name = 'CoverageToolError';
    this.code = code;
    this.context = context;

    // 确保 instanceof 正常工作
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Git 命令执行错误
 */
export class GitError extends CoverageToolError {
  constructor(message: string, code: ErrorCode = ErrorCodes.GIT_COMMAND_FAILED, context?: Record<string, unknown>) {
    super(message, code, context);
    this.name = 'GitError';
  }

  /**
   * 创建命令执行失败的错误
   */
  static commandFailed(command: string, stderr?: string): GitError {
    return new GitError(`Git 命令执行失败: ${command}`, ErrorCodes.GIT_COMMAND_FAILED, {
      command,
      stderr,
    });
  }

  /**
   * 创建非 Git 仓库的错误
   */
  static notRepository(cwd?: string): GitError {
    return new GitError('当前目录不是 Git 仓库', ErrorCodes.GIT_NOT_REPOSITORY, {
      cwd,
    });
  }
}

/**
 * LCOV 文件解析错误
 */
export class LcovParseError extends CoverageToolError {
  constructor(message: string, code: ErrorCode = ErrorCodes.LCOV_PARSE_ERROR, context?: Record<string, unknown>) {
    super(message, code, context);
    this.name = 'LcovParseError';
  }

  /**
   * 创建文件不存在的错误
   */
  static fileNotFound(filePath: string): LcovParseError {
    return new LcovParseError(`覆盖率报告文件不存在: ${filePath}`, ErrorCodes.LCOV_FILE_NOT_FOUND, {
      filePath,
    });
  }

  /**
   * 创建解析失败的错误
   */
  static parseFailed(filePath: string, reason?: string): LcovParseError {
    return new LcovParseError(`LCOV 文件解析失败: ${filePath}${reason ? ` (${reason})` : ''}`, ErrorCodes.LCOV_PARSE_ERROR, {
      filePath,
      reason,
    });
  }
}

/**
 * 配置加载/解析错误
 */
export class ConfigError extends CoverageToolError {
  constructor(message: string, code: ErrorCode = ErrorCodes.CONFIG_INVALID, context?: Record<string, unknown>) {
    super(message, code, context);
    this.name = 'ConfigError';
  }

  /**
   * 创建配置文件加载失败的错误
   */
  static loadFailed(filePath: string, reason?: string): ConfigError {
    return new ConfigError(`配置文件加载失败: ${filePath}${reason ? ` (${reason})` : ''}`, ErrorCodes.CONFIG_LOAD_ERROR, {
      filePath,
      reason,
    });
  }

  /**
   * 创建配置项无效的错误
   */
  static invalidField(field: string, value: unknown, expected: string): ConfigError {
    return new ConfigError(`配置项 '${field}' 无效: 期望 ${expected}，实际为 ${JSON.stringify(value)}`, ErrorCodes.CONFIG_INVALID, {
      field,
      value,
      expected,
    });
  }
}

/**
 * CLI 参数错误
 */
export class CliError extends CoverageToolError {
  constructor(message: string, code: ErrorCode = ErrorCodes.CLI_INVALID_ARGUMENT, context?: Record<string, unknown>) {
    super(message, code, context);
    this.name = 'CliError';
  }

  /**
   * 创建无效参数的错误
   */
  static invalidArgument(argument: string, value: string, validValues: string[]): CliError {
    return new CliError(
      `无效的参数值 '${value}' (${argument})，可选值: ${validValues.join(', ')}`,
      ErrorCodes.CLI_INVALID_ARGUMENT,
      { argument, value, validValues }
    );
  }

  /**
   * 创建缺少参数值的错误
   */
  static missingValue(argument: string): CliError {
    return new CliError(`参数 '${argument}' 需要一个值`, ErrorCodes.CLI_MISSING_VALUE, {
      argument,
    });
  }
}

/**
 * 类型守卫：检查是否为 CoverageToolError
 */
export function isCoverageToolError(error: unknown): error is CoverageToolError {
  return error instanceof CoverageToolError;
}

/**
 * 类型守卫：检查是否为 GitError
 */
export function isGitError(error: unknown): error is GitError {
  return error instanceof GitError;
}

/**
 * 类型守卫：检查是否为 LcovParseError
 */
export function isLcovParseError(error: unknown): error is LcovParseError {
  return error instanceof LcovParseError;
}

/**
 * 类型守卫：检查是否为 ConfigError
 */
export function isConfigError(error: unknown): error is ConfigError {
  return error instanceof ConfigError;
}

/**
 * 类型守卫：检查是否为 CliError
 */
export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError;
}
