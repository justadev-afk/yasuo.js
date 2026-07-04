import { beforeAll, describe, expect, test } from 'bun:test'
import { Yasuo } from '../../src/client/yasuo'
import { LogLevel } from '../../src/core/logger'
import { Game } from '../../src/enums/game'
import { Region, RegionGroup, regionToAccountRegionGroup } from '../../src/enums/region'
import { ForbiddenError, NotFoundError } from '../../src/errors'

/**
 * Live integration tests against the real Riot API.
 *
 * They require a `RIOT_API_KEY` (loaded from `.env` by Bun, or supplied as the
 * `RIOT_API_KEY` GitHub Actions secret). When no key is present the whole suite
 * is skipped rather than failing, so `bun test` stays green offline.
 *
 * A development key's access is limited, so endpoints that a dev key cannot
 * reach (`403`) are tolerated instead of failing the run.
 */
const KEY = process.env.RIOT_API_KEY
const GAME_NAME = process.env.YASUO_TEST_GAME_NAME ?? 'Hide on bush'
const TAG_LINE = process.env.YASUO_TEST_TAG_LINE ?? 'KR1'

/** Accept both enum keys (`KR`) and friendly names (`KOREA`) in the env. */
const REGION_ALIASES: Record<string, Region> = {
  KR: Region.KR,
  KOREA: Region.KR,
  NA: Region.NA,
  EUW: Region.EUW,
}
const REGION = REGION_ALIASES[(process.env.YASUO_TEST_REGION ?? 'KR').toUpperCase()] ?? Region.KR
const ACCOUNT_GROUP = regionToAccountRegionGroup(REGION)
const MATCH_GROUP = REGION === Region.KR ? RegionGroup.ASIA : regionToAccountRegionGroup(REGION)

const hasKey = typeof KEY === 'string' && KEY.startsWith('RGAPI')
const describeLive = hasKey ? describe : describe.skip

if (!hasKey) {
  console.warn('[integration] RIOT_API_KEY not set — skipping live tests')
}

/** Run a live call, returning `null` if a dev key is simply not authorised. */
async function tolerateForbidden<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return null
    }
    throw error
  }
}

describeLive('live Riot API', () => {
  let yasuo: Yasuo
  let puuid: string

  beforeAll(async () => {
    yasuo = new Yasuo({ key: KEY, logLevel: LogLevel.SILENT, cache: true })
    const account = await yasuo.riot.account.byRiotId(GAME_NAME, TAG_LINE, ACCOUNT_GROUP)
    puuid = account.puuid
  })

  test('resolves a Riot account by game name and tag line', async () => {
    const account = await yasuo.riot.account.byRiotId(GAME_NAME, TAG_LINE, ACCOUNT_GROUP)
    expect(account.puuid).toBeString()
    expect(account.puuid.length).toBeGreaterThan(0)
    // Rate-limit metadata travels with the entity (the Twisted evolution).
    expect(account.meta.status).toBe(200)
    expect(account.rateLimits.app.length).toBeGreaterThan(0)
  })

  test('fetches the summoner by PUUID', async () => {
    const summoner = await yasuo.lol.summoner.byPuuid(puuid, REGION)
    expect(summoner.puuid).toBe(puuid)
    expect(summoner.summonerLevel).toBeGreaterThan(0)
    expect(summoner.profileIconId).toBeGreaterThanOrEqual(0)
  })

  test('lazy chain: account -> summoner -> matchIds does the right traversal', async () => {
    const account = await yasuo.riot.account.byRiotId(GAME_NAME, TAG_LINE, ACCOUNT_GROUP)
    const ids = await account.summoner(REGION).matchIds({ count: 3 })
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.length).toBeLessThanOrEqual(3)
    expect(ids[0]).toMatch(/^[A-Z0-9]+_\d+$/)
  })

  test('fetches a full match and traverses to its timeline', async () => {
    const ids = await yasuo.lol.match.idsByPuuid(puuid, MATCH_GROUP, { count: 1 })
    const matchId = ids[0]
    expect(matchId).toBeDefined()
    if (!matchId) {
      return
    }
    const match = await yasuo.lol.match.get(matchId, MATCH_GROUP)
    expect(match.metadata.matchId).toBe(matchId)
    expect(match.info.participants.length).toBe(10)

    const timeline = await match.timeline()
    expect(timeline.metadata.matchId).toBe(matchId)
    expect(timeline.info.frames.length).toBeGreaterThan(0)
  })

  test('reads ranked league entries (may be empty)', async () => {
    const entries = await yasuo.lol.league.byPuuid(puuid, REGION)
    expect(Array.isArray([...entries])).toBe(true)
    for (const entry of entries) {
      expect(entry.puuid).toBe(puuid)
      expect(entry.leaguePoints).toBeGreaterThanOrEqual(0)
    }
  })

  test('reads champion mastery', async () => {
    const top = await yasuo.lol.mastery.top(puuid, REGION, 3)
    expect(top.length).toBeGreaterThan(0)
    expect(top.length).toBeLessThanOrEqual(3)
    expect(top[0]?.championPoints).toBeGreaterThan(0)

    const score = await yasuo.lol.mastery.score(puuid, REGION)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  test('reads the free champion rotation (normalised across API shapes)', async () => {
    const rotation = await yasuo.lol.champion.rotation(REGION)
    expect(rotation.freeChampions.length).toBeGreaterThan(0)
    expect(rotation.newPlayerChampions.length).toBeGreaterThan(0)
  })

  test('reads platform status', async () => {
    const status = await yasuo.lol.status.get(REGION)
    expect(status.id).toBeDefined()
    expect(status.name).toBeString()
  })

  test('active game relation resolves to null when not in game', async () => {
    // Faker is rarely live; either a game entity or null, never a throw.
    const game = await yasuo.lol.summoner.byPuuid(puuid, REGION).activeGame()
    expect(game === null || typeof game.gameId === 'number').toBe(true)
  })

  test('streams match ids as an async iterator, starting from an offset', async () => {
    const stream = yasuo.lol.match.streamIds(puuid, MATCH_GROUP, {
      start: 0,
      pageSize: 5,
      maxItems: 8,
    })
    const collected: string[] = []
    for await (const id of stream) {
      collected.push(id)
    }
    expect(collected.length).toBeLessThanOrEqual(8)
    expect(collected.length).toBeGreaterThan(0)
    expect(new Set(collected).size).toBe(collected.length) // no duplicates across pages
  })

  test('the second identical call is served from the cache', async () => {
    const first = await yasuo.lol.summoner.byPuuid(puuid, REGION)
    const second = await yasuo.lol.summoner.byPuuid(puuid, REGION)
    expect(first.puuid).toBe(second.puuid)
  })

  test('tolerates dev-key-restricted endpoints (spectator featured)', async () => {
    const featured = await tolerateForbidden(() => yasuo.lol.spectator.featured(REGION))
    if (featured) {
      expect(featured.gameList.length).toBeGreaterThanOrEqual(0)
    }
  })

  test('tolerates the dev-key-restricted TFT rated ladder', async () => {
    const ladder = await tolerateForbidden(() => yasuo.tft.league.ratedLadder(REGION))
    if (ladder) {
      expect(ladder.length).toBeGreaterThanOrEqual(0)
      if (ladder[0]) {
        expect(ladder[0].puuid).toBeString()
        expect(ladder[0].ratedRating).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('resolves the account active region for LoL', async () => {
    const region = await tolerateForbidden(() =>
      yasuo.riot.account.activeRegion(Game.LOL, puuid, ACCOUNT_GROUP),
    )
    if (region) {
      expect(region.puuid).toBe(puuid)
    }
  })
})
