import { expect, test, type Page } from '@playwright/test'

// Mobile nav requirements R-11 to R-15 in docs/SPEC.md. R-01 to R-09 for the same menu run in
// dialog.spec.ts, R-10 in no-js.spec.ts. A phone-sized window on every project, so the menu's
// `closeAt="(min-width: 768px)"` does not match at the start.
test.use({ viewport: { width: 390, height: 800 } })

const nav = '#site-nav'

async function load(page: Page, path = '/mobile-nav/') {
  await page.goto(path)
  await page.waitForFunction(() =>
    [...document.querySelectorAll('dialog[data-sf-dialog]')].every((d) =>
      d.hasAttribute('data-state'),
    ),
  )
}

/** Records every sf:open-change of the menu in `window.changes`. */
async function recordChanges(page: Page, selector = nav) {
  await page.locator(selector).evaluate((el) => {
    const w = window as unknown as { changes: string[] }
    w.changes = []
    el.addEventListener('sf:open-change', (event) => {
      const { open, reason } = (event as CustomEvent).detail
      w.changes.push(reason ? `${open} ${reason}` : String(open))
    })
  })
}

const changes = (page: Page) =>
  page.evaluate(() => (window as unknown as { changes: string[] }).changes)

async function openNav(page: Page, trigger = '#open-nav', selector = nav) {
  await page.locator(trigger).click()
  const dialog = page.locator(selector)
  await expect(dialog).toHaveAttribute('data-state', 'open')
  return dialog
}

test('R-11: a link to another page closes the menu and is followed', async ({
  page,
}) => {
  await load(page)
  const dialog = await openNav(page)
  await dialog.getByRole('link', { name: 'Modal' }).click()
  await expect(page).toHaveURL(/\/modal\/$/)
  await expect(page.locator('main h1')).toHaveText('Modal')
})

test('R-11: with a client-side router it closes with "navigate" and the new page starts at the top', async ({
  page,
}) => {
  await load(page)
  await page.locator('#react-open-nav').scrollIntoViewIfNeeded()
  const before = await page.evaluate(() => window.scrollY)
  expect(before).toBeGreaterThan(0)
  const dialog = await openNav(page, '#react-open-nav', '#react-nav')
  await dialog.getByRole('link', { name: 'Settings' }).click()
  await expect(dialog).toHaveAttribute('data-state', 'closed')
  await expect(page.locator('#react-nav-log')).toHaveText(
    'true, false navigate',
  )
  await expect(page.locator('#react-view')).toHaveText('settings')
  await expect(page).toHaveURL(/\?view=settings$/)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  // Focus goes back to the toggle, in the header of a page that stays (R-14).
  await expect(page.locator('#react-open-nav')).toBeFocused()
})

test('R-11: a link opened in a new tab leaves the menu open', async ({
  page,
}, info) => {
  test.skip(
    info.project.name.startsWith('mobile-'),
    'no modifier clicks on a phone',
  )
  await load(page)
  const dialog = await openNav(page)
  const link = dialog.getByRole('link', { name: 'Modal' })
  // Keep the test on this page: the browser would open a tab.
  await link.evaluate((el) =>
    el.addEventListener('click', (event) => event.preventDefault()),
  )
  await link.click({ modifiers: ['ControlOrMeta'] })
  await page.waitForTimeout(100)
  await expect(dialog).toHaveAttribute('data-state', 'open')
})

test('R-12: an in-page link closes the menu, then the page lands on the target and Tab starts there', async ({
  page,
}) => {
  await load(page)
  await page.evaluate(() => window.scrollTo(0, 120))
  await recordChanges(page)
  const dialog = await openNav(page)
  await dialog.getByRole('link', { name: 'The end of this page' }).click()
  await expect(dialog).toHaveAttribute('data-state', 'closed')
  await expect(page).toHaveURL(/#nav-target$/)
  await expect
    .poll(() =>
      page
        .locator('#nav-target')
        .evaluate((el) => Math.abs(Math.round(el.getBoundingClientRect().top))),
    )
    .toBe(0)
  expect(await changes(page)).toEqual(['true', 'false navigate'])
  await expect(page.locator('#open-nav')).not.toBeFocused()
  // WebKit's Tab skips buttons and links by default, so the first control is a field.
  await page.keyboard.press('Tab')
  await expect(page.locator('#after-target')).toBeFocused()
})

test('R-13: the menu closes when the window grows past closeAt, and focus goes back to the toggle', async ({
  page,
}) => {
  await load(page)
  await recordChanges(page)
  await openNav(page)
  await page.setViewportSize({ width: 1024, height: 800 })
  await expect(page.locator(nav)).toHaveAttribute('data-state', 'closed')
  expect(await changes(page)).toEqual(['true', 'false api'])
  await expect(page.locator('#open-nav')).toBeFocused()

  // Growing again while closed does nothing; shrinking does not open it.
  await page.setViewportSize({ width: 390, height: 800 })
  await page.setViewportSize({ width: 1024, height: 800 })
  await page.waitForTimeout(100)
  expect(await changes(page)).toEqual(['true', 'false api'])
})

test('R-14: the skip link cannot be reached while the menu is open, and works after', async ({
  page,
}) => {
  await load(page)
  const skip = page.locator('.skip-link')
  const dialog = await openNav(page)
  expect(
    await skip.evaluate((el) => {
      ;(el as HTMLElement).focus()
      return document.activeElement === el
    }),
  ).toBe(false)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Shift+Tab')
    await expect(skip).not.toBeFocused()
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveAttribute('data-state', 'closed')
  await expect(page.locator('#open-nav')).toBeFocused()

  await skip.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  await page.keyboard.press('Tab')
  expect(
    await page.evaluate(() =>
      document.getElementById('main')!.contains(document.activeElement),
    ),
  ).toBe(true)
})

test('R-15: Tab keeps a focused control clear of a fixed bottom bar', async ({
  page,
}, info) => {
  test.skip(
    info.project.name.includes('webkit'),
    'WebKit ignores scroll-padding when Tab scrolls a field into view (scrollIntoView honours it); known limitation in docs/SPEC.md',
  )
  await load(page)
  const field = page.locator('#r15-button')
  await page.locator('#r15-before').focus()
  // Put the next field behind the bar: on screen, so without scroll-padding nothing scrolls.
  await field.evaluate((el) => {
    const bar = document.querySelector('.fixed-bar')!.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    window.scrollBy(0, box.top - (bar.top + 8))
  })
  const covered = await field.evaluate((el) => {
    const box = el.getBoundingClientRect()
    return document.elementFromPoint(box.left + 4, box.top + 4) !== el
  })
  expect(covered, 'the field starts under the bar').toBe(true)

  await page.keyboard.press('Tab')
  await expect(field).toBeFocused()
  // WebKit scrolls a focused field into view a moment later.
  await expect
    .poll(() =>
      field.evaluate((el) => {
        const box = el.getBoundingClientRect()
        const bar = document
          .querySelector('.fixed-bar')!
          .getBoundingClientRect()
        return box.bottom <= bar.top + 1
      }),
    )
    .toBe(true)
  const hit = await field.evaluate((el) => {
    const box = el.getBoundingClientRect()
    return (
      document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      ) === el
    )
  })
  expect(hit).toBe(true)
})
