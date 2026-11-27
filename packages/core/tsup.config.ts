import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/ui.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
})
