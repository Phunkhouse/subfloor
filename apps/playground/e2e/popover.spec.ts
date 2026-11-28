import { expect, test, type Locator, type Page } from '@playwright/test'

// Popover and Menu: requirements R-16 to R-20 in docs/SPEC.md (R-21 in no-js.spec.ts).

async function load(page: Page) {
  await page.goto('/popover/')
  // data-state appears once the core's script has picked the popovers up.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-sf-popover], [data-sf-menu]')].every(
      (el) => el.hasAttribute('data-state'),
    ),
  )
}

/** Records every sf:open-change of `selector` in `window.changes`. */
async function recordChanges(page: Page, selector: string) {
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

const box = async (locator: Locator) => {
  const b = await locator.boundingBox()
  if (!b) throw new Error('no box')
  return b
}

const focusedText = (page: Page) =>
  page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')

test('R-16: a popover inside a box that clips is shown whole', async ({
  page,
}) => {
  await load(page)
  const trigger = page.locator('#clipped-popover-trigger')
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  const panel = page.locator('#clipped-popover')
  await expect(panel).toHaveAttribute('data-state', 'open')
  const clip = await box(page.locator('#clip-box'))
  const b = await box(panel)
  // Larger than the box and reaching past it (below, or above where it flipped).
  expect(b.height).toBeGreaterThan(clip.height)
  expect(b.y < clip.y || b.y + b.height > clip.y + clip.height).toBe(true)
  const hit = await panel.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const at = document.elementFromPoint(r.left + r.width / 2, r.bottom - 8)
    return !!at && el.contains(at)
  })
  expect(hit).toBe(true)
})

test('R-17: it opens below its button, and above it near the bottom of the screen', async ({
  page,
}) => {
  await load(page)
  const trigger = page.locator('#actions-menu-trigger')
  const menu = page.locator('#actions-menu')
  await trigger.click()
  await expect(menu).toHaveAttribute('data-state', 'open')
  let t = await box(trigger)
  let m = await box(menu)
  expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 1)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()

  // Make the screen end just below the button: no room under it.
  t = await box(trigger)
  await page.setViewportSize({
    width: page.viewportSize()!.width,
    height: Math.ceil(t.y + t.height + 12),
  })
  await trigger.click()
  await expect(menu).toHaveAttribute('data-state', 'open')
  t = await box(trigger)
  m = await box(menu)
  expect(m.y + m.height).toBeLessThanOrEqual(t.y + 1)
})

