import { defineConfig } from 'tsup'

// The components use effects and refs, so the whole entry is a client module for the Next.js
// App Router. Server components can still render them; only the dialog's behaviour runs on the client.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  external: ['react', '@subfloor/core'],
  banner: { js: "'use client'" },
})
