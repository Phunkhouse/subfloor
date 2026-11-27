import { expect, test, type Locator, type Page } from '@playwright/test'

// Requirements R-01 to R-09 in docs/SPEC.md, for every placement, both adapters and the mobile nav.

interface Case {
  name: string
  path: string
  trigger: string
  dialog: string
}

const cases: Case[] = [
  {
    name: 'Astro modal',
    path: '/modal/',
    trigger: '#open-modal',
    dialog: '#demo-modal',
  },
  {
    name: 'Astro drawer',
    path: '/drawer/',
    trigger: '#open-drawer-end',
    dialog: '#drawer-end',
  },
  {
    name: 'Astro sheet',
    path: '/drawer/',
    trigger: '#open-sheet',
    dialog: '#sheet',
  },
  {
    name: 'Astro mobile nav',
    path: '/mobile-nav/',
    trigger: '#open-nav',
    dialog: '#site-nav',
  },
  {
    name: 'React modal',
    path: '/react/',
    trigger: '#react-open-modal',
    dialog: 'dialog[aria-labelledby]:has(h2:text-is("React modal"))',
  },
]

const isMobile = (projectName: string) => projectName.startsWith('mobile-')

/** Loads the page with the script running, scrolled a little (the triggers stay in view). */
async function load(page: Page, path: string) {
  await page.goto(path)
  await page.waitForFunction(() =>
    [...document.querySelectorAll('dialog[data-sf-dialog]')].every((d) =>
      d.hasAttribute('data-state'),
    ),
  )
  await page.evaluate(() => window.scrollTo(0, 120))
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
}

async function open(page: Page, c: Case): Promise<Locator> {
  await page.locator(c.trigger).click()
  const dialog = page.locator(c.dialog)
  await expect(dialog).toHaveAttribute('data-state', 'open')
  await expect(dialog).toBeVisible()
  return dialog
}

async function expectClosed(dialog: Locator) {
  await expect(dialog).toHaveAttribute('data-state', 'closed')
  await expect(dialog).toBeHidden()
}

const top = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => el.getBoundingClientRect().top)

/** A point on the backdrop: away from the dialog's box. */
async function backdropPoint(
  dialog: Locator,
): Promise<{ x: number; y: number }> {
  const box = await dialog.boundingBox()
  if (!box) throw new Error('dialog has no box')
  const viewport = dialog.page().viewportSize()!
  if (box.y > 20) return { x: viewport.width / 2, y: 10 }
  if (box.x > 20) return { x: 10, y: viewport.height / 2 }
  return { x: viewport.width - 10, y: viewport.height / 2 }
}

