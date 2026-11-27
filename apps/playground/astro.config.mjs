import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

// The docs site and the Playwright test target. Static output, no adapter.
export default defineConfig({
  integrations: [react()],
})
