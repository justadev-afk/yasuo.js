import { describe, expect, test } from 'bun:test'
import type { CachedResult } from '../../src/core/cache'
import { KVCache, type KVNamespaceLike } from '../../src/core/cache/kv-cache'

interface PutCall {
  key: string
  value: string
  ttl: number | undefined
}

/** An in-memory stand-in for a Cloudflare KV namespace that records its `put` calls. */
class FakeKV implements KVNamespaceLike {
  readonly store = new Map<string, string>()
  readonly puts: PutCall[] = []
  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null)
  }
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<unknown> {
    this.puts.push({ key, value, ttl: options?.expirationTtl })
    this.store.set(key, value)
    return Promise.resolve()
  }
  delete(key: string): Promise<unknown> {
    this.store.delete(key)
    return Promise.resolve()
  }
}

const RESULT: CachedResult = {
  data: { puuid: 'p' },
  meta: {
    status: 200,
    rateLimits: { app: [], method: [], type: null, retryAfterSeconds: null, edgeTraceId: null },
    url: 'u',
    headers: {},
  },
}

describe('KVCache', () => {
  test('set stores a prefixed JSON value with a seconds TTL; get round-trips it', async () => {
    const kv = new FakeKV()
    const cache = new KVCache(kv)

    await cache.set('k', RESULT, 300_000) // 300s
    expect(kv.puts[0]?.key).toBe('yasuo:k')
    expect(kv.puts[0]?.ttl).toBe(300)

    expect(await cache.get('k')).toEqual(RESULT)
  })

  test('sub-minute TTLs are clamped up to the 60s KV minimum', async () => {
    const kv = new FakeKV()
    await new KVCache(kv).set('k', RESULT, 5_000) // 5s -> floor 60s
    expect(kv.puts[0]?.ttl).toBe(60)
  })

  test('a TTL that is not a whole second rounds up', async () => {
    const kv = new FakeKV()
    await new KVCache(kv).set('k', RESULT, 90_400) // 90.4s -> 91
    expect(kv.puts[0]?.ttl).toBe(91)
  })

  test('get returns undefined on a miss and on malformed JSON', async () => {
    const kv = new FakeKV()
    const cache = new KVCache(kv)
    expect(await cache.get('missing')).toBeUndefined()

    kv.store.set('yasuo:bad', '{not json')
    expect(await cache.get('bad')).toBeUndefined()
  })

  test('set is a no-op when the TTL is non-positive', async () => {
    const kv = new FakeKV()
    await new KVCache(kv).set('k', RESULT, 0)
    expect(kv.puts.length).toBe(0)
  })

  test('a custom key prefix is applied', async () => {
    const kv = new FakeKV()
    await new KVCache(kv, { keyPrefix: 'app:' }).set('k', RESULT, 60_000)
    expect(kv.puts[0]?.key).toBe('app:k')
  })

  test('delete removes the prefixed key', async () => {
    const kv = new FakeKV()
    const cache = new KVCache(kv)
    await cache.set('k', RESULT, 60_000)
    await cache.delete('k')
    expect(await cache.get('k')).toBeUndefined()
  })

  test('clear is unsupported and throws', async () => {
    await expect(new KVCache(new FakeKV()).clear()).rejects.toThrow(/not supported/)
  })
})