for (const c of cases) {
  test.describe(c.name, () => {
    test.beforeEach(async ({ page }) => load(page, c.path))

    test('R-01: the page does not scroll behind it, and keeps its place after', async ({
      page,
    }, info) => {
      await page.locator(c.trigger).scrollIntoViewIfNeeded()
      const before = await page.evaluate(() => window.scrollY)
      expect(before).toBeGreaterThan(0)
      const filler = 'main > .filler > p:last-child'
      const dialog = await open(page, c)
      const fillerTop = await top(page, filler)

      // Script, wheel and (on a phone in Chromium) a real touch scroll gesture.
      await page.evaluate(() => window.scrollBy(0, 300))
      if (!isMobile(info.project.name)) {
        const point = await backdropPoint(dialog)
        await page.mouse.move(point.x, point.y)
        await page.mouse.wheel(0, 600)
      } else if (info.project.name === 'mobile-chromium') {
        const cdp = await page.context().newCDPSession(page)
        const point = await backdropPoint(dialog)
        await cdp.send('Input.synthesizeScrollGesture', {
          x: point.x,
          y: point.y,
          yDistance: -400,
          gestureSourceType: 'touch',
        })
      }
      await page.waitForTimeout(150)
      expect(await top(page, filler)).toBe(fillerTop)
      await expect(page.locator('html')).toHaveAttribute(
        'data-sf-scroll-lock',
        '',
      )

      await page.keyboard.press('Escape')
      await expectClosed(dialog)
      expect(await page.evaluate(() => window.scrollY)).toBe(before)
      await expect(page.locator('html')).not.toHaveAttribute(
        'data-sf-scroll-lock',
      )
    })

    test('R-02: the content does not move sideways when the scrollbar goes', async ({
      page,
    }, info) => {
      test.skip(isMobile(info.project.name), 'phones have overlay scrollbars')
      // macOS shows overlay scrollbars that take no space; a styled scrollbar takes space in both
      // engines, as it does on Windows and Linux.
      await page.addStyleTag({
        content:
          '::-webkit-scrollbar { width: 15px; } ::-webkit-scrollbar-thumb { background: #888; }',
      })
      const scrollbar = () =>
        page.evaluate(
          () => window.innerWidth - document.documentElement.clientWidth,
        )
      if (info.project.name === 'chromium') {
        await expect
          .poll(scrollbar, {
            message: 'a classic scrollbar, or the test proves nothing',
          })
          .toBeGreaterThan(0)
      } else {
        // WebKit on macOS keeps overlay scrollbars even when styled; Linux WebKit (CI) has classic ones.
        await page.waitForTimeout(100)
        test.skip(
          (await scrollbar()) === 0,
          'overlay scrollbars: nothing to measure here',
        )
      }

      const heading = page.locator('main h1')
      const before = await heading.evaluate((el) =>
        el.getBoundingClientRect().toJSON(),
      )
      await open(page, c)
      const during = await heading.evaluate((el) =>
        el.getBoundingClientRect().toJSON(),
      )
      expect(during.left).toBe(before.left)
      expect(during.width).toBe(before.width)
    })

    test('R-07: focus moves in, stays in, and goes back to the trigger', async ({
      page,
    }) => {
      const dialog = await open(page, c)
      // Native modal behaviour, kept on purpose: after the last control, Tab may pass through the
      // browser's own UI (the document loses focus) and comes back into the dialog. It never
      // reaches the page behind it.
      const inside = () =>
        dialog.evaluate(
          (el) => el.contains(document.activeElement) || !document.hasFocus(),
        )
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      ).toBe(true)
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab')
        expect(await inside(), `after Tab ${i + 1}`).toBe(true)
      }
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Shift+Tab')
        expect(await inside(), `after Shift+Tab ${i + 1}`).toBe(true)
      }
      await page.keyboard.press('Escape')
      await expectClosed(dialog)
      await expect(page.locator(c.trigger)).toBeFocused()
    })

    test('R-07: Tab comes back into the dialog after leaving the last control', async ({
      page,
    }) => {
      const dialog = await open(page, c)
      const seen = new Set<string>()
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab')
        seen.add(
          await dialog.evaluate((el) =>
            el.contains(document.activeElement)
              ? 'dialog'
              : document.hasFocus()
                ? 'page'
                : 'ui',
          ),
        )
      }
      expect(seen.has('dialog')).toBe(true)
      expect(seen.has('page')).toBe(false)
    })

    test('R-03: Escape, the close button and the backdrop close it; a drag out does not', async ({
      page,
    }, info) => {
      let dialog = await open(page, c)
      await page.keyboard.press('Escape')
      await expectClosed(dialog)

      dialog = await open(page, c)
      await dialog.locator('.sf-dialog__close').click()
      await expectClosed(dialog)

      dialog = await open(page, c)
      const point = await backdropPoint(dialog)
      await page.mouse.click(point.x, point.y)
      await expectClosed(dialog)

      if (!isMobile(info.project.name)) {
        dialog = await open(page, c)
        const title = await dialog.locator('.sf-dialog__title').boundingBox()
        await page.mouse.move(title!.x + 5, title!.y + 5)
        await page.mouse.down()
        await page.mouse.move(point.x, point.y, { steps: 5 })
        await page.mouse.up()
        await page.waitForTimeout(100)
        await expect(dialog).toHaveAttribute('data-state', 'open')
      }
    })

    test('R-08: the page behind it is inert', async ({ page }) => {
      await open(page, c)
      const result = await page.evaluate(() => {
        const button = document.getElementById('background-button')!
        button.focus()
        const box = button.getBoundingClientRect()
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        )
        return {
          focused: document.activeElement === button,
          hit: hit === button,
        }
      })
      expect(result).toEqual({ focused: false, hit: false })
    })
  })
}

