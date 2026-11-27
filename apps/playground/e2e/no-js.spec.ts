import { expect, test, type Page } from '@playwright/test'

// R-10: with JavaScript off, the same markup works as far as the platform allows. Opening needs
// Invoker Commands; the backdrop needs `closedby`. Each is checked in the browser under test and
// the test is skipped, with the reason, where the platform has no support.

test.use({ javaScriptEnabled: false })

const support = (page: Page) =>
  page.evaluate(() => ({
    invokers: 'command' in HTMLButtonElement.prototype,
    closedby: 'closedBy' in HTMLDialogElement.prototype,
  }))

const placements = [
  {
    name: 'modal',
    path: '/modal/',
    trigger: '#open-modal',
    dialog: '#demo-modal',
  },
  {
    name: 'drawer',
    path: '/drawer/',
    trigger: '#open-drawer-end',
    dialog: '#drawer-end',
  },
  { name: 'sheet', path: '/drawer/', trigger: '#open-sheet', dialog: '#sheet' },
  {
    name: 'mobile nav',
    path: '/mobile-nav/',
    trigger: '#open-nav',
    dialog: '#site-nav',
  },
]

for (const c of placements) {
  test(`${c.name}: hidden until opened, then placed and styled like with the script`, async ({
    page,
  }) => {
    await page.goto(c.path)
    const dialog = page.locator(c.dialog)
    await expect(dialog).toBeHidden()
    test.skip(
      !(await support(page)).invokers,
      'no Invoker Commands in this browser',
    )

    await page.locator(c.trigger).click()
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate((el) => el.matches(':modal'))).toBe(true)
    // Measure where it ends up, after the opening transition.
    await dialog.evaluate((el) =>
      Promise.allSettled(
        el.getAnimations().map((animation) => animation.finished),
      ),
    )

    const box = (await dialog.boundingBox())!
    const viewport = page.viewportSize()!
    if (c.name === 'modal') {
      expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(
        10,
      )
    } else if (c.name === 'drawer' || c.name === 'mobile nav') {
      expect(Math.round(box.x + box.width)).toBeGreaterThanOrEqual(
        viewport.width - 20,
      )
      expect(Math.round(box.height)).toBe(viewport.height)
    } else {
      expect(Math.round(box.y + box.height)).toBe(viewport.height)
    }
    const backdrop = await dialog.evaluate(
      (el) => getComputedStyle(el, '::backdrop').backgroundColor,
    )
    expect(backdrop).not.toBe('rgba(0, 0, 0, 0)')
    // CSS alone stops the page scrolling (iOS touch scrolling aside, see docs/SPEC.md R-10).
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).overflowY,
      ),
    ).toBe('hidden')
  })
}

test('modal: Escape and the close button close it', async ({ page }, info) => {
  await page.goto('/modal/')
  test.skip(
    !(await support(page)).invokers,
    'no Invoker Commands in this browser',
  )
  const dialog = page.locator('#demo-modal')
  await page.locator('#open-modal').click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.locator('#open-modal').click()
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
  // WebKit does not focus a clicked button, so without the script it has nothing to return to
  // (docs/SPEC.md R-10). With the script it does (R-07).
  if (!info.project.name.includes('webkit'))
    await expect(page.locator('#open-modal')).toBeFocused()
})

test('modal: the backdrop closes it where closedby is supported', async ({
  page,
}) => {
  await page.goto('/modal/')
  const { invokers, closedby } = await support(page)
  test.skip(
    !invokers || !closedby,
    'no Invoker Commands or closedby in this browser',
  )
  const dialog = page.locator('#demo-modal')
  await page.locator('#open-modal').click()
  await expect(dialog).toBeVisible()
  await page.mouse.click(10, 10)
  await expect(dialog).toBeHidden()
})
