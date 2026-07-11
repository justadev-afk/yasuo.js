import type { ResponseMeta } from '../../dto/common.dto'

/** A cached response payload plus its metadata. */
export interface CachedResult {
  readonly data: unknown
  readonly meta: ResponseMeta
  /**
   * When `true`, this entry **negative-caches** a not-found (`404`): `data` is
   * `null` and, on a cache hit, the executor reconstructs and throws the
   * `NotFoundError` instead of returning a payload — so a repeated lookup of a
   * non-existent resource costs no request. Absent on ordinary (positive) entries.
   */
  readonly notFound?: boolean
}

/**
 * Pluggable cache backend. Implement this interface to back the client with any
 * store (Redis, Memcached, a CDN edge cache…). Methods may be sync or async.
 */
export interface CacheStore {
  /** Look up a cached result by key. Returns `undefined` on miss/expiry. */
  get(key: string): Promise<CachedResult | undefined> | CachedResult | undefined
  /** Store a result under `key`, expiring after `ttlMs` milliseconds. */
  set(key: string, value: CachedResult, ttlMs: number): Promise<void> | void
  /** Remove a single key. */
  delete(key: string): Promise<void> | void
  /** Remove everything. */
  clear(): Promise<void> | void
}