test.describe('Behaviour details', () => {
  test('R-04: React calls onOpenChange once per user change, never for its own', async ({
    page,
  }) => {
    await load(page, '/react/')
    const log = page.locator('#react-log')
    const c = cases.find((x) => x.name === 'React modal')!
    let dialog = await open(page, c)
    await expect(log).toHaveText('none')
    await page.keyboard.press('Escape')
    await expectClosed(dialog)
    await expect(log).toHaveText('false escape')

    // It opens again after the browser closed it, and closing from state is not reported.
    dialog = await open(page, c)
    await page.locator('#react-close').click()
    await expectClosed(dialog)
    await expect(log).toHaveText('false escape')

    dialog = await open(page, c)
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await expectClosed(dialog)
    await expect(log).toHaveText('false escape, false button')
  })

  test('R-04: a React dialog opened by a commandfor button reports it', async ({
    page,
  }) => {
    await load(page, '/react/')
    await page.locator('#react-open-sheet').click()
    const sheet = page.locator('#react-sheet')
    await expect(sheet).toHaveAttribute('data-state', 'open')
    await page.keyboard.press('Escape')
    await expectClosed(sheet)
  })

  test('R-05: a long dialog scrolls inside, and its end does not scroll the page', async ({
    page,
  }, info) => {
    test.skip(isMobile(info.project.name), 'needs a mouse wheel')
    await load(page, '/modal/')
    const before = await top(page, 'main h1')
    const dialog = await open(page, {
      name: 'long',
      path: '/modal/',
      trigger: '#open-long-modal',
      dialog: '#long-modal',
    })
    const body = dialog.locator('.sf-dialog__body')
    const box = (await body.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, 5000)
    await expect
      .poll(() => body.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0)
    await page.mouse.wheel(0, 2000)
    await page.waitForTimeout(150)
    expect(await top(page, 'main h1')).toBe(before)
  })

  test('R-05: a sheet stays within its maximum height', async ({ page }) => {
    await load(page, '/drawer/')
    const dialog = await open(page, cases[2]!)
    const height = (await dialog.boundingBox())!.height
    const viewport = page.viewportSize()!.height
    expect(height).toBeLessThanOrEqual(Math.ceil(viewport * 0.9) + 1)
  })

  test('R-06: closing passes through data-state="closing" before leaving', async ({
    page,
  }) => {
    await load(page, '/modal/')
    const dialog = await open(page, cases[0]!)
    await dialog.evaluate((el) => {
      ;(window as unknown as { states: string[] }).states = []
      new MutationObserver(() =>
        (window as unknown as { states: string[] }).states.push(
          el.dataset.state ?? '',
        ),
      ).observe(el, { attributeFilter: ['data-state'] })
    })
    await page.keyboard.press('Escape')
    await expectClosed(dialog)
    expect(
      await page.evaluate(
        () => (window as unknown as { states: string[] }).states,
      ),
    ).toEqual(['closing', 'closed'])
  })

  test('R-06: under reduced motion it closes without waiting', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/modal/')
    const dialog = await open(page, cases[0]!)
    const duration = await dialog.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    )
    expect(duration.split(',').every((d) => parseFloat(d) === 0)).toBe(true)
    await page.keyboard.press('Escape')
    await expectClosed(dialog)
  })

  test('R-09: project CSS overrides the kit without !important', async ({
    page,
  }) => {
    await load(page, '/modal/')
    const dialog = await open(page, {
      name: 'custom',
      path: '/modal/',
      trigger: '#open-custom-modal',
      dialog: '#custom-modal',
    })
    const style = await dialog.evaluate((el) => {
      const s = getComputedStyle(el)
      return {
        width: el.getBoundingClientRect().width,
        radius: s.borderTopLeftRadius,
      }
    })
    expect(style.width).toBe(320)
    expect(style.radius).toBe('0px')
  })

  test('the form in the footer closes it and sets returnValue', async ({
    page,
  }) => {
    await load(page, '/modal/')
    const dialog = await open(page, cases[0]!)
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click()
    await expectClosed(dialog)
    expect(
      await dialog.evaluate((el) => (el as HTMLDialogElement).returnValue),
    ).toBe('delete')
  })
})
