import { describe, expect, test } from 'bun:test'
import { Yasuo } from '../../src/client/yasuo'
import { HttpHeader } from '../../src/enums/http'
import { RegionGroup } from '../../src/enums/region'
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

function matchBody(matchId: string) {
  return {
    metadata: { dataVersion: '1', matchId, participants: ['p1', 'p2'] },
    info: {
      gameMode: 'Constructed',
      gameType: 'Ranked',
      gameStartTimeUtc: '2024-01-01T00:00:00Z',
      gameVersion: 'v1',
      totalTurnCount: 20,
      players: [
        {
          puuid: 'p1',
          deckId: 'd1',
          deckCode: 'c1',
          factions: ['DE'],
          gameOutcome: 'win',
          orderOfPlay: 0,
        },
        {
          puuid: 'p2',
          deckId: 'd2',
          deckCode: 'c2',
          factions: ['PZ'],
          gameOutcome: 'loss',
          orderOfPlay: 1,
        },
      ],
    },
  }
}

describe('Legends of Runeterra namespace', () => {
  test('exposes the LoR service tree', () => {
    const yasuo = client(new MockHttpClient())
    expect(typeof yasuo.lor.match.idsByPuuid).toBe('function')
    expect(typeof yasuo.lor.match.get).toBe('function')
    expect(typeof yasuo.lor.match.byPuuid).toBe('function')
    expect(typeof yasuo.lor.ranked.leaderboard).toBe('function')
    expect(typeof yasuo.lor.status.get).toBe('function')
  })

  test('match.idsByPuuid returns a collection of ids', async () => {
    const http = new MockHttpClient([{ status: 200, body: ['A1', 'A2'] }])
    const ids = await client(http).lor.match.idsByPuuid('p', RegionGroup.AMERICAS).execute()
    expect([...ids]).toEqual(['A1', 'A2'])
    expect(http.lastUrl).toContain(
      'https://americas.api.riotgames.com/lor/match/v1/matches/by-puuid/p/ids',
    )
  })

  test('match.get maps a match with id/player/winner helpers', async () => {
    const http = new MockHttpClient([{ status: 200, body: matchBody('A1') }])
    const match = await client(http).lor.match.get('A1', RegionGroup.EUROPE).execute()
    expect(match.error).toBeNull()
    expect(match.id).toBe('A1')
    expect(match.player('p2')?.gameOutcome).toBe('loss')
    expect(match.winner()?.puuid).toBe('p1')
    expect(http.lastUrl).toContain('https://europe.api.riotgames.com/lor/match/v1/matches/A1')
  })

  test('match.byPuuid hydrates every id', async () => {
    const http = new MockHttpClient([
      { status: 200, body: ['A1', 'A2'] },
      { status: 200, body: matchBody('A1') },
    ])
    const matches = await client(http).lor.match.byPuuid('p', RegionGroup.AMERICAS).execute()
    expect(matches.error).toBeNull()
    expect(matches.length).toBe(2)
    expect(http.callCount).toBe(3) // ids + 2 hydrations
  })

  test('match.byPuuid surfaces an id-list failure as an empty errored collection', async () => {
    const http = new MockHttpClient([{ status: 404, body: { status: { message: 'no' } } }])
    const matches = await client(http).lor.match.byPuuid('ghost', RegionGroup.AMERICAS).execute()
    expect(matches.length).toBe(0)
    expect(matches.error?.status).toBe(404)
    expect(http.callCount).toBe(1)
  })

  test('match.byPuuid supports raw mode', async () => {
    const http = new MockHttpClient([
      { status: 200, body: ['A1'] },
      { status: 200, body: matchBody('A1') },
    ])
    const raw = await client(http)
      .lor.match.byPuuid('p', RegionGroup.AMERICAS)
      .execute<unknown[]>({ raw: true })
    expect(Array.isArray(raw)).toBe(true)
    expect(raw).toHaveLength(1)
  })

  test('ranked.leaderboard maps rows with top/player helpers', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          players: [
            { name: 'Alpha', rank: 0, lp: 1200 },
            { name: 'Bravo', rank: 1, lp: 1100 },
          ],
        },
      },
    ])
    const board = await client(http).lor.ranked.leaderboard(RegionGroup.AMERICAS).execute()
    expect(board.error).toBeNull()
    expect(board.top(1)).toHaveLength(1)
    expect(board.player('Bravo')?.lp).toBe(1100)
    expect(http.lastUrl).toContain('/lor/ranked/v1/leaderboards')
  })

  test('status.get resolves a platform-status entity', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: { id: 'lor', name: 'LoR', locales: [], maintenances: [], incidents: [] },
      },
    ])
    const status = await client(http).lor.status.get(RegionGroup.EUROPE).execute()
    expect(status.error).toBeNull()
    expect(status.hasActiveIssues()).toBe(false)
    expect(http.lastUrl).toContain('/lor/status/v1/platform-data')
  })

  test('LoR requests are signed with the configured LoR product key', async () => {
    const http = new MockHttpClient([{ status: 200, body: [] }])
    const yasuo = client(http, { key: undefined, keys: { lor: 'LOR_KEY' } })
    await yasuo.lor.match.idsByPuuid('p', RegionGroup.AMERICAS).execute()
    expect(http.requests[0]?.headers[HttpHeader.RIOT_TOKEN]).toBe('LOR_KEY')
  })
})
