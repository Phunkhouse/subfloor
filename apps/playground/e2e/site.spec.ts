import { expect, test } from '@playwright/test'

// The playground's own header (SUB-8): the inline links on wider screens, the kit's mobile nav on
// phones, closed by its closeAt when the window grows.
const menu = '#site-menu'

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('the header has a Menu button, and the menu lists the pages with the current one marked', async ({
    page,
  }) => {
    await page.goto('/modal/')
    // data-state appears once the core's script has picked the menu up.
    await page.waitForFunction(
      () => !!document.querySelector('#site-menu[data-state]'),
    )
    await expect(page.locator('.site-links')).toBeHidden()
    await page.getByRole('button', { name: 'Menu' }).click()
    const dialog = page.locator(menu)
    await expect(dialog).toHaveAttribute('data-state', 'open')
    await expect(
      dialog.getByRole('link', { name: 'Modal', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await dialog.getByRole('link', { name: 'Drawer and Sheet' }).click()
    await expect(page).toHaveURL(/\/drawer\/$/)
    await expect(page.locator('main h1')).toHaveText('Drawer and Sheet')
  })

  test('growing the window past 768px closes the menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(
      () => !!document.querySelector('#site-menu[data-state]'),
    )
    await page.getByRole('button', { name: 'Menu' }).click()
    const dialog = page.locator(menu)
    await expect(dialog).toHaveAttribute('data-state', 'open')
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(dialog).toHaveAttribute('data-state', 'closed')
    await expect(page.locator('.site-links')).toBeVisible()
  })
})

test.describe('wide screen', () => {
  test.use({ viewport: { width: 1024, height: 800 } })

  test('the header shows the links inline and no Menu button', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('.site-links')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden()
  })
})

test.describe('phone width without JavaScript', () => {
  test.use({ viewport: { width: 390, height: 800 }, javaScriptEnabled: false })

  test('the inline links show instead of the Menu button', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.site-links')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden()
  })
})
