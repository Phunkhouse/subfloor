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
        'src/subfloor/dialog/scroll-lock.ts',
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
