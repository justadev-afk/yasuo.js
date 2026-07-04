/**
 * A minimal counting semaphore used to cap the number of in-flight requests.
 *
 * `permits` of `Infinity` makes {@link Semaphore.acquire} a no-op, so an
 * unbounded client pays no scheduling overhead.
 */
export class Semaphore {
  private available: number
  private readonly waiters: Array<() => void> = []

  constructor(permits: number) {
    this.available = permits
  }

  /** Acquire a permit, waiting if none are currently available. */
  async acquire(): Promise<void> {
    if (this.available === Number.POSITIVE_INFINITY) {
      return
    }
    if (this.available > 0) {
      this.available -= 1
      return
    }
    await new Promise<void>((resolve) => {
      this.waiters.push(resolve)
    })
  }

  /** Release a permit, waking the longest-waiting acquirer if any. */
  release(): void {
    if (this.available === Number.POSITIVE_INFINITY) {
      return
    }
    const next = this.waiters.shift()
    if (next) {
      next()
    } else {
      this.available += 1
    }
  }

  /** Run `fn` while holding a permit, releasing it even if `fn` throws. */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
}
