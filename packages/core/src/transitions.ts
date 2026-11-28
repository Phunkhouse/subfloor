/**
 * Waits for the transitions and animations an element is running, for a closing state that must
 * finish before the element leaves the page (R-06, R-20).
 *
 * The animations finish only as frames are drawn. A page that draws none (headless WebKit on Linux
 * under load, a background tab) would wait for ever, and the overlay would stay `closing` on the
 * page (SUB-16). So a timer ends the wait at the animations' own computed end time, plus a margin:
 * where frames come, the animations finish first and the timer changes nothing.
 */

/** Extra time after the computed end before the timer gives up waiting (ms). */
const MARGIN = 50

export function transitionsDone(element: HTMLElement): Promise<void> {
  // Reading a style applies the new state, so its transitions exist when asked for.
  void getComputedStyle(element).opacity
  const running = (element.getAnimations?.() ?? []).filter(
    (animation) => animation.effect?.getTiming().iterations !== Infinity,
  )
  if (running.length === 0) return Promise.resolve()
  const end = Math.max(
    ...running.map((animation) => {
      const endTime = animation.effect?.getComputedTiming().endTime
      return typeof endTime === 'number' && Number.isFinite(endTime)
        ? endTime
        : 0
    }),
  )
  const finished = Promise.allSettled(
    running.map((animation) => animation.finished),
  ).then(() => undefined)
  const timer = new Promise<void>((resolve) =>
    setTimeout(resolve, end + MARGIN),
  )
  return Promise.race([finished, timer])
}
