// Copies the CSS into dist/. `components.css` joins every component's CSS into one file; each
// component keeps its own source file under src/styles/ so `subfloor eject` can copy just one.
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const src = new URL('../src/styles/', import.meta.url)
const dist = new URL('../dist/', import.meta.url)
const components = ['dialog.css', 'mobile-nav.css']

await mkdir(dist, { recursive: true })
const read = (name) => readFile(new URL(name, src), 'utf8')
await writeFile(new URL('tokens.css', dist), await read('tokens.css'))
await writeFile(new URL('tailwind.css', dist), await read('tailwind.css'))
const parts = ['/* @subfloor/core components, all in @layer subfloor. */\n']
for (const name of components) parts.push(await read(name))
await writeFile(new URL('components.css', dist), parts.join('\n'))
