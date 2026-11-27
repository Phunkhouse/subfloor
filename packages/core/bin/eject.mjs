// `subfloor eject`: copies one component's source into a project, for the rare case where it must
// diverge from the kit. The copy no longer gets fixes from Subfloor, so prefer tokens, data
// attributes and `@layer subfloor` overrides first.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const coreDir = join(dirname(fileURLToPath(import.meta.url)), '..')

/** What each component consists of, per package. Modal, Drawer and Sheet are one dialog. */
export const COMPONENTS = {
  dialog: {
    core: ['src/dialog.ts', 'src/scroll-lock.ts', 'src/styles/dialog.css'],
    react: ['src/Dialog.tsx'],
    astro: ['src/Dialog.astro', 'src/Modal.astro', 'src/Drawer.astro'],
  },
}
const ALIASES = { modal: 'dialog', drawer: 'dialog', sheet: 'dialog' }
export const ADAPTERS = ['react', 'astro']

/**
 * Copies the files and points the adapter's import of `@subfloor/core` at the copied behaviour.
 * Returns the written paths. `adapterDir` overrides where the adapter package is found.
 */
export async function eject({
  component,
  adapter,
  out,
  cwd = process.cwd(),
  adapterDir,
}) {
  const name = ALIASES[component] ?? component
  const parts = COMPONENTS[name]
  if (!parts)
    throw new Error(
      `Unknown component "${component}". Known: ${knownNames().join(', ')}`,
    )
  if (adapter && !ADAPTERS.includes(adapter)) {
    throw new Error(
      `Unknown adapter "${adapter}". Known: ${ADAPTERS.join(', ')}`,
    )
  }
  const target = join(cwd, out ?? join('src', 'subfloor'), name)
  await mkdir(target, { recursive: true })

  const sources = parts.core.map((file) => ({
    from: join(coreDir, file),
    file,
  }))
  if (adapter) {
    const dir =
      adapterDir ??
      dirname(
        createRequire(join(cwd, 'package.json')).resolve(
          `@subfloor/${adapter}/package.json`,
        ),
      )
    sources.push(
      ...parts[adapter].map((file) => ({ from: join(dir, file), file })),
    )
  }

  const written = []
  for (const { from, file } of sources) {
    let text = await readFile(from, 'utf8')
    text = text.replaceAll(/from '@subfloor\/core'/g, "from './dialog'")
    const to = join(target, file.split('/').at(-1))
    await writeFile(to, text)
    written.push(relative(cwd, to))
  }
  return written
}

function knownNames() {
  return [...Object.keys(COMPONENTS), ...Object.keys(ALIASES)]
}
