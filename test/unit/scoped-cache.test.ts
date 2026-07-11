import { describe, expect, test } from 'bun:test'
import { DEFAULT_NAMESPACE_TTL_MS } from '../../src/core/cache/namespace-defaults'
import {
  type NamespacesCacheConfig,
  resolveScopedCache,
  type ScopedCacheGlobals,
} from '../../src/core/cache/scoped-cache'
import { CacheNamespace } from '../../src/enums/cache-namespace'

const GLOBALS: ScopedCacheGlobals = {
  enabled: true,
  ttlMs: undefined,
  prefix: '',
  negativeTtlMs: undefined,
}

describe('resolveScopedCache', () => {
  test('no tree → namespace positive default TTL + globally enabled', () => {
    const r = resolveScopedCache(GLOBALS, undefined, CacheNamespace.LolSummoner, 'byPuuid')
    expect(r.enabled).toBe(true)
    expect(r.ttlMs).toBe(DEFAULT_NAMESPACE_TTL_MS[CacheNamespace.LolSummoner])
    expect(r.prefix).toBe('')
  })

  test('a global ttlMs overrides the per-namespace default', () => {
    const r = resolveScopedCache(
      { ...GLOBALS, ttlMs: 1000 },
      undefined,
      CacheNamespace.LolMatch,
      'byId',
    )
    expect(r.ttlMs).toBe(1000)
  })

  test('ttlMs precedence: method > service > product > global', () => {
    const tree: NamespacesCacheConfig = {
      lol: { ttlMs: 1, summoner: { ttlMs: 2, byPuuid: { ttlMs: 3 } } },
    }
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byPuuid').ttlMs).toBe(3)
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byId').ttlMs).toBe(2)
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolMatch, 'byId').ttlMs).toBe(1)
  })

  test('prefix composes global + product + service + method', () => {
    const tree: NamespacesCacheConfig = {
      lol: { prefix: 'lol:', summoner: { prefix: 's:', byPuuid: { prefix: 'p:' } } },
    }
    const r = resolveScopedCache(
      { ...GLOBALS, prefix: 'yjs:' },
      tree,
      CacheNamespace.LolSummoner,
      'byPuuid',
    )
    expect(r.prefix).toBe('yjs:lol:s:p:')
  })

  test('enabled:false at a scope wins over an enabled global', () => {
    const tree: NamespacesCacheConfig = { lol: { summoner: { enabled: false } } }
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byPuuid').enabled).toBe(
      false,
    )
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolMatch, 'byId').enabled).toBe(true)
  })

  test('a more specific enabled:true re-enables under a disabled service (?? semantics)', () => {
    const tree: NamespacesCacheConfig = {
      lol: { summoner: { enabled: false, byPuuid: { enabled: true } } },
    }
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byPuuid').enabled).toBe(
      true,
    )
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byId').enabled).toBe(
      false,
    )
  })

  test('negative TTL defaults to the positive namespace default', () => {
    const r = resolveScopedCache(GLOBALS, undefined, CacheNamespace.RiotAccount, 'byRiotId')
    expect(r.negativeTtlMs).toBe(DEFAULT_NAMESPACE_TTL_MS[CacheNamespace.RiotAccount])
  })

  test('live-game namespaces default negative TTL to 0 (their 404 flips fast)', () => {
    expect(
      resolveScopedCache(GLOBALS, undefined, CacheNamespace.LolSpectator, 'active').negativeTtlMs,
    ).toBe(0)
    expect(
      resolveScopedCache(GLOBALS, undefined, CacheNamespace.TftSpectator, 'active').negativeTtlMs,
    ).toBe(0)
  })

  test('a global negativeTtlMs overrides the per-namespace default (even live-game)', () => {
    const r = resolveScopedCache(
      { ...GLOBALS, negativeTtlMs: 5000 },
      undefined,
      CacheNamespace.LolSpectator,
      'active',
    )
    expect(r.negativeTtlMs).toBe(5000)
  })

  test('a per-scope negativeTtlMs opts a live-game namespace back into negative caching', () => {
    const tree: NamespacesCacheConfig = { lol: { spectator: { negativeTtlMs: 30_000 } } }
    expect(
      resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSpectator, 'active').negativeTtlMs,
    ).toBe(30_000)
  })

  test('an empty/unknown method token falls back to the service scope', () => {
    const tree: NamespacesCacheConfig = { lol: { summoner: { ttlMs: 42 } } }
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, '').ttlMs).toBe(42)
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'nope').ttlMs).toBe(42)
  })

  test('scopes below the requested namespace do not leak across siblings', () => {
    const tree: NamespacesCacheConfig = { lol: { match: { ttlMs: 99 } } }
    // summoner has no override → falls to its own namespace default, not match's 99.
    expect(resolveScopedCache(GLOBALS, tree, CacheNamespace.LolSummoner, 'byPuuid').ttlMs).toBe(
      DEFAULT_NAMESPACE_TTL_MS[CacheNamespace.LolSummoner],
    )
  })
})
