# yasuo

**A modern, zero-dependency TypeScript client for the Riot Games API** — League of Legends, Teamfight Tactics and the Riot Account API.

> yasuo is the evolution of [twisted](https://github.com/Zzuzzu/twisted). It keeps everything that made twisted pleasant — a single client, typed responses, rate-limit info attached to every result — and rebuilds it around a lazy, chainable, relation-aware API with a proactive rate limiter, a pluggable cache, a leveled logger and async iterators, all with **no runtime dependencies**.

```ts
import { Yasuo, Region, RegionGroup } from 'yasuo'

const yasuo = new Yasuo(process.env.RIOT_API_KEY)

// Resolve an account, then walk its relations — this is ONE request, not two:
const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
const matches = await account.summoner(Region.KR).matchIds({ count: 5 })

console.log(matches)                  // ['KR_1234…', …]
console.log(matches.rateLimits.app)   // rate-limit budget travels with the data
```

---

## Why yasuo?

| | twisted | **yasuo** |
| --- | --- | --- |
| Runtime dependencies | a few | **zero** |
| Rate limiting | reactive (retry on 429) | **proactive + reactive** (paces requests *under* Riot's limits, then retries) |
| Response shape | `{ response, rateLimits }` envelope | rich **entities** with `.meta` / `.rateLimits` and **lazy relations** |
| Chaining | manual (fetch summoner → fetch matches) | `account.summoner(r).matchIds()` — **only the final request runs** |
| Pagination | manual page loops | **async iterators** (`for await`), start from any page |
| Caching | — | pluggable **in-memory / Redis** cache |
| Logging | — | leveled logger (`debug`/`info`/`warn`/`error`), env-driven |
| Magic strings | some | **none** — everything is an enum |
| Module format | CJS | **dual ESM + CJS**, single-file, fully typed |

---

## Install

```bash
bun add yasuo
# or
npm install yasuo
```

yasuo targets Node 18+ / Bun / Deno and ships a single-file dual **ESM + CJS** build with complete type declarations.

## Quick start

```ts
import { Yasuo, Region, RegionGroup } from 'yasuo'

// The key can be passed directly or read from the RIOT_API_KEY env var.
const yasuo = new Yasuo({ key: process.env.RIOT_API_KEY })

// Game-scoped namespaces mirror Riot's own product split:
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
const entries  = await yasuo.lol.league.byPuuid(puuid, Region.KR)
const match    = await yasuo.lol.match.get('KR_1234567890', RegionGroup.ASIA)

const tftMatch = await yasuo.tft.match.get('KR_1234567890', RegionGroup.ASIA)
const account  = await yasuo.riot.account.byRiotId('Faker', 'KR1', RegionGroup.ASIA)
```

## Core concepts

### Namespaces

The client is organised by product, matching Riot's routing model:

- `yasuo.lol.*` — Summoner, League, Champion Mastery, Champion, Match, Spectator, Status, Clash, Challenges
- `yasuo.tft.*` — Summoner, League, Match, Spectator
- `yasuo.riot.account` — the shared Account API (game name / tag line → PUUID)
- `yasuo.dataDragon` — Riot's static data CDN (no key, no rate limits)

### Entities carry their metadata

Every method returns an **entity** (or a `Collection` of them). The DTO fields are on the entity directly, and the response metadata travels *with* the data — no wrapper to unpack:

```ts
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)

summoner.summonerLevel        // typed DTO field, right on the entity
summoner.meta.status          // 200
summoner.rateLimits.app       // [{ limit, intervalSeconds, count }]
summoner.meta.headers         // raw, lower-cased response headers
```

### Lazy relations — the key idea

`byPuuid(...)` returns a **chainable, awaitable reference**. Awaiting it fetches the summoner; calling a *relation* fetches **only** that related resource — the summoner request is skipped entirely:

```ts
// One request (the match list) — the summoner is never fetched:
const ids = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matchIds({ count: 20 })

// Awaiting the ref itself does fetch the summoner:
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
```

Relations know how to route themselves. A summoner on `Region.KR` traverses to their match history on `RegionGroup.ASIA` automatically — you never re-specify the routing:

```ts
const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
const masteries = await account.summoner(Region.KR).topChampionMasteries(5)
const live      = await account.summoner(Region.KR).activeGame()   // CurrentGame | null
const match     = await yasuo.lol.match.get(ids[0], RegionGroup.ASIA)
const timeline  = await match.timeline()                            // ids reused, region derived
```

### No magic strings

Regions, queues, tiers, divisions, match types, challenge levels, HTTP details — all enums:

```ts
import { Region, RegionGroup, RankedQueue, Tier, Division, MatchType } from 'yasuo'

for await (const entry of yasuo.lol.league.streamEntries(
  RankedQueue.SOLO_5x5, Tier.DIAMOND, Division.I, Region.EUW, { startPage: 3 },
)) {
  console.log(entry.puuid, entry.leaguePoints)
}
```

## Rate limiting

The limiter is **proactive**: it reads Riot's `x-app-rate-limit` / `x-method-rate-limit` headers and paces requests *underneath* the advertised limits using sliding windows, per application host and per method — so you avoid `429`s before they happen. When one slips through (a shared key, a service blip), it **reactively** honours `retry-after` with bounded backoff.

```ts
const yasuo = new Yasuo({
  key,
  rateLimit: true,          // default; or an options object, or false to disable
  retry: { maxAttempts: 3 } // reactive retry policy
})
```

See [docs/rate-limiting.md](docs/rate-limiting.md).

## Caching

Opt-in response caching, served before the rate limiter is even consulted. In-memory by default; bring your own store (Redis, Memcached…) via the `CacheStore` interface:

```ts
import { Yasuo, RedisCache } from 'yasuo'

const yasuo = new Yasuo({ key, cache: true })                        // in-memory, 60s TTL
const y2     = new Yasuo({ key, cache: { store: new RedisCache(redis), ttlMs: 30_000 } })
```

See [docs/caching.md](docs/caching.md).

## Logging

A leveled logger driven by config or the `YASUO_LOG_LEVEL` / `LOG_LEVEL` env var (`debug` · `info` · `warn` · `error` · `silent`):

```ts
import { Yasuo, LogLevel } from 'yasuo'

const yasuo = new Yasuo({ key, logLevel: LogLevel.DEBUG })  // or set YASUO_LOG_LEVEL=debug
```

See [docs/logging.md](docs/logging.md).

## Pagination & async iterators

Paginated endpoints return a `Paginator` you can iterate with `for await`, collect with `.toArray()`, peek with `.first()`, or walk page-by-page with `.pages()` — starting from any page/offset:

```ts
for await (const id of yasuo.lol.match.streamIds(puuid, RegionGroup.ASIA, { start: 0, pageSize: 100 })) {
  // …every match in a player's history, paced by the rate limiter
}
```

See [docs/pagination.md](docs/pagination.md).

## Error handling

Every failure is a typed subclass of `ApiError` (itself a `YasuoError`), so you can catch precisely:

```ts
import { NotFoundError, RateLimitError, ForbiddenError } from 'yasuo'

try {
  await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
} catch (err) {
  if (err instanceof NotFoundError) { /* 404 */ }
  else if (err instanceof RateLimitError) { /* 429 — err.rateLimits.retryAfterSeconds */ }
}
```

See [docs/errors.md](docs/errors.md).

## API coverage

**51 endpoints** across every current Riot product:

- **LoL** (33): Summoner · League (+ league-exp) · Champion Mastery · Champion Rotation · Match-V5 · Spectator · Status · Clash · Challenges
- **TFT** (14): Summoner · League (+ rated ladder) · Match · Spectator
- **Riot** (4): Account (by PUUID / by Riot ID) · Active Shard · Active Region
- **Data Dragon**: versions, champions, runes, static reference data

See [docs/endpoints.md](docs/endpoints.md) for the full map.

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture & contribution rules](docs/architecture.md)
- [Entities & lazy relations](docs/entities-and-relations.md)
- [Rate limiting](docs/rate-limiting.md)
- [Caching](docs/caching.md)
- [Logging](docs/logging.md)
- [Pagination](docs/pagination.md)
- [Errors](docs/errors.md)
- [Endpoint coverage](docs/endpoints.md)
- [Migrating from twisted](docs/migrating-from-twisted.md)

## Migrating from twisted

yasuo is a spiritual successor, not a drop-in replacement — the ergonomics are better. The short version: constructor takes a config object, `LolApi`/`TftApi`/`RiotApi` become `yasuo.lol`/`yasuo.tft`/`yasuo.riot`, the `{ response, rateLimits }` envelope becomes an entity with `.meta`/`.rateLimits`, and encrypted-summoner-id lookups give way to PUUIDs. Full mapping in [docs/migrating-from-twisted.md](docs/migrating-from-twisted.md).

## Development

```bash
bun install
bun run typecheck     # tsc --noEmit
bun run lint          # biome check .
bun test test/unit    # unit tests (no network)
bun run test:integration  # live tests (needs RIOT_API_KEY)
bun run build         # single-file ESM + CJS + d.ts
```

Conventions for contributors (folder layout, one-declaration-per-file, enum rules) live in [docs/architecture.md](docs/architecture.md).

## License

[MIT](LICENSE) © justadev-afk
