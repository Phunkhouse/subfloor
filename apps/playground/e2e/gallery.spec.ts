import { expect, test } from '@playwright/test'

// The visual overview on the home page (and on GitHub Pages): each built component opens for real.
for (const id of ['modal', 'drawer', 'sheet', 'mobile-nav']) {
  test(`overview: "Try it" opens the ${id}`, async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(
      () => !!document.querySelector('dialog[data-state]'),
    )
    await page.locator(`#gallery-open-${id}`).click()
    const dialog = page.locator(`#gallery-${id}`)
    await expect(dialog).toHaveAttribute('data-state', 'open')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
}

test('overview: "Try it" opens the menu', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(
    () => !!document.querySelector('#gallery-menu[data-state]'),
  )
  await page.locator('#gallery-menu-trigger').click()
  const menu = page.locator('#gallery-menu')
  await expect(menu).toHaveAttribute('data-state', 'open')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})

test('overview: "Try it" shows a toast', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(
    () => !!document.querySelector('#gallery-menu[data-state]'),
  )
  await page.locator('#gallery-open-toast').click()
  await expect(page.locator('.sf-toast[data-state="open"]')).toBeVisible()
})
