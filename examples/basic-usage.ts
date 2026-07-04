/**
 * Compile-checked usage examples for yasuo.
 *
 * This file is **not** meant to run (it makes no assumptions about a live key);
 * it exists so `bun run typecheck` proves that every pattern shown in the README
 * and docs actually compiles against the public API. If an example here breaks,
 * the docs are wrong — fix both.
 */
import {
  ApiError,
  Division,
  LogLevel,
  MatchType,
  NotFoundError,
  RankedQueue,
  RateLimitError,
  RedisCache,
  type RedisClientLike,
  Region,
  RegionGroup,
  Tier,
  Yasuo,
} from '../src/index'

// --- Construction ------------------------------------------------------------

// From a bare key string, or a config object, or the RIOT_API_KEY env var.
const fromString = new Yasuo('RGAPI-xxxxxxxx')
const yasuo = new Yasuo({
  key: process.env.RIOT_API_KEY,
  rateLimit: true,
  retry: { maxAttempts: 3 },
  cache: true,
  logLevel: LogLevel.INFO,
  concurrency: 20,
})
void fromString

// --- Account → summoner → relations (single requests) ------------------------

async function walkAccount(): Promise<void> {
  const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
  const puuid = account.puuid

  // Awaiting the ref fetches the summoner…
  const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
  console.log(summoner.summonerLevel, summoner.meta.status, summoner.rateLimits.app)

  // …but a relation fetches ONLY that resource — no summoner request.
  const ids = await account.summoner(Region.KR).matchIds({ count: 20, type: MatchType.RANKED })
  const masteries = await account.summoner(Region.KR).topChampionMasteries(5)
  const live = await account.summoner(Region.KR).activeGame() // CurrentGameEntity | null
  console.log(ids.length, masteries.length, live?.gameId ?? 'not in game')

  // Match → timeline (ids reused, routing derived automatically).
  const first = ids[0]
  if (first) {
    const match = await yasuo.lol.match.get(first, RegionGroup.ASIA)
    const timeline = await match.timeline()
    console.log(match.info.gameDuration, timeline.info.frames.length)
  }
}

// --- League + async-iterator pagination --------------------------------------

async function streamLadder(): Promise<void> {
  for await (const entry of yasuo.lol.league.streamEntries(
    RankedQueue.SOLO_5x5,
    Tier.DIAMOND,
    Division.I,
    Region.EUW,
    { startPage: 3, maxItems: 250 },
  )) {
    console.log(entry.puuid, entry.leaguePoints)
  }

  const someIds = await yasuo.lol.match
    .streamIds('puuid', RegionGroup.ASIA, { start: 0, pageSize: 100 })
    .toArray(50)
  console.log(someIds.length)
}

// --- TFT ---------------------------------------------------------------------

async function tft(): Promise<void> {
  const summoner = await yasuo.tft.summoner.byPuuid('puuid', Region.KR)
  const match = await yasuo.tft.match.get('KR_123', RegionGroup.ASIA)
  console.log(summoner.puuid, match.metadata.match_id)
}

// --- Data Dragon (no key, no rate limit) -------------------------------------

async function staticData(): Promise<void> {
  const versions = await yasuo.dataDragon.versions()
  const champions = await yasuo.dataDragon.champions()
  console.log(versions[0], Object.keys(champions.data).length)
}

// --- Caching with a custom Redis-compatible client ---------------------------

function withRedis(redis: RedisClientLike): Yasuo {
  return new Yasuo({ key: 'RGAPI-x', cache: { store: new RedisCache(redis), ttlMs: 30_000 } })
}

// --- Typed error handling ----------------------------------------------------

async function safeLookup(): Promise<void> {
  try {
    await yasuo.lol.summoner.byPuuid('puuid', Region.KR)
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.warn('no such summoner')
    } else if (err instanceof RateLimitError) {
      console.warn('rate limited; retry after', err.rateLimits.retryAfterSeconds)
    } else if (err instanceof ApiError) {
      console.error('riot error', err.status, err.url)
    }
  }
}

export { walkAccount, streamLadder, tft, staticData, withRedis, safeLookup }
