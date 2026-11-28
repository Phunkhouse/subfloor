import { expect, test, type Page } from '@playwright/test'

// Decision 0006: in the Next.js App Router, a page imports only base.css and each @subfloor/react
// component brings its own styles; a page without components carries none of them.

/** Every CSS rule the page has loaded, as text. */
const loadedCss = (page: Page) =>
  page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules].map((rule) => rule.cssText)
        } catch {
          return []
        }
      })
      .join('\n'),
  )

test('the components are styled by their own CSS, with only base.css imported', async ({
  page,
}) => {
  await page.goto('/')
  // Tokens from base.css.
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sf-color-surface')
        .trim(),
    ),
  ).not.toBe('')

  await page.locator('#open-modal').click()
  const modal = page.locator('#modal')
  await expect(modal).toHaveAttribute('data-state', 'open')
  expect(
    await modal.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
  ).toBe('12px')
  await page.keyboard.press('Escape')
  await expect(modal).toHaveAttribute('data-state', 'closed')

  await page.locator('#menu-trigger').click()
  const menu = page.locator('#menu')
  await expect(menu).toHaveAttribute('data-state', 'open')
  expect(await menu.evaluate((el) => getComputedStyle(el).display)).toBe('flex')
  await page.keyboard.press('Escape')

  await page.locator('#show-toast').click()
  const toast = page.locator('.sf-toast[data-state="open"]')
  await expect(toast).toBeVisible()
  expect(await toast.evaluate((el) => getComputedStyle(el).position)).toBe(
    'fixed',
  )
})

test('a page without components carries none of their styles', async ({
  page,
}) => {
  await page.goto('/plain')
  const css = await loadedCss(page)
  expect(css).toContain('--sf-color-surface')
  expect(css).not.toContain('.sf-dialog')
  expect(css).not.toContain('.sf-toast')
  expect(css).not.toContain('.sf-menu')
})
