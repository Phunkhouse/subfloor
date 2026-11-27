import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

// The docs site and the Playwright test target. Static output, no adapter. GitHub Pages serves it
// under a base path, set by the Pages workflow (SITE, BASE_PATH); locally and in tests it is `/`.
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH ?? '/',
  integrations: [react()],
})
