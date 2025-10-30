module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mocks for @google/genai since we don't need to test the library itself
    '^@google/genai$': '<rootDir>/__mocks__/@google/genai.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: {
            "jsx": "react-jsx"
        }
    }],
  },
};
