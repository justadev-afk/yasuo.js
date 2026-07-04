import { describe, expect, test } from 'bun:test'
import type { CachedResult } from '../../src/core/cache/cache-store'
import { MemoryCache } from '../../src/core/cache/memory-cache'
import { EMPTY_RATE_LIMITS } from '../../src/core/rate-limit/rate-limit-headers'

function result(data: unknown): CachedResult {
  return {
    data,
    meta: { status: 200, rateLimits: EMPTY_RATE_LIMITS, url: 'https://example.test', headers: {} },
  }
}

/** A hand-cranked clock so TTL behaviour is deterministic. */
function fakeClock() {
  let now = 0
  const clock = () => now
  const advance = (ms: number): void => {
    now += ms
  }
  return { clock, advance }
}

describe('MemoryCache', () => {
  test('stores and retrieves a value within its TTL', () => {
    const { clock } = fakeClock()
    const cache = new MemoryCache({ clock })
    cache.set('a', result(1), 1000)
    expect(cache.get('a')?.data).toBe(1)
  })

  test('expires a value once the TTL elapses', () => {
    const time = fakeClock()
    const cache = new MemoryCache({ clock: time.clock })
    cache.set('a', result(1), 1000)
    time.advance(1000)
    expect(cache.get('a')).toBeUndefined()
  })

  test('does not store when the TTL is non-positive', () => {
    const cache = new MemoryCache()
    cache.set('a', result(1), 0)
    expect(cache.get('a')).toBeUndefined()
  })

  test('evicts the oldest entry past maxEntries', () => {
    const cache = new MemoryCache({ maxEntries: 2 })
    cache.set('a', result(1), 1000)
    cache.set('b', result(2), 1000)
    cache.set('c', result(3), 1000)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')?.data).toBe(2)
    expect(cache.get('c')?.data).toBe(3)
    expect(cache.size).toBe(2)
  })

  test('delete removes a single key; clear empties the store', () => {
    const cache = new MemoryCache()
    cache.set('a', result(1), 1000)
    cache.set('b', result(2), 1000)
    cache.delete('a')
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')?.data).toBe(2)
    cache.clear()
    expect(cache.size).toBe(0)
  })
})
