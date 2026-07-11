/**
 * Compile-checked usage examples for yasuo.
 *
 * Not meant to run — it exists so `bun run typecheck` proves every pattern in
 * the README and docs compiles against the public API. If an example breaks,
 * the docs are wrong — fix both.
 */
import {
  ApiError,
  Division,
  type HttpMiddleware,
  KVCache,
  type KVNamespaceLike,
  LogLevel,
  MatchType,
  NotFoundError,
  RankedQueue,
  RedisCache,
  type RedisClientLike,
  Region,
  RegionGroup,
  Shard,
  Tier,
  TournamentMap,
  TournamentPickType,
  TournamentRegion,
  TournamentSpectatorType,
  ValQueue,
  Yasuo,
} from '../src/index'

// --- Construction ------------------------------------------------------------

// Proactive rate limiting is OFF by default (reactive 429/503 retries stay on).
const fromString = new Yasuo('RGAPI-xxxxxxxx')
const yasuo = new Yasuo({
  key: process.env.RIOT_API_KEY,
  rateLimit: true, // opt in to proactive pacing
  retry: { maxAttempts: 3 },
  cache: true,
  logLevel: LogLevel.INFO,
  concurrency: 20,
})
void fromString

// --- Per-product API keys ----------------------------------------------------

// Riot recommends a separate product (and key) per game. Map each product to
// its key and yasuo signs every request with the right one; distinct keys get
// independent rate-limit budgets. Any product without an entry falls back to the
// shared `key`, then to RIOT_API_KEY / RIOT_<GAME>_API_KEY env vars.
const multiKey = new Yasuo({
  keys: {
    lol: process.env.RIOT_LOL_KEY,
    tft: process.env.RIOT_TFT_KEY,
    val: process.env.RIOT_VAL_KEY,
    lor: process.env.RIOT_LOR_KEY,
  },
  key: process.env.RIOT_API_KEY, // shared fallback (e.g. for the Account API)
})
void multiKey

// --- The result IS the entity: .error + .http live on it ---------------------

async function resultShape(): Promise<void> {
  const summoner = await yasuo.lol.summoner.byPuuid('puuid', Region.KR).execute()

  if (summoner.error) {
    // `error` is the original ApiError (status + body + rateLimits + response).
    console.error(summoner.error.status, summoner.error.body)
    return
  }
  // DTO fields are right on the entity; HTTP context is grouped under `.http`.
  console.log(summoner.summonerLevel, summoner.http.status, summoner.http.rateLimits.app)

  // Opt into throwing on failure:
  const strict = await yasuo.lol.summoner.byPuuid('puuid', Region.KR).execute({ throw: true })
  console.log(strict.summonerLevel)

  // Or get exactly what Riot returned, typed `unknown`:
  const raw = await yasuo.lol.summoner.byPuuid('puuid', Region.KR).execute({ raw: true })
  console.log(raw)

  // ...or supply the shape you expect as a type argument — no cast needed:
  const typed = await yasuo.lol.summoner
    .byPuuid('puuid', Region.KR)
    .execute<{ puuid: string; summonerLevel: number }>({ raw: true })
  console.log(typed.summonerLevel)

  // Per-call cache control (scoped to this call's namespace):
  // force a fresh request but still refresh the cached entry...
  const fresh = await yasuo.lol.summoner.byPuuid('puuid', Region.KR).execute({ cache: false })
  console.log(fresh.summonerLevel)
  // ...or cache this one immutable match for a full day:
  const longLived = await yasuo.lol.match
    .get('KR_123', RegionGroup.ASIA)
    .execute({ cache: { ttlMs: 86_400_000 } })
  console.log(longLived.metadata.matchId)
}

// --- Account → summoner → relations (single requests) ------------------------

async function walkAccount(): Promise<void> {
  const account = await yasuo.riot.account
    .byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
    .execute()
  if (account.error) {
    return
  }

  // Lazy ref — no request until a terminal .execute() runs a relation.
  const ref = account.summoner(Region.KR)

  const matches = await ref.matches({ count: 20, type: MatchType.RANKED }).execute()
  const masteries = await ref.topChampionMasteries(5).execute()
  const live = await ref.activeGame().execute() // CurrentGameEntity | null
  console.log(matches.length, masteries.length, live?.gameId ?? 'not in game')

  // Scalars are boxed: read `.value`.
  const score = await ref.masteryScore().execute()
  console.log(score.value ?? 0)

  // Match → timeline (ids reused, routing derived automatically).
  const ids = await ref.matchIds({ count: 1 }).execute()
  const first = ids[0]
  if (first) {
    const match = await yasuo.lol.match.get(first, RegionGroup.ASIA).execute()
    if (!match.error) {
      const timeline = await match.timeline().execute()
      console.log(match.info.gameDuration, timeline.info?.frames.length)
    }
  }
}

// --- League + async-iterator pagination --------------------------------------

async function streamLadder(): Promise<void> {
  // Iterators throw on failure (idiomatic for `for await`).
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
  const summoner = await yasuo.tft.summoner.byPuuid('puuid', Region.KR).execute()
  const match = await yasuo.tft.match.get('KR_123', RegionGroup.ASIA).execute()
  console.log(summoner.puuid, match.metadata?.match_id)
}

// --- VALORANT (routes by Shard) ----------------------------------------------

