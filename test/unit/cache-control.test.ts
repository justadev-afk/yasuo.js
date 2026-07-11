import { describe, expect, test } from 'bun:test'
import { Yasuo } from '../../src/client/yasuo'
import { Region, RegionGroup } from '../../src/enums/region'
import { NotFoundError } from '../../src/errors'
import { forwardExec } from '../../src/query/execute-options'
import { MockHttpClient } from '../support/mock-http-client'

describe('execute({ cache }) end-to-end', () => {
  test('cache:false forces a fresh request but refreshes the cached entry', async () => {
    const http = new MockHttpClient([
      { status: 200, body: { puuid: 'p', summonerLevel: 1 } },
      { status: 200, body: { puuid: 'p', summonerLevel: 2 } },
    ])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    const first = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(first.summonerLevel).toBe(1)

    // Skips the cached read → hits Riot again → sees the fresh value…
    const fresh = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute({ cache: false })
    expect(fresh.summonerLevel).toBe(2)
    expect(http.callCount).toBe(2)

    // …and it wrote that fresh value back, so a normal read now serves it with no call.
    const cached = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(cached.summonerLevel).toBe(2)
    expect(http.callCount).toBe(2)
  })

  test('a normal cached read is served without a second call', async () => {
    const http = new MockHttpClient([{ status: 200, body: { puuid: 'p', summonerLevel: 7 } }])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    const second = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(second.summonerLevel).toBe(7)
    expect(http.callCount).toBe(1)
  })

  test('match.byPuuid propagates the cache override to every sub-request', async () => {
    const http = new MockHttpClient([
      { status: 200, body: ['KR_1'] },
      { status: 200, body: { metadata: { matchId: 'KR_1' }, info: { participants: [] } } },
      { status: 200, body: ['KR_1'] },
      { status: 200, body: { metadata: { matchId: 'KR_1' }, info: { participants: [] } } },
    ])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    await yasuo.lol.match.byPuuid('p', RegionGroup.ASIA, { count: 1 }).execute()
    const afterFirst = http.callCount

    // With cache:false forwarded, both the id list and each match are re-fetched.
    await yasuo.lol.match.byPuuid('p', RegionGroup.ASIA, { count: 1 }).execute({ cache: false })
    expect(http.callCount).toBe(afterFirst + 2)
  })
})

describe('negative caching (not-found)', () => {
  test('a 404 is negative-cached — the repeat costs no request and resolves the same error', async () => {
    const http = new MockHttpClient([
      { status: 404, body: { status: { message: 'Data not found' } } },
    ])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    const first = await yasuo.lol.summoner.byPuuid('missing', Region.KR).execute()
    expect(first.error).toBeInstanceOf(NotFoundError)
    expect(http.callCount).toBe(1)

    const second = await yasuo.lol.summoner.byPuuid('missing', Region.KR).execute()
    expect(second.error).toBeInstanceOf(NotFoundError)
    expect(http.callCount).toBe(1) // served from the negative cache — no second call
  })

  test('negativeTtlMs:0 disables negative caching (each miss re-requests)', async () => {
    const http = new MockHttpClient([{ status: 404, body: {} }])
    const yasuo = new Yasuo({
      key: 'RGAPI-test',
      httpClient: http,
      cache: { namespaces: { lol: { summoner: { negativeTtlMs: 0 } } } },
    })

    await yasuo.lol.summoner.byPuuid('x', Region.KR).execute()
    await yasuo.lol.summoner.byPuuid('x', Region.KR).execute()
    expect(http.callCount).toBe(2)
  })

  test('a live-game 404 (not in a game) is NOT negative-cached by default', async () => {
    const http = new MockHttpClient([
      { status: 404, body: {} },
      { status: 200, body: { gameId: 1, participants: [] } },
    ])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    expect(await yasuo.lol.spectator.active('p', Region.KR).execute()).toBeNull()
    // No negative cache → a second call re-hits Riot and sees the now-started game.
    expect(await yasuo.lol.spectator.active('p', Region.KR).execute()).not.toBeNull()
    expect(http.callCount).toBe(2)
  })

  test('a successful response overwrites a prior negative entry', async () => {
    const http = new MockHttpClient([
      { status: 404, body: {} },
      { status: 200, body: { puuid: 'p', summonerLevel: 9 } },
    ])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    const miss = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(miss.error).toBeInstanceOf(NotFoundError)
    // Force a refresh past the negative entry → 200 → now cached positive.
    const fresh = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute({ cache: false })
    expect(fresh.summonerLevel).toBe(9)
    const cached = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(cached.summonerLevel).toBe(9)
    expect(http.callCount).toBe(2)
  })

  test('throw:true still throws on a negative-cache hit', async () => {
    const http = new MockHttpClient([{ status: 404, body: {} }])
    const yasuo = new Yasuo({ key: 'RGAPI-test', httpClient: http, cache: true })

    await yasuo.lol.summoner.byPuuid('m', Region.KR).execute()
    expect(
      yasuo.lol.summoner.byPuuid('m', Region.KR).execute({ throw: true }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(http.callCount).toBe(1)
  })
})

describe('cache key prefix', () => {
  test('composed prefixes still round-trip a positive entry', async () => {
    const http = new MockHttpClient([{ status: 200, body: { puuid: 'p', summonerLevel: 5 } }])
    const yasuo = new Yasuo({
      key: 'RGAPI-test',
      httpClient: http,
      cache: {
        prefix: 'yjs:',
        namespaces: { lol: { prefix: 'lol:', summoner: { prefix: 's:' } } },
      },
    })

    await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    const cached = await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(cached.summonerLevel).toBe(5)
    expect(http.callCount).toBe(1)
  })

  test('a per-method TTL override applies (method scope resolved from endpoint.id)', async () => {
    const http = new MockHttpClient([{ status: 200, body: { puuid: 'p', summonerLevel: 1 } }])
    const yasuo = new Yasuo({
      key: 'RGAPI-test',
      httpClient: http,
      cache: { namespaces: { lol: { summoner: { byPuuid: { enabled: false } } } } },
    })

    // byPuuid caching is disabled at the method scope → the read never serves.
    await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    await yasuo.lol.summoner.byPuuid('p', Region.KR).execute()
    expect(http.callCount).toBe(2)
  })
})

describe('forwardExec', () => {
  test('keeps only the cache override and abort signal', () => {
    const signal = new AbortController().signal
    expect(forwardExec({ throw: true, raw: true })).toEqual({})
    expect(forwardExec({ cache: false, signal })).toEqual({ cache: false, signal })
    expect(forwardExec({ cache: { ttlMs: 500 } })).toEqual({ cache: { ttlMs: 500 } })
  })
})
