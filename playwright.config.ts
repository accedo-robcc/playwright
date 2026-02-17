import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/generated',
  use: {
    baseURL: undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  retries: 1,
  reporter: [['html', { open: 'never' }]],
});
