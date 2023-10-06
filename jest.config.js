module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  testTimeout: 10000,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
