import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error: plain JavaScript CLI module without types
import { eject } from '../bin/eject.mjs'

const reactDir = join(import.meta.dirname, '../../react')
let cwd = ''

afterEach(async () => {
  if (cwd) await rm(cwd, { recursive: true, force: true })
})

describe('eject', () => {
  it('copies the dialog behaviour and CSS into src/subfloor/dialog by default', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'subfloor-eject-'))
    const written: string[] = await eject({ component: 'modal', cwd })
    expect(written.sort()).toEqual(
      [
        'src/subfloor/dialog/dialog.css',
        'src/subfloor/dialog/dialog.ts',
        'src/subfloor/dialog/opener.ts',
        'src/subfloor/dialog/scroll-lock.ts',
        'src/subfloor/dialog/transitions.ts',
      ].map((f) => join(...f.split('/'))),
    )
  })

  it("points the adapter's import of @subfloor/core at the copied behaviour", async () => {
    cwd = await mkdtemp(join(tmpdir(), 'subfloor-eject-'))
    await eject({
      component: 'drawer',
      adapter: 'react',
      out: 'ui',
      cwd,
      adapterDir: reactDir,
    })
    const copied = await readFile(
      join(cwd, 'ui', 'dialog', 'Dialog.tsx'),
      'utf8',
    )
    expect(copied).toContain("from './dialog'")
    expect(copied).not.toMatch(/from '@subfloor\/core'/)
  })

  it('copies the mobile nav with the dialog under it, each adapter file importing its own module', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'subfloor-eject-'))
    const written: string[] = await eject({
      component: 'mobile-nav',
      adapter: 'react',
      cwd,
      adapterDir: reactDir,
    })
    const dir = join(cwd, 'src', 'subfloor', 'mobile-nav')
    expect(written.map((f) => f.split(/[\\/]/).at(-1)).sort()).toEqual([
      'Dialog.tsx',
      'MobileNav.tsx',
      'dialog.css',
      'dialog.ts',
      'focus-clearance.ts',
      'mobile-nav.css',
      'mobile-nav.ts',
      'opener.ts',
      'page.css',
      'scroll-lock.ts',
      'transitions.ts',
    ])
    const nav = await readFile(join(dir, 'MobileNav.tsx'), 'utf8')
    expect(nav).toContain("from './mobile-nav'")
    const dialog = await readFile(join(dir, 'Dialog.tsx'), 'utf8')
    expect(dialog).toContain("from './dialog'")
    expect(nav + dialog).not.toMatch(/from '@subfloor\/core'/)
  })

  it('copies the menu with the popover under it, each adapter file importing its own module', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'subfloor-eject-'))
    await eject({
      component: 'menu',
      adapter: 'react',
      cwd,
      adapterDir: reactDir,
    })
    const dir = join(cwd, 'src', 'subfloor', 'menu')
    const menu = await readFile(join(dir, 'Menu.tsx'), 'utf8')
    expect(menu).toContain("from './menu'")
    const popover = await readFile(join(dir, 'Popover.tsx'), 'utf8')
    expect(popover).toContain("from './popover'")
    expect(menu + popover).not.toMatch(/from '@subfloor\/core'/)
  })

  it('refuses an unknown component or adapter', async () => {
    cwd = await mkdtemp(join(tmpdir(), 'subfloor-eject-'))
    await expect(eject({ component: 'carousel', cwd })).rejects.toThrow(
      /Unknown component/,
    )
    await expect(
      eject({ component: 'modal', adapter: 'vue', cwd }),
    ).rejects.toThrow(/Unknown adapter/)
  })
})
