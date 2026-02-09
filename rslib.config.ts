import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2022',
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
      'presets/index': './src/presets/index.ts',
      'reporters/index': './src/reporters/index.ts',
      cli: './src/cli.ts',
    },
  },
  output: {
    target: 'node',
  },
});
