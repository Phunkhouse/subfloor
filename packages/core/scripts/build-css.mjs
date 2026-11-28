// Builds the CSS in dist/ (decision 0006):
//
// - `base.css`: the tokens and the page-level rules; a project imports it once.
// - `styles/<component>.css`: one per component; the React and Astro components import their own,
//   so a page gets only the styles of the components it uses.
// - `components.css`: the page-level rules and every component, for plain-script use or one file.
// - `tokens.css`, `tailwind.css`: as before.
//
// Each component keeps its own source file under src/styles/ (also for `subfloor eject`).
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const src = new URL('../src/styles/', import.meta.url)
const dist = new URL('../dist/', import.meta.url)
export const components = [
  'dialog.css',
  'mobile-nav.css',
  'popover.css',
  'menu.css',
  'toast.css',
]

await mkdir(new URL('styles/', dist), { recursive: true })
const read = (name) => readFile(new URL(name, src), 'utf8')
const tokens = await read('tokens.css')
const page = await read('page.css')

await writeFile(new URL('tokens.css', dist), tokens)
await writeFile(new URL('tailwind.css', dist), await read('tailwind.css'))
await writeFile(
  new URL('base.css', dist),
  [
    '/* @subfloor/core base: tokens and page-level rules. */\n',
    tokens,
    page,
  ].join('\n'),
)
const parts = [
  '/* @subfloor/core components, all in @layer subfloor. */\n',
  page,
]
for (const name of components) {
  const css = await read(name)
  parts.push(css)
  await writeFile(new URL(`styles/${name}`, dist), css)
}
await writeFile(new URL('components.css', dist), parts.join('\n'))
