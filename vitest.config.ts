import { defineConfig } from 'vitest/config'

// Unit tests only where there is real logic (scroll lock, eject). Browser behaviour is proven by
// Playwright against the playground (apps/playground/e2e).
export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts'],
  },
})
