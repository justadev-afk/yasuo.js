import { describe, expect, test } from 'bun:test'
import type { CacheStore } from '../../src/core/cache'
import { coerceCacheStore } from '../../src/core/cache/coerce-store'
import { KVCache } from '../../src/core/cache/kv-cache'
import { RedisCache } from '../../src/core/cache/redis-cache'

describe('coerceCacheStore', () => {
  test('wraps a Cloudflare KV namespace (has `put`) in a KVCache', () => {
    const kv = {
      get: () => Promise.resolve(null),
      put: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }
    expect(coerceCacheStore(kv)).toBeInstanceOf(KVCache)
  })

  test('wraps a Redis client (has `del`) in a RedisCache', () => {
    const redis = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      del: () => Promise.resolve(1),
    }
    expect(coerceCacheStore(redis)).toBeInstanceOf(RedisCache)
  })

  test('returns a full CacheStore untouched', () => {
    const store: CacheStore = {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      clear: () => {},
    }
    expect(coerceCacheStore(store)).toBe(store)
  })

  test('prefers KV when a store somehow exposes both `put` and `del`', () => {
    const hybrid = {
      get: () => Promise.resolve(null),
      put: () => Promise.resolve(),
      set: () => Promise.resolve('OK'),
      del: () => Promise.resolve(1),
      delete: () => Promise.resolve(),
    }
    expect(coerceCacheStore(hybrid)).toBeInstanceOf(KVCache)
  })
})
