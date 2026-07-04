/**
 * Resolve after `ms` milliseconds. A value of `0` or less resolves on the next
 * microtask without scheduling a timer.
 *
 * @param ms - Delay in milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
