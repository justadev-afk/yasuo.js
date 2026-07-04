import type { CacheStore } from './cache-store'
import { KVCache, type KVNamespaceLike } from './kv-cache'
import { RedisCache, type RedisClientLike } from './redis-cache'

/**
 * Anything accepted as a cache `store`: a full {@link CacheStore}, or a raw
 * client that yasuo wraps for you — a Redis-compatible client
 * ({@link RedisClientLike}) or a Cloudflare KV namespace ({@link KVNamespaceLike}).
 */
export type CacheStoreLike = CacheStore | RedisClientLike | KVNamespaceLike

/** A KV namespace is the only candidate that exposes `put`. */
function isKVNamespaceLike(store: CacheStoreLike): store is KVNamespaceLike {
  return typeof (store as KVNamespaceLike).put === 'function'
}

/** A Redis client is the only candidate that exposes `del`. */
function isRedisClientLike(store: CacheStoreLike): store is RedisClientLike {
  return typeof (store as RedisClientLike).del === 'function'
}

/**
 * Coerce a user-supplied store into a {@link CacheStore}. A raw Redis client or
 * Cloudflare KV namespace is auto-wrapped in {@link RedisCache}/{@link KVCache};
 * anything already implementing `CacheStore` (it has `delete`/`clear`, not
 * `put`/`del`) is returned untouched.
 */
export function coerceCacheStore(store: CacheStoreLike): CacheStore {
  if (isKVNamespaceLike(store)) {
    return new KVCache(store)
  }
  if (isRedisClientLike(store)) {
    return new RedisCache(store)
  }
  return store
}
