import { describe, expect, mock, test } from 'bun:test'
import type { Logger } from '../../src/core/logger'
import { EMPTY_RATE_LIMITS } from '../../src/core/rate-limit/rate-limit-headers'
import { RateLimiter } from '../../src/core/rate-limit/rate-limiter'
import { RateLimitType } from '../../src/enums/rate-limit'

const APP = 'kr'
const METHOD = 'kr:summoner.byPuuid'

/** A spyable {@link Logger} whose calls can be asserted on. */
function spyLogger(): Logger {
  return { debug: mock(), info: mock(), warn: mock(), error: mock() }
}

describe('RateLimiter', () => {
  test('acquire is a no-op when disabled', async () => {
    const limiter = new RateLimiter({ enabled: false })
    // Would otherwise be throttled by the bootstrap window; disabled → instant.
    for (let i = 0; i < 100; i += 1) {
      await limiter.acquire(APP, METHOD)
    }
    expect(true).toBe(true)
  })

  test('permits a burst up to the bootstrap limit without waiting', async () => {
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 3, intervalSeconds: 60 }],
    })
    const start = Date.now()
    await limiter.acquire(APP, METHOD)
    await limiter.acquire(APP, METHOD)
    await limiter.acquire(APP, METHOD)
    expect(Date.now() - start).toBeLessThan(30)
  })

  test('throttles once the window is full, then releases it', async () => {
    // 2 requests per 50 ms window.
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 2, intervalSeconds: 0.05 }],
    })
    await limiter.acquire(APP, METHOD)
    await limiter.acquire(APP, METHOD)
    const start = Date.now()
    await limiter.acquire(APP, METHOD) // must wait for the window to slide
    const waited = Date.now() - start
    expect(waited).toBeGreaterThanOrEqual(35)
  })

  test('update learns tighter limits from response headers', async () => {
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 1000, intervalSeconds: 60 }],
    })
    await limiter.acquire(APP, METHOD)
    // Riot now advertises a full 1-per-50ms app window.
    limiter.update(APP, METHOD, {
      ...EMPTY_RATE_LIMITS,
      app: [{ limit: 1, intervalSeconds: 0.05, count: 1 }],
    })
    const start = Date.now()
    await limiter.acquire(APP, METHOD) // count already at the limit → wait
    expect(Date.now() - start).toBeGreaterThanOrEqual(30)
  })

  test('penalize parks the bucket for retry-after', async () => {
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 1000, intervalSeconds: 60 }],
    })
    limiter.penalize(APP, METHOD, {
      ...EMPTY_RATE_LIMITS,
      type: RateLimitType.APPLICATION,
      retryAfterSeconds: 0.05,
    })
    const start = Date.now()
    await limiter.acquire(APP, METHOD)
    expect(Date.now() - start).toBeGreaterThanOrEqual(30)
  })

  test('logs a WARN once when it self-throttles, naming the method + waited ms', async () => {
    const logger = spyLogger()
    // 2 requests per 50 ms window → the 3rd must wait for the window to slide.
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 2, intervalSeconds: 0.05 }],
      logger,
    })
    await limiter.acquire(APP, METHOD)
    await limiter.acquire(APP, METHOD)
    expect(logger.warn).not.toHaveBeenCalled() // no wait yet
    await limiter.acquire(APP, METHOD) // parked until the window releases

    const warn = logger.warn as ReturnType<typeof mock>
    expect(warn).toHaveBeenCalledTimes(1)
    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain(METHOD)
    expect(message).toMatch(/self-throttled for \d+ms/)
  })

  test('does not log when no wait is needed', async () => {
    const logger = spyLogger()
    const limiter = new RateLimiter({
      bootstrapAppWindows: [{ limit: 3, intervalSeconds: 60 }],
      logger,
    })
    await limiter.acquire(APP, METHOD)
    await limiter.acquire(APP, METHOD)
    expect(logger.warn).not.toHaveBeenCalled()
  })

  test('never logs when disabled (no proactive throttling)', async () => {
    const logger = spyLogger()
    const limiter = new RateLimiter({ enabled: false, logger })
    for (let i = 0; i < 50; i += 1) {
      await limiter.acquire(APP, METHOD)
    }
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
