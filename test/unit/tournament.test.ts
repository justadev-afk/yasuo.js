import { describe, expect, test } from 'bun:test'
import { Yasuo } from '../../src/client/yasuo'
import { HttpHeader, HttpMethod } from '../../src/enums/http'
import { RegionGroup } from '../../src/enums/region'
import {
  TournamentMap,
  TournamentPickType,
  TournamentRegion,
  TournamentSpectatorType,
} from '../../src/enums/tournament'
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

const CODE_PARAMS = {
  mapType: TournamentMap.SUMMONERS_RIFT,
  pickType: TournamentPickType.TOURNAMENT_DRAFT,
  spectatorType: TournamentSpectatorType.ALL,
  teamSize: 5,
}

describe('Tournament-V5 namespace', () => {
  test('exposes the tournament + stub service trees', () => {
    const yasuo = client(new MockHttpClient())
    expect(typeof yasuo.lol.tournament.registerProvider).toBe('function')
    expect(typeof yasuo.lol.tournament.updateCode).toBe('function')
    expect(typeof yasuo.lol.tournamentStub.createCodes).toBe('function')
  })

  test('registerProvider POSTs the body and resolves the provider id', async () => {
    const http = new MockHttpClient([{ status: 200, body: 5001 }])
    const result = await client(http)
      .lol.tournament.registerProvider(
        { region: TournamentRegion.NA, url: 'https://cb.example' },
        RegionGroup.AMERICAS,
      )
      .execute()
    expect(result.error).toBeNull()
    expect(result.value).toBe(5001)
    const sent = http.requests[0]
    expect(sent?.method).toBe(HttpMethod.POST)
    expect(sent?.body).toEqual({ region: 'NA', url: 'https://cb.example' })
    expect(sent?.headers[HttpHeader.CONTENT_TYPE]).toBe('application/json')
    expect(sent?.url).toContain('https://americas.api.riotgames.com/lol/tournament/v5/providers')
  })

  test('registerTournament POSTs the body and resolves the tournament id', async () => {
    const http = new MockHttpClient([{ status: 200, body: 9002 }])
    const result = await client(http)
      .lol.tournament.registerTournament({ providerId: 5001, name: 'Cup' }, RegionGroup.AMERICAS)
      .execute()
    expect(result.value).toBe(9002)
    expect(http.requests[0]?.body).toEqual({ providerId: 5001, name: 'Cup' })
  })

  test('createCodes POSTs the params with count + tournamentId and returns the codes', async () => {
    const http = new MockHttpClient([{ status: 200, body: ['CODE1', 'CODE2'] }])
    const codes = await client(http)
      .lol.tournament.createCodes(CODE_PARAMS, RegionGroup.AMERICAS, {
        tournamentId: 9002,
        count: 2,
      })
      .execute()
    expect(codes.error).toBeNull()
    expect([...codes]).toEqual(['CODE1', 'CODE2'])
    const sent = http.requests[0]
    expect(sent?.method).toBe(HttpMethod.POST)
    expect(sent?.body).toEqual(CODE_PARAMS)
    expect(sent?.url).toContain('/lol/tournament/v5/codes?count=2&tournamentId=9002')
  })

  test('createCodes omits count when not provided', async () => {
    const http = new MockHttpClient([{ status: 200, body: ['CODE1'] }])
    await client(http)
      .lol.tournament.createCodes(CODE_PARAMS, RegionGroup.AMERICAS, { tournamentId: 9002 })
      .execute()
    expect(http.lastUrl).toContain('/codes?tournamentId=9002')
    expect(http.lastUrl).not.toContain('count=')
  })

  test('getCode GETs a code entity', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: { code: 'NA-abc', map: 'SUMMONERS_RIFT', teamSize: 5, participants: ['p1'] },
      },
    ])
    const code = await client(http).lol.tournament.getCode('NA-abc', RegionGroup.AMERICAS).execute()
    expect(code.error).toBeNull()
    expect(code.code).toBe('NA-abc')
    expect(code.teamSize).toBe(5)
    expect(http.requests[0]?.method).toBe(HttpMethod.GET)
    expect(http.lastUrl).toContain('/lol/tournament/v5/codes/NA-abc')
  })

  test('lobbyEvents GETs the event list', async () => {
    const http = new MockHttpClient([
      {
        status: 200,
        body: {
          eventList: [{ timestamp: '1', eventType: 'PracticeGameCreatedEvent', puuid: 'p1' }],
        },
      },
    ])
    const events = await client(http)
      .lol.tournament.lobbyEvents('NA-abc', RegionGroup.AMERICAS)
      .execute()
    expect(events.error).toBeNull()
    expect(events.events()).toHaveLength(1)
    expect(events.events()[0]?.eventType).toBe('PracticeGameCreatedEvent')
    expect(http.lastUrl).toContain('/lol/tournament/v5/lobby-events/by-code/NA-abc')
  })

  test('updateCode PUTs the params and reports success via a null error', async () => {
    const http = new MockHttpClient([{ status: 200, body: undefined }])
    const result = await client(http)
      .lol.tournament.updateCode(
        'NA-abc',
        {
          pickType: TournamentPickType.BLIND_PICK,
          mapType: TournamentMap.HOWLING_ABYSS,
          spectatorType: TournamentSpectatorType.NONE,
          allowedParticipants: ['p1', 'p2'],
        },
        RegionGroup.AMERICAS,
      )
      .execute()
    expect(result.error).toBeNull()
    const sent = http.requests[0]
    expect(sent?.method).toBe(HttpMethod.PUT)
    expect(sent?.body).toMatchObject({ pickType: 'BLIND_PICK', allowedParticipants: ['p1', 'p2'] })
    expect(sent?.url).toContain('/lol/tournament/v5/codes/NA-abc')
  })

  test('stub methods hit the tournament-stub path', async () => {
    const http = new MockHttpClient([{ status: 200, body: ['STUB1'] }])
    const codes = await client(http)
      .lol.tournamentStub.createCodes(CODE_PARAMS, RegionGroup.AMERICAS, { tournamentId: 1 })
      .execute()
    expect([...codes]).toEqual(['STUB1'])
    expect(http.lastUrl).toContain('/lol/tournament-stub/v5/codes')
  })

  test('stub getCode + lobbyEvents route to the stub path', async () => {
    const http = new MockHttpClient([
      { status: 200, body: { code: 'STUB', map: 'SUMMONERS_RIFT', teamSize: 5, participants: [] } },
      { status: 200, body: { eventList: [] } },
    ])
    const yasuo = client(http)
    await yasuo.lol.tournamentStub.getCode('STUB', RegionGroup.AMERICAS).execute()
    expect(http.lastUrl).toContain('/lol/tournament-stub/v5/codes/STUB')
    await yasuo.lol.tournamentStub.lobbyEvents('STUB', RegionGroup.AMERICAS).execute()
    expect(http.lastUrl).toContain('/lol/tournament-stub/v5/lobby-events/by-code/STUB')
  })

  test('tournament traffic is signed with the LoL product key', async () => {
    const http = new MockHttpClient([{ status: 200, body: 1 }])
    const yasuo = client(http, { key: undefined, keys: { lol: 'LOL_KEY' } })
    await yasuo.lol.tournament
      .registerProvider({ region: TournamentRegion.NA, url: 'https://cb' }, RegionGroup.AMERICAS)
      .execute()
    expect(http.requests[0]?.headers[HttpHeader.RIOT_TOKEN]).toBe('LOL_KEY')
  })
})
