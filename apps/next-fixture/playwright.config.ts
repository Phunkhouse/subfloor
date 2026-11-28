import { defineConfig, devices } from '@playwright/test'

// One browser is enough: this checks what Next.js bundles, not browser behaviour (the playground
// covers that on five projects).
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4323' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:4323',
    reuseExistingServer: !process.env.CI,
  },
})
