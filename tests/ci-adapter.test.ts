/**
 * CI Adapter 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cnbAdapter } from '../src/ci-adapter/cnb';
import { githubActionsAdapter } from '../src/ci-adapter/github-actions';
import { localAdapter } from '../src/ci-adapter/local';
import { detectCiAdapter, getActiveAdapter, getCiEnvironment } from '../src/ci-adapter/index';

describe('cnbAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect CNB environment', () => {
    process.env.CNB_COMMIT = 'abc123';
    expect(cnbAdapter.isActive()).toBe(true);
  });

  it('should not detect CNB when env var is missing', () => {
    delete process.env.CNB_COMMIT;
    expect(cnbAdapter.isActive()).toBe(false);
  });

  it('should get branch from CNB_BRANCH', () => {
    process.env.CNB_BRANCH = 'feature/test';
    expect(cnbAdapter.getBranch()).toBe('feature/test');
  });

  it('should get commit from CNB_COMMIT', () => {
    process.env.CNB_COMMIT = 'abc123def456';
    expect(cnbAdapter.getCommit()).toBe('abc123def456');
  });

  it('should detect PR context', () => {
    process.env.CNB_PULL_REQUEST = '123';
    expect(cnbAdapter.isPrContext()).toBe(true);
    expect(cnbAdapter.getPrNumber()).toBe('123');
  });

  it('should not detect PR when CNB_PULL_REQUEST is false', () => {
    process.env.CNB_PULL_REQUEST = 'false';
    expect(cnbAdapter.isPrContext()).toBe(false);
    expect(cnbAdapter.getPrNumber()).toBeNull();
  });

  it('should output in CNB format', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cnbAdapter.setOutput('TEST_VAR', 'test_value');
    expect(consoleSpy).toHaveBeenCalledWith('##[set-output TEST_VAR=test_value]');
    consoleSpy.mockRestore();
  });
});

describe('githubActionsAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect GitHub Actions environment', () => {
    process.env.GITHUB_ACTIONS = 'true';
    expect(githubActionsAdapter.isActive()).toBe(true);
  });

  it('should not detect GitHub Actions when env var is missing', () => {
    delete process.env.GITHUB_ACTIONS;
    expect(githubActionsAdapter.isActive()).toBe(false);
  });

  it('should get branch from GITHUB_REF_NAME', () => {
    process.env.GITHUB_REF_NAME = 'main';
    expect(githubActionsAdapter.getBranch()).toBe('main');
  });

  it('should prefer GITHUB_HEAD_REF for PR branch', () => {
    process.env.GITHUB_HEAD_REF = 'feature/pr-branch';
    process.env.GITHUB_REF_NAME = 'main';
    expect(githubActionsAdapter.getBranch()).toBe('feature/pr-branch');
  });

  it('should detect PR context', () => {
    process.env.GITHUB_EVENT_NAME = 'pull_request';
    expect(githubActionsAdapter.isPrContext()).toBe(true);
  });

  it('should get target branch from GITHUB_BASE_REF', () => {
    process.env.GITHUB_BASE_REF = 'main';
    expect(githubActionsAdapter.getTargetBranch()).toBe('main');
  });

  it('should extract PR number from GITHUB_REF', () => {
    process.env.GITHUB_REF = 'refs/pull/42/merge';
    expect(githubActionsAdapter.getPrNumber()).toBe('42');
  });
});

describe('localAdapter', () => {
  it('should always be active', () => {
    expect(localAdapter.isActive()).toBe(true);
  });

  it('should not be PR context', () => {
    expect(localAdapter.isPrContext()).toBe(false);
  });

  it('should return null for CI-specific values', () => {
    expect(localAdapter.getBranch()).toBeNull();
    expect(localAdapter.getCommit()).toBeNull();
    expect(localAdapter.getPrNumber()).toBeNull();
  });
});

describe('detectCiAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect CNB adapter', () => {
    process.env.CNB_COMMIT = 'abc123';
    delete process.env.GITHUB_ACTIONS;

    const adapter = detectCiAdapter();
    expect(adapter?.name).toBe('cnb');
  });

  it('should detect GitHub Actions adapter', () => {
    delete process.env.CNB_COMMIT;
    process.env.GITHUB_ACTIONS = 'true';

    const adapter = detectCiAdapter();
    expect(adapter?.name).toBe('github-actions');
  });

  it('should return null for local environment', () => {
    delete process.env.CNB_COMMIT;
    delete process.env.GITHUB_ACTIONS;

    const adapter = detectCiAdapter();
    expect(adapter).toBeNull();
  });

  it('should prefer CNB over GitHub Actions', () => {
    process.env.CNB_COMMIT = 'abc123';
    process.env.GITHUB_ACTIONS = 'true';

    const adapter = detectCiAdapter();
    expect(adapter?.name).toBe('cnb');
  });
});

describe('getActiveAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return local adapter when not in CI', () => {
    delete process.env.CNB_COMMIT;
    delete process.env.GITHUB_ACTIONS;

    const adapter = getActiveAdapter();
    expect(adapter.name).toBe('local');
  });

  it('should return CI adapter when in CI', () => {
    process.env.CNB_COMMIT = 'abc123';

    const adapter = getActiveAdapter();
    expect(adapter.name).toBe('cnb');
  });
});

describe('getCiEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return local environment info when not in CI', () => {
    delete process.env.CNB_COMMIT;
    delete process.env.GITHUB_ACTIONS;

    const env = getCiEnvironment();
    expect(env.isCi).toBe(false);
    expect(env.adapterName).toBe('local');
  });

  it('should return CI environment info when in CNB', () => {
    process.env.CNB_COMMIT = 'abc123';
    process.env.CNB_BRANCH = 'feature/test';
    process.env.CNB_PULL_REQUEST = '42';

    const env = getCiEnvironment();
    expect(env.isCi).toBe(true);
    expect(env.isPr).toBe(true);
    expect(env.branch).toBe('feature/test');
    expect(env.commit).toBe('abc123');
    expect(env.prNumber).toBe('42');
    expect(env.adapterName).toBe('cnb');
  });
});
