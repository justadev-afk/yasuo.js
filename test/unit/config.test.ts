import { describe, expect, test } from 'bun:test'
import {
  resolveBaseUrl,
  resolveCacheOptions,
  resolveLogger,
  resolveRateLimiterOptions,
  resolveRetryOptions,
} from '../../src/client/config'
import { KVCache } from '../../src/core/cache/kv-cache'
import { MemoryCache } from '../../src/core/cache/memory-cache'
import { RedisCache } from '../../src/core/cache/redis-cache'
import { LogLevel, noopLogger } from '../../src/core/logger'
import { DEFAULT_BASE_URL } from '../../src/endpoints/endpoint'

describe('resolveRetryOptions', () => {
  test('applies defaults when omitted or true', () => {
    const defaults = resolveRetryOptions(undefined)
    expect(defaults).toEqual({
      enabled: true,
      maxAttempts: 3,
      maxRetryAfterSeconds: 120,
      retryOnServiceUnavailable: true,
      backoffBaseMs: 1000,
    })
    expect(resolveRetryOptions(true)).toEqual(defaults)
  })

  test('disables retries when false', () => {
    expect(resolveRetryOptions(false).enabled).toBe(false)
  })

  test('merges a partial override onto the defaults', () => {
    const resolved = resolveRetryOptions({ maxAttempts: 5, backoffBaseMs: 250 })
    expect(resolved.maxAttempts).toBe(5)
    expect(resolved.backoffBaseMs).toBe(250)
    expect(resolved.maxRetryAfterSeconds).toBe(120)
  })
})

describe('resolveRateLimiterOptions', () => {
  test('proactive limiting is OFF by default (undefined or false)', () => {
    expect(resolveRateLimiterOptions(undefined)).toEqual({ enabled: false })
    expect(resolveRateLimiterOptions(false)).toEqual({ enabled: false })
  })

  test('true enables the limiter', () => {
    expect(resolveRateLimiterOptions(true)).toEqual({ enabled: true })
  })

  test('an object keeps enabled true and spreads overrides', () => {
    const resolved = resolveRateLimiterOptions({ syncWithHeaders: false })
    expect(resolved.enabled).toBe(true)
    expect(resolved.syncWithHeaders).toBe(false)
  })
})

describe('resolveCacheOptions', () => {
  test('off by default', () => {
    expect(resolveCacheOptions(undefined).store).toBeNull()
    expect(resolveCacheOptions(false).store).toBeNull()
  })

  test('true yields an in-memory store and no global TTL override (namespace defaults apply)', () => {
    const resolved = resolveCacheOptions(true)
    expect(resolved.store).toBeInstanceOf(MemoryCache)
    expect(resolved.ttlMs).toBeUndefined()
  })

  test('honours a custom store and TTL', () => {
    const store = new MemoryCache()
    const resolved = resolveCacheOptions({ store, ttlMs: 5000 })
    expect(resolved.store).toBe(store)
    expect(resolved.ttlMs).toBe(5000)
  })

  test('enabled:false keeps caching off but retains ttl', () => {
    const resolved = resolveCacheOptions({ enabled: false, ttlMs: 5000 })
    expect(resolved.store).toBeNull()
    expect(resolved.ttlMs).toBe(5000)
  })

  test('wraps a raw Cloudflare KV namespace in a KVCache', () => {
    const kv = {
      get: () => Promise.resolve(null),
      put: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }
    expect(resolveCacheOptions({ store: kv }).store).toBeInstanceOf(KVCache)
  })

  test('wraps a raw Redis client in a RedisCache', () => {
    const redis = {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      del: () => Promise.resolve(1),
    }
    expect(resolveCacheOptions({ store: redis }).store).toBeInstanceOf(RedisCache)
  })
})

describe('resolveCacheOptions globals + namespace tree', () => {
  test('cache:true → memory store, enabled, no global overrides', () => {
    const resolved = resolveCacheOptions(true)
    expect(resolved.store).toBeInstanceOf(MemoryCache)
    expect(resolved.enabled).toBe(true)
    expect(resolved.ttlMs).toBeUndefined()
    expect(resolved.prefix).toBe('')
    expect(resolved.negativeTtlMs).toBeUndefined()
    expect(resolved.namespaces).toBeUndefined()
  })

  test('off → store null, disabled, empty globals', () => {
    const resolved = resolveCacheOptions(false)
    expect(resolved.store).toBeNull()
    expect(resolved.enabled).toBe(false)
    expect(resolved.prefix).toBe('')
  })

  test('undefined → disabled', () => {
    expect(resolveCacheOptions(undefined).enabled).toBe(false)
  })

  test('keeps the global overrides + raw namespace tree verbatim', () => {
    const namespaces = { lol: { match: { ttlMs: 5000 } } }
    const resolved = resolveCacheOptions({
      ttlMs: 1000,
      prefix: 'yjs:',
      negativeTtlMs: 30_000,
      namespaces,
    })
    expect(resolved.ttlMs).toBe(1000)
    expect(resolved.prefix).toBe('yjs:')
    expect(resolved.negativeTtlMs).toBe(30_000)
    expect(resolved.namespaces).toBe(namespaces)
  })

  test('enabled:false → store null even with a store given', () => {
    const resolved = resolveCacheOptions({ enabled: false, store: new MemoryCache() })
    expect(resolved.store).toBeNull()
    expect(resolved.enabled).toBe(false)
  })
})

describe('resolveLogger', () => {
  test('returns a custom logger verbatim', () => {
    expect(resolveLogger({ logger: noopLogger })).toBe(noopLogger)
  })

  test('builds a console logger from the log level when none is given', () => {
    const logger = resolveLogger({ logLevel: LogLevel.ERROR })
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })
})

describe('resolveBaseUrl', () => {
  test('falls back to the Riot default host', () => {
    expect(resolveBaseUrl(undefined)).toBe(DEFAULT_BASE_URL)
  })

  test('returns a custom base url unchanged', () => {
    expect(resolveBaseUrl('https://proxy.local/{game}/{routing}')).toBe(
      'https://proxy.local/{game}/{routing}',
    )
  })
})