for (const width of [390, 1024]) {
  test.describe(`${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('R-17: at the end edge it lines up with the end of its button instead of squeezing', async ({
      page,
    }) => {
      await load(page)
      const trigger = page.locator('#edge-popover-trigger')
      await trigger.scrollIntoViewIfNeeded()
      await trigger.click()
      const panel = page.locator('#edge-popover')
      await expect(panel).toHaveAttribute('data-state', 'open')
      const t = await box(trigger)
      const b = await box(panel)
      expect(b.x).toBeGreaterThanOrEqual(0)
      expect(Math.abs(b.x + b.width - (t.x + t.width))).toBeLessThan(1)
      // Its natural width: the text does not wrap to fit the room left of the edge.
      const lines = await panel
        .locator('.popover-note')
        .evaluate(
          (el) =>
            el.getClientRects().length === 1 &&
            el.getBoundingClientRect().height <
              2 * parseFloat(getComputedStyle(el).lineHeight || '20'),
        )
      expect(lines).toBe(true)
    })
  })
}

test.describe('short screen', () => {
  test.use({ viewport: { width: 1024, height: 320 } })

  test('R-17: too tall for either side, it stays on screen and scrolls inside', async ({
    page,
  }) => {
    await load(page)
    const trigger = page.locator('#actions-menu-trigger')
    // The button in the middle: less room above and below than the menu needs.
    await trigger.evaluate((el) => {
      const r = el.getBoundingClientRect()
      window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2)
    })
    await trigger.click()
    const menu = page.locator('#actions-menu')
    await expect(menu).toHaveAttribute('data-state', 'open')
    const m = await box(menu)
    expect(m.y).toBeGreaterThanOrEqual(0)
    expect(m.y + m.height).toBeLessThanOrEqual(320 + 1)
    // Beside the button, not over it: Firefox would otherwise keep it on screen by covering the
    // button (review of #14).
    const t = await box(trigger)
    const beside = m.y >= t.y + t.height - 1 || m.y + m.height <= t.y + 1
    expect(beside).toBe(true)
    expect(
      await menu.evaluate((el) => el.scrollHeight > el.clientHeight + 1),
    ).toBe(true)
  })
})

test('R-18: an outside press closes it and leaves focus where it was pressed', async ({
  page,
}) => {
  await load(page)
  await recordChanges(page, '#filter-popover')
  const trigger = page.locator('#filter-popover-trigger')
  await trigger.click()
  const panel = page.locator('#filter-popover')
  await expect(panel).toHaveAttribute('data-state', 'open')
  await page.locator('#background-button').click()
  await expect(panel).toBeHidden()
  await expect(trigger).not.toBeFocused()
  await expect.poll(() => changes(page)).toEqual(['true', 'false outside'])
})

test('R-18: Escape closes it and gives focus back to the button, also in Safari', async ({
  page,
}) => {
  await load(page)
  await recordChanges(page, '#filter-popover')
  const trigger = page.locator('#filter-popover-trigger')
  await trigger.click()
  const panel = page.locator('#filter-popover')
  await expect(panel).toHaveAttribute('data-state', 'open')
  await page.locator('#filter-search').click()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect.poll(() => changes(page)).toEqual(['true', 'false escape'])
})

test('R-18: pressing the button again closes it, without reopening', async ({
  page,
}) => {
  await load(page)
  await recordChanges(page, '#filter-popover')
  const trigger = page.locator('#filter-popover-trigger')
  await trigger.click()
  const panel = page.locator('#filter-popover')
  await expect(panel).toHaveAttribute('data-state', 'open')
  await trigger.click()
  await expect(panel).toBeHidden()
  await page.waitForTimeout(100)
  await expect.poll(() => changes(page)).toEqual(['true', 'false toggle'])
})

test('R-19: the menu keyboard: open on the first item, arrows, Home, End, letters, Escape', async ({
  page,
}) => {
  await load(page)
  const trigger = page.locator('#actions-menu-trigger')
  const menu = page.locator('#actions-menu')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('data-state', 'open')
  await expect.poll(() => focusedText(page)).toBe('Edit')
  await page.keyboard.press('ArrowDown')
  expect(await focusedText(page)).toBe('Duplicate')
  // Archive is disabled: skipped.
  await page.keyboard.press('ArrowDown')
  expect(await focusedText(page)).toBe('Open the Modal page')
  await page.keyboard.press('ArrowDown')
  expect(await focusedText(page)).toBe('Delete')
  await page.keyboard.press('ArrowDown')
  expect(await focusedText(page)).toBe('Edit')
  await page.keyboard.press('ArrowUp')
  expect(await focusedText(page)).toBe('Delete')
  await page.keyboard.press('Home')
  expect(await focusedText(page)).toBe('Edit')
  await page.keyboard.press('End')
  expect(await focusedText(page)).toBe('Delete')
  await page.keyboard.press('Home')
  await page.keyboard.press('d')
  expect(await focusedText(page)).toBe('Duplicate')
  await page.keyboard.press('d')
  expect(await focusedText(page)).toBe('Delete')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  await page.keyboard.press('ArrowUp')
  await expect(menu).toHaveAttribute('data-state', 'open')
  await expect.poll(() => focusedText(page)).toBe('Delete')
})

test('R-19: choosing an item closes the menu, reports it and gives focus back to the button', async ({
  page,
}) => {
  await load(page)
  await recordChanges(page, '#actions-menu')
  const trigger = page.locator('#actions-menu-trigger')
  const menu = page.locator('#actions-menu')
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await expect.poll(() => focusedText(page)).toBe('Edit')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
  await expect(page.locator('#menu-log')).toHaveText('duplicate')
  await expect(trigger).toBeFocused()

  // A disabled item cannot be chosen, by click either.
  await trigger.click()
  await expect(menu).toHaveAttribute('data-state', 'open')
  // force: Playwright waits for an aria-disabled item to become enabled.
  await menu.getByRole('menuitem', { name: 'Archive' }).click({ force: true })
  await expect(menu).toHaveAttribute('data-state', 'open')
  await expect(page.locator('#menu-log')).toHaveText('duplicate')
  await menu.getByRole('menuitem', { name: 'Delete' }).click()
  await expect(menu).toBeHidden()
  await expect(page.locator('#menu-log')).toHaveText('duplicate, delete')
  await expect
    .poll(() => changes(page))
    .toEqual(['true', 'false select', 'true', 'false select'])
})

test('R-19: Tab closes the menu and moves on', async ({ page }) => {
  await load(page)
  await recordChanges(page, '#actions-menu')
  const trigger = page.locator('#actions-menu-trigger')
  const menu = page.locator('#actions-menu')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => focusedText(page)).toBe('Edit')
  await page.keyboard.press('Tab')
  await expect(menu).toBeHidden()
  const inMenu = await menu.evaluate((el) =>
    el.contains(document.activeElement),
  )
  expect(inMenu).toBe(false)
  await expect(trigger).not.toBeFocused()
  await expect.poll(() => changes(page)).toEqual(['true', 'false tab'])
})

test('R-18: a mouse click on the button closes an open menu, without reopening it', async ({
  page,
}) => {
  // With focus on an item, Chromium and Firefox focus the button on mousedown: the move of focus
  // to the menu's own button must not close it as "tab" before the click toggles (review of #13).
  await load(page)
  await recordChanges(page, '#actions-menu')
  const trigger = page.locator('#actions-menu-trigger')
  const menu = page.locator('#actions-menu')
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await expect.poll(() => focusedText(page)).toBe('Edit')
  await trigger.click()
  await expect(menu).toBeHidden()
  await page.waitForTimeout(100)
  await expect.poll(() => changes(page)).toEqual(['true', 'false toggle'])
})

test('R-19: a link item navigates', async ({ page }) => {
  await load(page)
  await page.locator('#actions-menu-trigger').click()
  const menu = page.locator('#actions-menu')
  await expect(menu).toHaveAttribute('data-state', 'open')
  await menu.getByRole('menuitem', { name: 'Open the Modal page' }).click()
  await expect(page).toHaveURL(/\/modal\/$/)
})

test('R-20: aria-expanded follows the panel, and data-state passes through closing', async ({
  page,
}) => {
  await load(page)
  const trigger = page.locator('#filter-popover-trigger')
  const panel = page.locator('#filter-popover')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await panel.evaluate((el) => {
    const w = window as unknown as { states: string[] }
    w.states = []
    new MutationObserver(() => w.states.push(el.dataset.state ?? '')).observe(
      el,
      { attributeFilter: ['data-state'] },
    )
  })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toHaveAttribute('data-state', 'closed')
  expect(
    await page.evaluate(
      () => (window as unknown as { states: string[] }).states,
    ),
  ).toEqual(['open', 'closing', 'closed'])
})

test('R-20: the state, aria-expanded and the event change at the moment it closes', async ({
  page,
}) => {
  // The browser's toggle event is queued and can come late; until it did, the core still said
  // open, and a quick ↑ after Escape focused an item of the hidden menu (SUB-15).
  await load(page)
  await page.locator('#actions-menu-trigger').click()
  const menu = page.locator('#actions-menu')
  await expect(menu).toHaveAttribute('data-state', 'open')
  const right = await menu.evaluate((el) => {
    const trigger = document.getElementById('actions-menu-trigger')!
    const seen: string[] = []
    el.addEventListener('sf:open-change', (e) =>
      seen.push(String((e as CustomEvent).detail.open)),
    )
    ;(el as HTMLElement).hidePopover()
    // Same task, before any queued event could run.
    return {
      state: el.dataset.state,
      expanded: trigger.getAttribute('aria-expanded'),
      seen,
    }
  })
  expect(right).toEqual({
    state: 'closing',
    expanded: 'false',
    seen: ['false'],
  })
})

test('R-20: under reduced motion there is no transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await load(page)
  await page.locator('#filter-popover-trigger').click()
  const duration = await page
    .locator('#filter-popover')
    .evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(duration.split(',').every((d) => parseFloat(d) === 0)).toBe(true)
})

test('R-20: React reports each user change once, and menu choices', async ({
  page,
}) => {
  await load(page)
  const trigger = page.locator('#react-popover-trigger')
  await trigger.click()
  await expect(page.locator('#react-popover')).toHaveAttribute(
    'data-state',
    'open',
  )
  await page.keyboard.press('Escape')
  await expect(page.locator('#react-popover-log')).toHaveText(
    'true, false escape',
  )

  const menuTrigger = page.locator('#react-menu-trigger')
  const menu = page.locator('#react-menu')
  await menuTrigger.click()
  // Open (and done moving) before clicking items, as in the other tests.
  await expect(menu).toHaveAttribute('data-state', 'open')
  await menu.getByRole('menuitem', { name: 'Locked' }).click({ force: true })
  await expect(menu).toHaveAttribute('data-state', 'open')
  await menu.getByRole('menuitem', { name: 'Move', exact: true }).click()
  await expect(menu).toBeHidden()
  await expect(page.locator('#react-menu-log')).toHaveText('Move')
})