async function valorant(): Promise<void> {
  const content = await yasuo.val.content.get(Shard.NA).execute()
  if (!content.error) {
    console.log(content.version, content.activeAct()?.name)
  }

  // A matchlist is relation-aware: fetch a full match on the same shard.
  const list = await yasuo.val.match.matchlist('puuid', Shard.NA).execute()
  const firstId = list.matchIds()[0]
  if (firstId) {
    const match = await list.match(firstId).execute()
    console.log(match.winningTeam()?.teamId)
  }

  const recent = await yasuo.val.match.recent(ValQueue.COMPETITIVE, Shard.NA).execute()
  const board = await yasuo.val.ranked.leaderboard('act-id', Shard.NA, { size: 10 }).execute()
  const status = await yasuo.val.status.get(Shard.NA).execute()
  console.log(recent.matchIds.length, board.top(3).length, status.hasActiveIssues())
}

// --- Legends of Runeterra (routes by RegionGroup) ----------------------------

async function legendsOfRuneterra(): Promise<void> {
  const matches = await yasuo.lor.match.byPuuid('puuid', RegionGroup.AMERICAS).execute()
  const board = await yasuo.lor.ranked.leaderboard(RegionGroup.AMERICAS).execute()
  const status = await yasuo.lor.status.get(RegionGroup.AMERICAS).execute()
  console.log(matches.length, board.top(3).length, status.hasActiveIssues())
}

// --- Tournament-V5 (POST flow; use `tournamentStub` without a production key) -

async function tournament(): Promise<void> {
  const stub = yasuo.lol.tournamentStub
  const provider = await stub
    .registerProvider(
      { region: TournamentRegion.NA, url: 'https://cb.example' },
      RegionGroup.AMERICAS,
    )
    .execute()
  if (provider.error || provider.value === null) {
    return
  }
  const tournamentId = await stub
    .registerTournament({ providerId: provider.value, name: 'My Cup' }, RegionGroup.AMERICAS)
    .execute()
  if (tournamentId.error || tournamentId.value === null) {
    return
  }
  const codes = await stub
    .createCodes(
      {
        mapType: TournamentMap.SUMMONERS_RIFT,
        pickType: TournamentPickType.TOURNAMENT_DRAFT,
        spectatorType: TournamentSpectatorType.ALL,
        teamSize: 5,
      },
      RegionGroup.AMERICAS,
      { tournamentId: tournamentId.value, count: 2 },
    )
    .execute()
  console.log([...codes])
}

// --- Data Dragon (no key, no rate limit — returns raw payloads) --------------

async function staticData(): Promise<void> {
  const versions = await yasuo.dataDragon.versions()
  const champions = await yasuo.dataDragon.champions()
  console.log(versions[0], Object.keys(champions.data).length)
}

// --- Per-namespace cache tuning ----------------------------------------------

function withPerNamespaceCache(): Yasuo {
  // Keep every namespace's tuned default TTL, but override per product / service /
  // method (keys autocomplete from the client). `prefix` composes down the tree;
  // more specific scopes win. Not-found (404) responses are negative-cached too.
  return new Yasuo({
    key: 'RGAPI-x',
    cache: {
      prefix: 'yjs:',
      namespaces: {
        lol: {
          prefix: 'lol:',
          match: { ttlMs: 86_400_000, prefix: 'm:' }, // immutable — cache a full day
          summoner: { byPuuid: { ttlMs: 600_000 } }, // per-method override
          spectator: { enabled: false }, // never cache live games
        },
        riot: {
          account: { negativeTtlMs: 3_600_000 }, // cache "no such Riot ID" for an hour
        },
      },
    },
  })
}

// --- Caching with a custom Redis-compatible client ---------------------------

function withRedis(redis: RedisClientLike): Yasuo {
  return new Yasuo({ key: 'RGAPI-x', cache: { store: new RedisCache(redis), ttlMs: 30_000 } })
}

// --- Caching on Cloudflare Workers with a KV namespace binding ----------------

function withCloudflareKV(kv: KVNamespaceLike): Yasuo {
  // Explicit wrapper, or pass the raw binding as `store` and let yasuo wrap it.
  const explicit = new Yasuo({ key: 'RGAPI-x', cache: { store: new KVCache(kv), ttlMs: 300_000 } })
  const raw = new Yasuo({ key: 'RGAPI-x', cache: { store: kv } }) // auto-wrapped in KVCache
  void raw
  return explicit
}

// --- Custom HTTP client + stackable middleware (axios-style) ------------------

function withMiddleware(): Yasuo {
  const timing: HttpMiddleware = async (request, next, { endpointId }) => {
    const started = Date.now()
    const response = await next(request)
    console.log(`${endpointId} ${response.status} in ${Date.now() - started}ms`)
    return response
  }
  const client = new Yasuo({ key: 'RGAPI-x', middleware: [timing] })
  // Global middleware wraps per-service middleware, and both stack in order.
  client.use((request, next) =>
    next({ ...request, headers: { ...request.headers, 'x-app': 'bot' } }),
  )
  client.lol.match.use((request, next) => {
    console.debug('match request', request.url)
    return next(request)
  })
  return client
}

// --- Typed error handling ----------------------------------------------------

async function safeLookup(): Promise<void> {
  const summoner = await yasuo.lol.summoner.byPuuid('puuid', Region.KR).execute()
  if (summoner.error instanceof NotFoundError) {
    console.warn('no such summoner')
  } else if (summoner.error instanceof ApiError) {
    const { status, url, rateLimits } = summoner.error
    console.error('riot error', status, url, rateLimits.retryAfterSeconds)
  } else {
    console.log(summoner.summonerLevel)
  }
}

export {
  legendsOfRuneterra,
  resultShape,
  safeLookup,
  staticData,
  streamLadder,
  tft,
  tournament,
  valorant,
  walkAccount,
  withCloudflareKV,
  withMiddleware,
  withPerNamespaceCache,
  withRedis,
}
