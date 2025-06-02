module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-leaflet$': '<rootDir>/__mocks__/react-leaflet.cjs'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.app.json',
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [1343]
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(leaflet|react-leaflet)/)'
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  maxWorkers: '50%',
  maxConcurrency: 1,
  testTimeout: 10000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Performance optimizations
  cache: true,
  cacheDirectory: '.jest-cache',
  // Coverage report settings
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  // Watch mode settings
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  // Snapshot settings
  snapshotSerializers: ['@emotion/jest/serializer'],
  // Module resolution
  moduleDirectories: ['node_modules', 'src'],
  // Test setup
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  // Coverage exclusions
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/.next/',
    '/out/'
  ]
}; 