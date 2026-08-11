import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3001',
  },
  webServer: {
    command: 'PORT=3001 node src/server.js',
    url: 'http://127.0.0.1:3001/health',
    reuseExistingServer: !process.env.CI,
  },
});
