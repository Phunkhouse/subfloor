// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isScrollLocked, lockScroll } from '../src/scroll-lock'

const html = document.documentElement
const body = document.body

function setScrollbar(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: 1000,
    configurable: true,
  })
  Object.defineProperty(html, 'clientWidth', {
    value: 1000 - width,
    configurable: true,
  })
}

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Object.defineProperty(window, 'scrollY', { value: 320, configurable: true })
  Object.defineProperty(window, 'scrollX', { value: 0, configurable: true })
  setScrollbar(15)
})
afterEach(() => {
  body.removeAttribute('style')
  html.removeAttribute('style')
})

describe('lockScroll', () => {
  it('pins the body at the current offset and restores it on release', () => {
    const release = lockScroll()
    expect(body.style.position).toBe('fixed')
    expect(body.style.top).toBe('-320px')
    expect(html.dataset.sfScrollLock).toBe('')
    expect(isScrollLocked()).toBe(true)
    release()
    expect(body.style.position).toBe('')
    expect(body.style.top).toBe('')
    expect(html.dataset.sfScrollLock).toBeUndefined()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 320)
    expect(isScrollLocked()).toBe(false)
  })

  it('keeps the scrollbar track only when the page had a classic scrollbar (R-02)', () => {
    let release = lockScroll()
    expect(html.style.overflowY).toBe('scroll')
    release()
    expect(html.style.overflowY).toBe('')

    setScrollbar(0)
    release = lockScroll()
    expect(html.style.overflowY).toBe('')
    release()
  })

  it('restores at once even when the page scrolls smoothly, then gives the page its setting back', () => {
    html.style.scrollBehavior = 'smooth'
    let during = ''
    window.scrollTo = vi.fn(() => {
      during = html.style.scrollBehavior
    }) as unknown as typeof window.scrollTo
    lockScroll()()
    expect(during).toBe('auto')
    expect(html.style.scrollBehavior).toBe('smooth')
  })

  it('gives back inline styles the page had on the body', () => {
    body.style.position = 'relative'
    lockScroll()()
    expect(body.style.position).toBe('relative')
  })

  it('releases only when the last of nested locks goes, and ignores a second release', () => {
    const first = lockScroll()
    const second = lockScroll()
    first()
    first()
    expect(body.style.position).toBe('fixed')
    second()
    expect(body.style.position).toBe('')
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
  })
})
