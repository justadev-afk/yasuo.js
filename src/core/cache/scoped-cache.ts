import type { EndpointId } from '../../endpoints'
import type { CacheNamespace, CacheNamespaceKey } from '../../enums/cache-namespace'
import { DEFAULT_NAMESPACE_TTL_MS, LIVE_GAME_NAMESPACES } from './namespace-defaults'

/**
 * Cache knobs configurable at **any scope** — globally, per product, per service,
 * or per method. More specific scopes win for `enabled`/`ttlMs`/`negativeTtlMs`;
 * `prefix` is **composed** down the tree (product + service + method), letting you
 * shape hierarchical cache keys.
 */
export interface CacheLevelOptions {
  /** Turn caching on/off for this scope (and everything under it). */
  enabled?: boolean
  /** Positive TTL (ms) for successful responses in this scope. */
  ttlMs?: number
  /** Cache-key prefix segment for this scope, prepended (composed) to the key. */
  prefix?: string
  /**
   * Not-found (`404`) TTL (ms) for this scope. `0` disables negative caching here.
   * Defaults to the namespace's positive TTL, except live-game (spectator)
   * namespaces which default to `0` (their not-found flips too quickly to cache).
   */
  negativeTtlMs?: number
}

// These conditionals must **distribute** over the `CacheNamespaceKey` / `EndpointId`
// unions, so the union is passed as a naked type parameter (`K`/`Id`) to a helper —
// a bare `Union extends \`${P}.${infer S}\`` would test the whole union at once and
// collapse to `never`.
type ProductOf<K> = K extends `${infer P}.${string}` ? P : never
type ServiceOf<K, P extends string> = K extends `${P}.${infer S}` ? S : never
type MethodOf<Id, P extends string, S extends string> = Id extends `${P}.${S}.${infer M}`
  ? M
  : never

/** Product segment of a namespace key (`'lol'` from `'lol.summoner'`). */
export type CacheProduct = ProductOf<CacheNamespaceKey>

/** Service segment of a product's namespace keys (`'summoner'` for `'lol'`). */
export type CacheService<P extends CacheProduct> = ServiceOf<CacheNamespaceKey, P>

/**
 * Method token of a `<product>.<service>` namespace — the third segment of its
 * endpoint ids (`'byPuuid'` for `'lol.summoner'`). Mirrors the runtime `endpoint.id`
 * suffix, so it can differ slightly from the public method name where the two drift
 * (e.g. `byAccount` vs `byAccountId`).
 */
export type CacheMethod<P extends CacheProduct, S extends CacheService<P>> = MethodOf<
  EndpointId,
  P,
  S
>

/** Per-service cache config: the service's own knobs plus a per-method map. */
export type ServiceCacheConfig<
  P extends CacheProduct,
  S extends CacheService<P>,
> = CacheLevelOptions & {
  [M in CacheMethod<P, S>]?: CacheLevelOptions
}

/** Per-product cache config: the product's own knobs plus a per-service map. */
export type ProductCacheConfig<P extends CacheProduct> = CacheLevelOptions & {
  [S in CacheService<P>]?: ServiceCacheConfig<P, S>
}

/**
 * The nested, `keyof`-derived per-namespace cache config: a tree of
 * `product → service → method`, each level accepting {@link CacheLevelOptions}.
 * Keys autocomplete from the real client surface, so a typo is a type error.
 *
 * @example
 * ```ts
 * namespaces: {
 *   lol: {
 *     prefix: 'lol:',
 *     match: { ttlMs: 86_400_000, prefix: 'm:' },      // finished matches — a day
 *     summoner: { byPuuid: { ttlMs: 600_000 } },       // per-method override
 *     spectator: { negativeTtlMs: 30_000 },            // opt live-game into negative cache
 *   },
 * }
 * ```
 */
export type NamespacesCacheConfig = {
  [P in CacheProduct]?: ProductCacheConfig<P>
}

/** Fully-resolved cache settings for one request's scope. */
export interface ResolvedScopedCache {
  readonly enabled: boolean
  readonly ttlMs: number
  readonly prefix: string
  readonly negativeTtlMs: number
}

/** Global cache defaults folded in beneath every per-namespace override. */
export interface ScopedCacheGlobals {
  readonly enabled: boolean
  readonly ttlMs: number | undefined
  readonly prefix: string
  readonly negativeTtlMs: number | undefined
}

/** A node in the config tree, walked structurally (own knobs + object children). */
interface RawNode extends CacheLevelOptions {
  readonly [child: string]: unknown
}

/** The child node under `key` when it's an object (a nested scope), else `undefined`. */
function childNode(parent: RawNode | undefined, key: string): RawNode | undefined {
  const child = parent?.[key]
  return child !== null && typeof child === 'object' ? (child as RawNode) : undefined
}

/** Not-found TTL default: the namespace's positive default, or `0` for live-game. */
function defaultNegativeTtlMs(namespace: CacheNamespace): number {
  return LIVE_GAME_NAMESPACES.has(namespace) ? 0 : DEFAULT_NAMESPACE_TTL_MS[namespace]
}

/**
 * Resolve the effective cache settings for a single request by folding the nested
 * per-namespace `tree` (method over service over product) over the `globals`, with
 * built-in per-namespace defaults as the floor. `methodToken` is the request's
 * `endpoint.id` suffix (`''` when unknown → method scope skipped). Pure.
 */
export function resolveScopedCache(
  globals: ScopedCacheGlobals,
  tree: NamespacesCacheConfig | undefined,
  namespace: CacheNamespace,
  methodToken: string,
): ResolvedScopedCache {
  const dot = namespace.indexOf('.')
  const product = namespace.slice(0, dot)
  const service = namespace.slice(dot + 1)

  const productNode = childNode(tree as RawNode | undefined, product)
  const serviceNode = childNode(productNode, service)
  const methodNode = methodToken ? childNode(serviceNode, methodToken) : undefined

  const pick = <K extends keyof CacheLevelOptions>(key: K): CacheLevelOptions[K] =>
    methodNode?.[key] ?? serviceNode?.[key] ?? productNode?.[key]

  return {
    enabled: pick('enabled') ?? globals.enabled,
    ttlMs: pick('ttlMs') ?? globals.ttlMs ?? DEFAULT_NAMESPACE_TTL_MS[namespace],
    negativeTtlMs:
      pick('negativeTtlMs') ?? globals.negativeTtlMs ?? defaultNegativeTtlMs(namespace),
    prefix:
      globals.prefix +
      (productNode?.prefix ?? '') +
      (serviceNode?.prefix ?? '') +
      (methodNode?.prefix ?? ''),
  }
}
