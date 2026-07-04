# Migrating from twisted

yasuo is the evolution of [twisted](https://github.com/Zzuzzu/twisted). It keeps
everything that made twisted pleasant — a single client, fully typed responses,
rate-limit info attached to every result — and rebuilds the surface around lazy,
chainable, relation-aware **entities**, a proactive rate limiter, a pluggable
cache, a leveled logger and async iterators, all with **zero runtime
dependencies**.

> **This is a spiritual successor, not a drop-in replacement.** The method names,
> the construction, the response shape and the routing types all changed on
> purpose — the ergonomics are the whole point. This guide maps every twisted
> concept to its yasuo equivalent so you can port a codebase mechanically.

## Why the churn is worth it

| | twisted | **yasuo** |
| --- | --- | --- |
| Runtime dependencies | a few | **zero** |
| Rate limiting | reactive (retry on 429) | **proactive + reactive** (paces requests *under* Riot's limits, then retries) |
| Response shape | `{ response, rateLimits }` envelope | rich **entities** with `.meta` / `.rateLimits` and **lazy relations** |
| Chaining | manual (fetch summoner → fetch matches) | `account.summoner(r).matchIds()` — **only the final request runs** |
| Pagination | manual page loops | **async iterators** (`for await`), start from any page |
| Caching | — | pluggable **in-memory / Redis** cache |
| Logging | `debug: { logTime, logUrls }` | leveled logger (`debug`/`info`/`warn`/`error`), env-driven |
| Magic strings | some | **none** — everything is an enum |
| Module format | CJS | **dual ESM + CJS**, single-file, fully typed |

## 1. Construction: three clients become one

twisted gave you a class per product; yasuo gives you a single client whose
game-scoped namespaces mirror Riot's own product split.

```ts
// BEFORE — twisted
import { LolApi, TftApi, RiotApi } from 'twisted'

const lol  = new LolApi({ key: process.env.RIOT_API_KEY, rateLimitRetry: true })
const tft  = new TftApi(process.env.RIOT_API_KEY)
const riot = new RiotApi(process.env.RIOT_API_KEY)
```

```ts
// AFTER — yasuo
import { Yasuo } from 'yasuo'

const yasuo = new Yasuo({ key: process.env.RIOT_API_KEY })
// yasuo.lol   — everything LolApi did
// yasuo.tft   — everything TftApi did
// yasuo.riot  — everything RiotApi did
// yasuo.dataDragon — the static-data CDN
```

Like twisted, the key can be omitted to read `RIOT_API_KEY` from the environment,
or passed as a bare string (`new Yasuo(process.env.RIOT_API_KEY)`). Retries are on
by default — there is no `rateLimitRetry` flag to set.

## 2. Regions: `Constants` becomes two enums

twisted exposed routing values through `Constants.Regions` /
`Constants.RegionGroups`. yasuo promotes those to top-level enums with the
community-facing short codes as keys.

```ts
// BEFORE
import { Constants } from 'twisted'
Constants.Regions.KOREA          // platform region
Constants.RegionGroups.EUROPE    // regional routing value
```

```ts
// AFTER
import { Region, RegionGroup } from 'yasuo'
Region.KR                        // platform region
RegionGroup.EUROPE               // regional routing value
```

Common mappings:

| twisted | yasuo |
| --- | --- |
| `Constants.Regions.KOREA` | `Region.KR` |
| `Constants.Regions.EU_WEST` | `Region.EUW` |
| `Constants.Regions.EU_EAST` | `Region.EUNE` |
| `Constants.Regions.AMERICA_NORTH` | `Region.NA` |
| `Constants.Regions.BRAZIL` | `Region.BR` |
| `Constants.Regions.JAPAN` | `Region.JP` |
| `Constants.Regions.OCEANIA` | `Region.OCE` |
| `Constants.RegionGroups.AMERICAS` | `RegionGroup.AMERICAS` |
| `Constants.RegionGroups.ASIA` | `RegionGroup.ASIA` |
| `Constants.RegionGroups.EUROPE` | `RegionGroup.EUROPE` |
| `Constants.RegionGroups.SEA` | `RegionGroup.SEA` |

The underlying wire values are identical (`Region.KR === 'KR'`,
`Region.EUW === 'EUW1'`), so nothing changes at the HTTP layer — only the names.

## 3. Response shape: unwrap the envelope

twisted resolved every call to an `{ response, rateLimits }` envelope you had to
destructure. In yasuo the DTO fields live **directly on the entity**, and the
metadata travels *with* the data on `.meta` / `.rateLimits` — no unwrapping.

```ts
// BEFORE — twisted
const { response, rateLimits } = await lol.Summoner.getByPUUID(puuid, Constants.Regions.KOREA)
console.log(response.summonerLevel)
console.log(rateLimits.AppRateLimit)
```

```ts
// AFTER — yasuo
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
console.log(summoner.summonerLevel)     // DTO field, right on the entity
console.log(summoner.rateLimits.app)    // [{ limit, intervalSeconds, count }]
console.log(summoner.meta.status)       // 200
console.log(summoner.meta.headers)      // raw, lower-cased response headers
```

List endpoints return a `Collection` — an array-like you can `map`/`filter`/spread,
which *also* carries `.meta` and `.rateLimits`.

## 4. Method mapping

| twisted | yasuo | Notes |
| --- | --- | --- |
| `lol.Summoner.getByPUUID(puuid, region)` | `yasuo.lol.summoner.byPuuid(puuid, region)` | returns a lazy `SummonerRef` |
| `lol.Summoner.getByName(name, region)` | — | **removed by Riot**; see gotchas |
| `lol.Summoner.getBySummonerId(id, region)` | `yasuo.lol.summoner.byId(id, region)` | deprecated by Riot; prefer PUUID |
| `lol.League.byPUUID(puuid, region)` | `yasuo.lol.league.byPuuid(puuid, region)` | `Collection<LeagueEntryEntity>` |
| `lol.League.get(summonerId, region)` | `yasuo.lol.league.bySummonerId(id, region)` | deprecated by Riot; prefer PUUID |
| `lol.MatchV5.list(puuid, group, { count })` | `yasuo.lol.match.idsByPuuid(puuid, group, { count })` | `Collection<string>` |
| `lol.MatchV5.get(matchId, group)` | `yasuo.lol.match.get(matchId, group)` | `MatchEntity` |
| `lol.MatchV5.timeline(matchId, group)` | `yasuo.lol.match.timeline(matchId, group)` | or `match.timeline()` |
| `tft.Match.get(matchId, group)` | `yasuo.tft.match.get(matchId, group)` | |
| `riot.Account.getByRiotId(name, tag, group)` | `yasuo.riot.account.byRiotId(name, tag, group)` | `AccountEntity` |
| `riot.Account.getByPUUID(puuid, group)` | `yasuo.riot.account.byPuuid(puuid, group)` | |
| `riot.Account.getActiveRegion(puuid, game, group)` | `yasuo.riot.account.activeRegion(game, puuid, group)` | note the argument order |

Notice the shift to **PUUID-first**. Riot has deprecated encrypted-summoner-id and
account-id lookups; yasuo keeps `byId` / `bySummonerId` for legacy data but marks
them `@deprecated`, and every relation routes by PUUID.

## 5. Superpowers you get for free

### Lazy relations — chain in a single request

`byPuuid(...)` returns a chainable, awaitable reference. Awaiting it fetches the
summoner; calling a *relation* fetches **only** that resource — the summoner call
is skipped, and the routing is derived for you.

```ts
// BEFORE — twisted: two round-trips, manual region math
const { response: summoner } = await lol.Summoner.getByPUUID(puuid, Constants.Regions.KOREA)
const { response: ids } = await lol.MatchV5.list(puuid, Constants.RegionGroups.ASIA, { count: 20 })
```

```ts
// AFTER — yasuo: ONE request; Region.KR → RegionGroup.ASIA is automatic
const ids = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matchIds({ count: 20 })
```

### Async-iterator pagination

```ts
// Every match in a player's history, paced by the rate limiter — no page loop:
for await (const id of yasuo.lol.match.streamIds(puuid, RegionGroup.ASIA, { pageSize: 100 })) {
  // …
}
```

### Opt-in cache

```ts
import { Yasuo, RedisCache } from 'yasuo'

const yasuo = new Yasuo({ key, cache: true })                      // in-memory, 60s TTL
const y2    = new Yasuo({ key, cache: { store: new RedisCache(redis), ttlMs: 30_000 } })
```

### Leveled logger

```ts
import { Yasuo, LogLevel } from 'yasuo'

const yasuo = new Yasuo({ key, logLevel: LogLevel.DEBUG })  // or env YASUO_LOG_LEVEL=debug
```

This replaces twisted's `debug: { logTime, logUrls, logRatelimits }` toggles.

### Zero dependencies

Nothing else lands in your `node_modules`. yasuo targets Node 18+ / Bun / Deno and
ships a single-file dual **ESM + CJS** build with complete type declarations.

## 6. Gotchas

- **Summoner-by-name is gone.** Riot removed the endpoint, so twisted's
  `Summoner.getByName` has no equivalent. Resolve a Riot ID to a PUUID first, then
  chain:

  ```ts
  const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
  const summoner = await account.summoner(Region.KR)
  ```

- **`Region` vs `RegionGroup` are not interchangeable.** Platform APIs (Summoner,
  League, Mastery, Spectator, Status, Clash) take a `Region`; cross-region APIs
  (Match-V5, TFT Match, Account) take a `RegionGroup`. The types enforce it — just
  as twisted's `Regions` / `RegionGroups` generics did — so a wrong routing value
  is a compile error, not a 404.

- **Rate limiting is proactive by default.** twisted only reacted to a `429`;
  yasuo reads Riot's rate-limit headers and paces requests *underneath* the
  advertised limits, then still honours `retry-after` if one slips through. You
  can tune or disable it with `new Yasuo({ key, rateLimit: false })`.

- **Errors are typed subclasses.** twisted's `RateLimitError` / `GenericError`
  become a `YasuoError` hierarchy:

  ```ts
  import { NotFoundError, RateLimitError, ForbiddenError } from 'yasuo'

  try {
    await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
  } catch (err) {
    if (err instanceof NotFoundError) { /* 404 */ }
    else if (err instanceof RateLimitError) { /* err.rateLimits.retryAfterSeconds */ }
  }
  ```

## See also

- [Getting started](getting-started.md)
- [Entities & lazy relations](entities-and-relations.md)
- [Rate limiting](rate-limiting.md)
- [Pagination](pagination.md)
- [Errors](errors.md)
