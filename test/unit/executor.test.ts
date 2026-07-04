import { describe, expect, test } from 'bun:test'
import { RequestExecutor } from '../../src/core/request/request-executor'
import type { Endpoint } from '../../src/endpoints/endpoint'
import { Game } from '../../src/enums/game'
import { HttpHeader } from '../../src/enums/http'
import { ApiKeyMissingError, NotFoundError } from '../../src/errors'
import { MockHttpClient } from '../support/mock-http-client'

const SUMMONER: Endpoint = {
  id: 'summoner.byPuuid',
  game: Game.LOL,
  path: 'summoner/v4/summoners/by-puuid/:puuid',
}

describe('RequestExecutor', () => {
  test('returns parsed data and meta on success', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: { puuid: 'abc', summonerLevel: 500 },
        headers: {
          [HttpHeader.APP_RATE_LIMIT]: '100:120',
          [HttpHeader.APP_RATE_LIMIT_COUNT]: '1:120',
        },
      },
    ])
    const executor = new RequestExecutor({ key: 'RGAPI-test', httpClient: http, rateLimit: false })
    const result = await executor.request<{ puuid: string }>('KR', SUMMONER, {
      pathParams: { puuid: 'abc' },
    })
    expect(result.data.puuid).toBe('abc')
    expect(result.meta.status).toBe(200)
    expect(result.meta.url).toContain('by-puuid/abc')
    expect(result.meta.rateLimits.app).toEqual([{ limit: 100, intervalSeconds: 120, count: 1 }])
  })

  test('sends the API key in the x-riot-token header', async () => {
    const http = new MockHttpClient([{ status: 200, body: {} }])
    const executor = new RequestExecutor({
      key: 'RGAPI-secret',
      httpClient: http,
      rateLimit: false,
    })
    await executor.request('KR', SUMMONER, { pathParams: { puuid: 'p' } })
    expect(http.requests[0]?.headers[HttpHeader.RIOT_TOKEN]).toBe('RGAPI-secret')
  })

  test('throws ApiKeyMissingError when no key is configured', async () => {
    const http = new MockHttpClient([{ status: 200, body: {} }])
    // An empty-string key is treated as missing (does not fall through to env).
    const executor = new RequestExecutor({ key: '', httpClient: http })
    await expect(
      executor.request('KR', SUMMONER, { pathParams: { puuid: 'p' } }),
    ).rejects.toBeInstanceOf(ApiKeyMissingError)
    expect(http.callCount).toBe(0)
  })

  test('throws a typed NotFoundError on 404', async () => {
    const http = new MockHttpClient([{ status: 404, body: { status: { message: 'not found' } } }])
    const executor = new RequestExecutor({
      key: 'RGAPI-test',
      httpClient: http,
      rateLimit: false,
      retry: false,
    })
    await expect(
      executor.request('KR', SUMMONER, { pathParams: { puuid: 'p' } }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  test('retries a 429 then succeeds', async () => {
    const http = new MockHttpClient([
      { status: 429, headers: {} },
      { status: 200, body: { ok: true } },
    ])
    const executor = new RequestExecutor({
      key: 'RGAPI-test',
      httpClient: http,
      rateLimit: false,
      retry: { enabled: true, maxAttempts: 3, backoffBaseMs: 1 },
    })
    const result = await executor.request<{ ok: boolean }>('KR', SUMMONER, {
      pathParams: { puuid: 'p' },
    })
    expect(result.data.ok).toBe(true)
    expect(http.callCount).toBe(2)
  })

  test('serves a cache hit without a second network call', async () => {
    const http = new MockHttpClient([{ status: 200, body: { puuid: 'cached' } }])
    const executor = new RequestExecutor({
      key: 'RGAPI-test',
      httpClient: http,
      rateLimit: false,
      cache: true,
    })
    const first = await executor.request<{ puuid: string }>('KR', SUMMONER, {
      pathParams: { puuid: 'p' },
    })
    const second = await executor.request<{ puuid: string }>('KR', SUMMONER, {
      pathParams: { puuid: 'p' },
    })
    expect(first.data.puuid).toBe('cached')
    expect(second.data.puuid).toBe('cached')
    expect(http.callCount).toBe(1)
  })
})
