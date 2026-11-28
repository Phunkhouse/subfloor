import { expect, test, type Page } from '@playwright/test'

// Toast: requirements R-22 to R-27 in docs/SPEC.md.

const toast = (page: Page) => page.locator('.sf-toast[data-state="open"]')

async function load(page: Page, path = '/toast/') {
  await page.goto(path)
  // The demo's script is loaded once the modal has its behaviour.
  await page.waitForFunction(
    () => !!document.querySelector('#toast-modal[data-state]'),
  )
}

test('R-22: it shows above a fixed bottom bar and the page, at the bottom centre', async ({
  page,
}) => {
  await load(page)
  await page.locator('#toast-done').click()
  const t = toast(page)
  await expect(t).toBeVisible()
  const r = await t.evaluate((el) => {
    const b = el.getBoundingClientRect()
    const bar = document.querySelector('.fixed-bar')!.getBoundingClientRect()
    const hit = document.elementFromPoint(b.left + 8, b.top + b.height / 2)
    return {
      aboveBar: b.bottom <= bar.top + 1,
      onTop: !!hit && el.contains(hit),
      // Against the page width without a classic scrollbar (Chromium on Linux shows one).
      centred:
        Math.abs(
          b.left + b.width / 2 - document.documentElement.clientWidth / 2,
        ) < 2,
      topLayer: el.matches(':popover-open'),
    }
  })
  expect(r).toEqual({
    aboveBar: true,
    onTop: true,
    centred: true,
    topLayer: true,
  })
})

test('R-23: inside an open modal its action can be pressed, and it moves back when the modal closes', async ({
  page,
}) => {
  await load(page)
  await page.locator('#open-toast-modal').click()
  const modal = page.locator('#toast-modal')
  await expect(modal).toHaveAttribute('data-state', 'open')
  await page.locator('#toast-in-modal').click()
  const t = toast(page)
  await expect(t).toBeVisible()
  expect(await t.evaluate((el) => el.parentElement?.id)).toBe('toast-modal')
  await t.locator('.sf-toast__action').click()
  await expect(page.locator('#undo-log')).toHaveText('1')

  // Focus may be on the action now (Escape would close the toast, R-26): close the modal itself.
  await modal.locator('.sf-dialog__close').click()
  await expect(modal).toHaveAttribute('data-state', 'closed')
  await expect(t).toBeVisible()
  expect(await t.evaluate((el) => el.parentElement === document.body)).toBe(
    true,
  )
})

test('R-23: a toast already shown moves into a modal that opens after it', async ({
  page,
}) => {
  await load(page)
  await page.locator('#toast-undo').click()
  const t = toast(page)
  await expect(t).toBeVisible()
  await page.locator('#open-toast-modal').click()
  await expect(page.locator('#toast-modal')).toHaveAttribute(
    'data-state',
    'open',
  )
  await expect
    .poll(() => t.evaluate((el) => el.parentElement?.id))
    .toBe('toast-modal')
  await t.locator('.sf-toast__action').click()
  await expect(page.locator('#undo-log')).toHaveText('1')
})

test('R-24: announced with the right role, the words just after, and focus never moved', async ({
  page,
}) => {
  await load(page)
  const button = page.locator('#toast-done')
  await button.focus()
  const early = await page.evaluate(() => {
    document.getElementById('toast-done')!.click()
    const el = document.querySelector<HTMLElement>('.sf-toast')!
    return {
      role: el.getAttribute('role'),
      hidden: el.querySelector<HTMLElement>('.sf-toast__message')!.hidden,
    }
  })
  expect(early).toEqual({ role: 'status', hidden: true })
  await expect(toast(page).locator('.sf-toast__message')).toBeVisible()
  await expect(button).toBeFocused()

  await page.locator('#toast-problem').click()
  await expect(toast(page)).toHaveAttribute('role', 'alert')
})

test('R-25: it closes after its time, but not while hovered', async ({
  page,
}) => {
  await load(page)
  await page.locator('#toast-short').click()
  const t = toast(page)
  await expect(t).toBeVisible()
  await t.hover()
  await page.waitForTimeout(2600)
  await expect(t).toBeVisible()
  await page.mouse.move(5, 5)
  await expect(page.locator('#toast-log')).toHaveText('timeout', {
    timeout: 3000,
  })
  await expect(page.locator('.sf-toast')).toHaveCount(0)
})

test('R-25: a problem stays until closed', async ({ page }) => {
  await load(page)
  await page.locator('#toast-problem').click()
  const t = toast(page)
  await expect(t).toBeVisible()
  await page.waitForTimeout(7000)
  await expect(t).toBeVisible()
  await t.locator('.sf-toast__close').click()
  await expect(page.locator('#toast-log')).toHaveText('button')
})

test('R-26: Escape in the toast closes it, not the modal around it, and focus goes back', async ({
  page,
}) => {
  await load(page)
  await page.locator('#open-toast-modal').click()
  const modal = page.locator('#toast-modal')
  await expect(modal).toHaveAttribute('data-state', 'open')
  const opener = page.locator('#toast-in-modal')
  await opener.click()
  const t = toast(page)
  await expect(t).toBeVisible()
  await opener.focus()
  await t.locator('.sf-toast__action').focus()
  await page.keyboard.press('Escape')
  await expect(page.locator('#toast-log')).toHaveText('escape')
  await expect(modal).toHaveAttribute('data-state', 'open')
  await expect(opener).toBeFocused()
})

test('R-27: a new toast replaces the current one', async ({ page }) => {
  await load(page)
  await page.locator('#toast-done').click()
  await expect(toast(page)).toHaveText(/Changes saved/)
  await page.locator('#toast-info').click()
  await expect(toast(page)).toHaveCount(1)
  await expect(toast(page)).toHaveText(/Already being collected/)
  await expect(page.locator('#toast-log')).toHaveText('replaced')
})

test('R-27: under reduced motion there is no transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await load(page)
  await page.locator('#toast-done').click()
  const duration = await toast(page).evaluate(
    (el) => getComputedStyle(el).transitionDuration,
  )
  expect(duration.split(',').every((d) => parseFloat(d) === 0)).toBe(true)
})

test('a server-rendered toast is shown with its behaviour', async ({
  page,
}) => {
  await page.goto('/toast/sent/')
  const t = page.locator('#sent-toast')
  await expect(t).toHaveAttribute('data-state', 'open')
  expect(await t.evaluate((el) => el.matches(':popover-open'))).toBe(true)
  await expect(t.locator('.sf-toast__close')).toBeVisible()
  await t.locator('.sf-toast__close').click()
  await expect(page.locator('.sf-toast')).toHaveCount(0)
})

test('React: onClose reports the user and the timeout, not its own unmount', async ({
  page,
}) => {
  await load(page)
  await page.locator('#react-toast').click()
  await expect(toast(page)).toHaveText(/Saved from React/)
  // A new key replaces it from React: no onClose for the old one.
  await page.locator('#react-toast-again').click()
  await expect(toast(page)).toHaveText(/Saved again/)
  await expect(toast(page)).toHaveCount(1)
  await toast(page).locator('.sf-toast__close').click()
  await expect(page.locator('#react-toast-log')).toHaveText('button')
  await page.locator('#react-toast').click()
  await expect(page.locator('#react-toast-log')).toHaveText('button, timeout', {
    timeout: 4000,
  })
})
