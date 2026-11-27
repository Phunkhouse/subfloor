import { expect, test } from '@playwright/test'

// The visual overview on the home page (and on GitHub Pages): each built component opens for real.
for (const id of ['modal', 'drawer', 'sheet']) {
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
