const wallaby = {
  files: [
    'backend/**/*.ts',
    'frontend/**/*.ts',
    'frontend/**/*.tsx',
    '!**/*.test.ts',
    '!**/*.test.tsx',
  ],
  tests: [
    'backend/**/*.test.ts',
    'frontend/**/*.test.tsx',
  ],
  env: {
    type: 'node',
  },
  testFramework: 'vitest',
};

export default wallaby;