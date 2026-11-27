#!/usr/bin/env node
// Usage: subfloor eject <component> [--adapter react|astro] [--out <dir>]
import { parseArgs } from 'node:util'
import { eject } from './eject.mjs'

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { adapter: { type: 'string' }, out: { type: 'string' } },
})
const [command, component] = positionals

if (command !== 'eject' || !component) {
  console.error(
    'Usage: subfloor eject <component> [--adapter react|astro] [--out <dir>]',
  )
  process.exit(1)
}

try {
  const written = await eject({
    component,
    adapter: values.adapter,
    out: values.out,
  })
  console.log(
    `Copied ${written.length} files:\n${written.map((f) => `  ${f}`).join('\n')}`,
  )
  console.log(
    'The copy no longer gets Subfloor fixes. Keep importing @subfloor/core/tokens.css for the tokens.',
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
