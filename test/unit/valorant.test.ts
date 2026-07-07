import { describe, expect, test } from 'bun:test'
import { Yasuo } from '../../src/client/yasuo'
import { EMPTY_RATE_LIMITS } from '../../src/core/rate-limit/rate-limit-headers'
import { ValMatchlistEntity } from '../../src/entities/val/val-matchlist.entity'
import { ValRecentMatchesEntity } from '../../src/entities/val/val-recent-matches.entity'
import { HttpHeader } from '../../src/enums/http'
import { Shard, ValPlatformType, ValQueue } from '../../src/enums/valorant'
import { MockHttpClient } from '../support/mock-http-client'

function client(http: MockHttpClient, config = {}): Yasuo {
  return new Yasuo({
    key: 'RGAPI-test',
    httpClient: http,
    rateLimit: false,
    retry: false,
    ...config,
  })
}

const META = { status: 200, headers: {}, url: 'https://x', rateLimits: EMPTY_RATE_LIMITS }

describe('VALORANT namespace', () => {
  test('exposes the VAL service tree', () => {
    const yasuo = client(new MockHttpClient())
    expect(typeof yasuo.val.content.get).toBe('function')
    expect(typeof yasuo.val.match.get).toBe('function')
    expect(typeof yasuo.val.match.matchlist).toBe('function')
    expect(typeof yasuo.val.match.recent).toBe('function')
    expect(typeof yasuo.val.consoleMatch.matchlist).toBe('function')
    expect(typeof yasuo.val.ranked.leaderboard).toBe('function')
    expect(typeof yasuo.val.status.get).toBe('function')
  })

  test('content.get routes by shard with an optional locale and finds the active act', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          version: '1.0',
          characters: [],
          maps: [],
          chromas: [],
          skins: [],
          skinLevels: [],
          equips: [],
          gameModes: [],
          sprays: [],
          sprayLevels: [],
          charms: [],
          charmLevels: [],
          playerCards: [],
          playerTitles: [],
          acts: [
            { id: 'a1', name: 'Act I', assetName: 'Act1', isActive: false },
            { id: 'a2', name: 'Act II', assetName: 'Act2', isActive: true },
          ],
        },
      },
    ])
    const content = await client(http).val.content.get(Shard.NA, 'en-US').execute()
    expect(content.error).toBeNull()
    expect(content.version).toBe('1.0')
    expect(content.activeAct()?.id).toBe('a2')
    expect(http.lastUrl).toContain(
      'https://na.api.riotgames.com/val/content/v1/contents?locale=en-US',
    )
  })

  test('content.get omits the locale query when not given', async () => {
    const http = new MockHttpClient([{ status: 200, body: { version: '1', acts: [] } }])
    await client(http).val.content.get(Shard.EU).execute()
    expect(http.lastUrl).toBe('https://eu.api.riotgames.com/val/content/v1/contents')
  })

  test('status.get resolves a platform-status entity', async () => {
    const http = new MockHttpClient([
      { status: 200, body: { id: 'na', name: 'NA', locales: [], maintenances: [], incidents: [] } },
    ])
    const status = await client(http).val.status.get(Shard.NA).execute()
    expect(status.error).toBeNull()
    expect(status.hasActiveIssues()).toBe(false)
    expect(http.lastUrl).toContain('/val/status/v1/platform-data')
  })

  test('match.get maps a match and its team/player helpers', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          matchInfo: { matchId: 'm1', queueId: 'competitive' },
          players: [
            { puuid: 'p1', teamId: 'Blue' },
            { puuid: 'p2', teamId: 'Red' },
          ],
          coaches: [],
          teams: [
            { teamId: 'Blue', won: true, roundsWon: 13 },
            { teamId: 'Red', won: false, roundsWon: 8 },
          ],
          roundResults: [],
        },
      },
    ])
    const match = await client(http).val.match.get('m1', Shard.NA).execute()
    expect(match.error).toBeNull()
    expect(match.id).toBe('m1')
    expect(match.winningTeam()?.teamId).toBe('Blue')
    expect(match.player('p2')?.teamId).toBe('Red')
    expect(http.lastUrl).toContain('/val/match/v1/matches/m1')
  })

  test('match.matchlist exposes ids and a chainable relation to a full match', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          puuid: 'p',
          history: [
            { matchId: 'm1', gameStartTimeMillis: 2, queueId: 'competitive' },
            { matchId: 'm2', gameStartTimeMillis: 1, queueId: 'competitive' },
          ],
        },
      },
      {
        status: 200,
        body: {
          matchInfo: { matchId: 'm1' },
          players: [],
          coaches: [],
          teams: [],
          roundResults: [],
        },
      },
    ])
    const yasuo = client(http)
    const list = await yasuo.val.match.matchlist('p', Shard.NA).execute()
    expect(list.matchIds()).toEqual(['m1', 'm2'])
    // The relation makes no request until executed, and routes to the same shard.
    const match = await list.match('m1').execute()
    expect(match.id).toBe('m1')
    expect(http.callCount).toBe(2)
    expect(http.lastUrl).toContain('https://na.api.riotgames.com/val/match/v1/matches/m1')
  })

  test('match.recent maps the id list and its relation', async () => {
    const http = new MockHttpClient([
      { status: 200, body: { currentTime: 123, matchIds: ['m9'] } },
      {
        status: 200,
        body: {
          matchInfo: { matchId: 'm9' },
          players: [],
          coaches: [],
          teams: [],
          roundResults: [],
        },
      },
    ])
    const yasuo = client(http)
    const recent = await yasuo.val.match.recent(ValQueue.COMPETITIVE, Shard.NA).execute()
    expect(recent.matchIds).toEqual(['m9'])
    expect(http.lastUrl).toContain('/val/match/v1/recent-matches/by-queue/competitive')
    const match = await recent.match('m9').execute()
    expect(match.id).toBe('m9')
  })

  test('match.byPuuid hydrates the matchlist, honouring a count cap', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          puuid: 'p',
          history: [
            { matchId: 'm1', gameStartTimeMillis: 2, queueId: 'competitive' },
            { matchId: 'm2', gameStartTimeMillis: 1, queueId: 'competitive' },
          ],
        },
      },
      {
        status: 200,
        body: {
          matchInfo: { matchId: 'm1' },
          players: [],
          coaches: [],
          teams: [],
          roundResults: [],
        },
      },
    ])
    const matches = await client(http).val.match.byPuuid('p', Shard.NA, { count: 1 }).execute()
    expect(matches.error).toBeNull()
    expect(matches.length).toBe(1)
    // matchlist + 1 hydrate (count capped)
    expect(http.callCount).toBe(2)
  })

  test('match.byPuuid surfaces a matchlist failure as an empty errored collection', async () => {
    const http = new MockHttpClient([{ status: 404, body: { status: { message: 'no' } } }])
    const matches = await client(http).val.match.byPuuid('ghost', Shard.NA).execute()
    expect(matches.length).toBe(0)
    expect(matches.error?.status).toBe(404)
    expect(http.callCount).toBe(1)
  })

  test('match.byPuuid supports raw mode', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: { puuid: 'p', history: [{ matchId: 'm1', gameStartTimeMillis: 1, queueId: 'q' }] },
      },
      { status: 200, body: { matchInfo: { matchId: 'm1' } } },
    ])
    const raw = await client(http)
      .val.match.byPuuid('p', Shard.NA)
      .execute<unknown[]>({ raw: true })
    expect(Array.isArray(raw)).toBe(true)
    expect(raw).toHaveLength(1)
  })

  test('consoleMatch endpoints require the platformType query', async () => {
    const http = new MockHttpClient([{ status: 200, body: { puuid: 'p', history: [] } }])
    const yasuo = client(http)
    await yasuo.val.consoleMatch.matchlist('p', Shard.NA, ValPlatformType.PLAYSTATION).execute()
    expect(http.lastUrl).toContain(
      '/val/match/console/v1/matchlists/by-puuid/p?platformType=playstation',
    )
    await yasuo.val.consoleMatch.recent(ValQueue.UNRATED, Shard.NA, ValPlatformType.XBOX).execute()
    expect(http.lastUrl).toContain(
      '/val/match/console/v1/recent-matches/by-queue/unrated?platformType=xbox',
    )
  })

  test('ranked.leaderboard passes act id, size and startIndex, and exposes helpers', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          actId: 'act-1',
          shard: 'na',
          startIndex: 0,
          totalPlayers: 2,
          players: [
            {
              puuid: 'p1',
              leaderboardRank: 1,
              rankedRating: 500,
              numberOfWins: 100,
              competitiveTier: 27,
            },
            {
              puuid: 'p2',
              leaderboardRank: 2,
              rankedRating: 480,
              numberOfWins: 90,
              competitiveTier: 27,
            },
          ],
        },
      },
    ])
    const board = await client(http)
      .val.ranked.leaderboard('act-1', Shard.NA, { size: 2, startIndex: 0 })
      .execute()
    expect(board.error).toBeNull()
    expect(board.top(1)).toHaveLength(1)
    expect(board.player('p2')?.leaderboardRank).toBe(2)
    expect(http.lastUrl).toContain('/val/ranked/v1/leaderboards/by-act/act-1?size=2&startIndex=0')
  })

  test('VAL requests are signed with the configured VAL product key', async () => {
    const http = new MockHttpClient([{ status: 200, body: { version: '1', acts: [] } }])
    const yasuo = client(http, { key: undefined, keys: { val: 'VAL_KEY' } })
    await yasuo.val.content.get(Shard.NA).execute()
    expect(http.requests[0]?.headers[HttpHeader.RIOT_TOKEN]).toBe('VAL_KEY')
  })

  test('a matchlist/recent relation throws when the shard is unknown', () => {
    const yasuo = client(new MockHttpClient())
    const list = new ValMatchlistEntity({ puuid: 'p', history: [] }, META, { client: yasuo })
    expect(() => list.match('m1')).toThrow(/shard/)
    const recent = new ValRecentMatchesEntity({ currentTime: 1, matchIds: [] }, META, {
      client: yasuo,
    })
    expect(() => recent.match('m1')).toThrow(/shard/)
  })
})
