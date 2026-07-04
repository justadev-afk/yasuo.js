# Entities & lazy relations

Every method on the client returns an **entity** (or a `Collection` of them) rather than a bare JSON payload. An entity is a thin, typed wrapper that keeps the data and its response metadata together, and puts every related resource one method call away. This is yasuo's replacement for twisted's `{ response, rateLimits }` envelope — nothing to unpack, nothing to thread through.

```ts
import { Yasuo, Region, RegionGroup } from 'yasuo'

const yasuo = new Yasuo({ key: process.env.RIOT_API_KEY })
```

## What an entity is

An entity does two things at once.

**1. It exposes the DTO's fields directly.** The raw Riot payload is copied onto the instance, so you read wire fields straight off the entity — fully typed, no `.data` hop:

```ts
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)

summoner.puuid            // string  — DTO field, right on the entity
summoner.summonerLevel    // number  — same
summoner.revisionDate     // number  — same
```

**2. It carries the response metadata.** Every entity has a `.meta` of type `ResponseMeta`, plus a `.rateLimits` shortcut for the most commonly-needed slice of it:

```ts
summoner.meta.status        // 200
summoner.meta.url           // final request URL, query string included
summoner.meta.headers       // Readonly<Record<string, string>> — raw, lower-cased
summoner.meta.rateLimits    // full RateLimits object
summoner.rateLimits         // === summoner.meta.rateLimits
```

`ResponseMeta` and `RateLimits` are plain read-only shapes (`src/dto/common.dto.ts`):

```ts
interface ResponseMeta {
  readonly status: number                            // HTTP status code
  readonly rateLimits: RateLimits                     // parsed from the headers
  readonly url: string                                // final URL, query included
  readonly headers: Readonly<Record<string, string>> // raw headers, lower-cased
}

interface RateLimits {
  readonly type: RateLimitType | null      // which limiter enforced a 429, else null
  readonly retryAfterSeconds: number | null // from `retry-after`, else null
  readonly app: readonly RateLimitWindow[]  // from `x-app-rate-limit`
  readonly method: readonly RateLimitWindow[] // from `x-method-rate-limit`
  readonly edgeTraceId: string | null       // from `x-riot-edge-trace-id`
}

interface RateLimitWindow {
  readonly limit: number            // requests allowed per window
  readonly intervalSeconds: number  // window length, in seconds
  readonly count?: number           // requests already used, when Riot reports it
}
```

The rate-limit budget therefore travels *with* the data — no side channel, no second return value:

```ts
console.log(summoner.rateLimits.app)  // [{ limit: 100, intervalSeconds: 120, count: 3 }, …]
```

## Collections

List endpoints return a `Collection<T>`. It **extends `Array<T>`**, so everything you already do with an array works — indexing, `for..of`, spread, `.length`, `.map`, `.filter` — *and* it carries the same `.meta` / `.rateLimits` as an entity:

```ts
const entries = await yasuo.lol.league.byPuuid(puuid, Region.KR) // Collection<LeagueEntryEntity>

entries.length                       // array behaviour
entries[0].leaguePoints              // indexing
const [solo, ...rest] = entries      // spread / destructuring
const points = entries.map((e) => e.leaguePoints) // map / filter / etc.

entries.rateLimits.method            // metadata rides along on the collection itself
entries.meta.status                  // 200
```

> **One caveat:** methods that build a *new* array (`map`, `filter`, `slice`) return a plain `Array`, not a `Collection` — so the derived result has no `.meta`. Read `.meta` / `.rateLimits` off the original collection before transforming it.

## Lazy references — the key idea

`yasuo.lol.summoner.byPuuid(puuid, region)` does **not** return a `Promise<SummonerEntity>`. It returns a `SummonerRef` — a lazy, chainable handle that is **thenable** (`implements PromiseLike<SummonerEntity>`). That single fact powers the whole ergonomic:

```ts
// Awaiting the ref fetches the summoner:
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)

// Calling a RELATION fetches ONLY the related resource — the summoner is never requested.
// This is ONE request (the match list), not two:
const ids = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matchIds({ count: 20 })
```

**Why it's a single request:** the ref already holds the `puuid` and the `region` you passed in. A relation like `matchIds()` doesn't need the summoner entity to do its job — it has the PUUID directly — so it delegates straight to the right namespace (`yasuo.lol.match.idsByPuuid(...)`), deriving the routing along the way. The summoner request is skipped entirely because it was never needed.

### Every relation on `SummonerRef`

All of these are lazy: each triggers exactly one request for *its* resource (or zero — `streamMatchIds` / `streamMatches` return an async iterator that paginates on demand).

| Method | Returns | What it fetches |
| --- | --- | --- |
| `account()` | `Promise<AccountEntity>` | the underlying Riot account (game name + tag line) |
| `leagueEntries()` | `Promise<Collection<LeagueEntryEntity>>` | ranked entries in every queue |
| `championMasteries()` | `Promise<Collection<ChampionMasteryEntity>>` | mastery, one entry per champion played |
| `topChampionMasteries(count?)` | `Promise<Collection<ChampionMasteryEntity>>` | the highest `count` masteries |
| `championMastery(championId)` | `Promise<ChampionMasteryEntity>` | mastery of a single champion |
| `masteryScore()` | `Promise<number>` | total champion mastery score |
| `matchIds(query?)` | `Promise<Collection<string>>` | ids of recent matches (filterable) |
| `matches(query?)` | `Promise<MatchEntity[]>` | recent matches, fetched in full |
| `streamMatchIds(options?)` | `Paginator<string>` | match ids, streamed page by page |
| `streamMatches(options?)` | `Paginator<MatchEntity>` | full match entities, streamed page by page |
| `activeGame()` | `Promise<CurrentGameEntity \| null>` | the live game, or `null` if not in one |
| `clashPlayers()` | `Promise<Collection<ClashPlayerEntity>>` | active Clash registrations |
| `challenges()` | `Promise<PlayerChallengesEntity>` | challenge progress |

A materialised `SummonerEntity` mirrors the same relations, so you can await the summoner first and still traverse — each relation is still one request (the summoner is already in hand):

```ts
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
const ranked   = await summoner.leagueEntries()
const history  = await summoner.matches({ count: 5 })
```

## Chaining across entities

Relations compose across entity types, and they **derive their own routing** — you never re-specify a region once you've named it. The client knows that platform regions and regional routing values map onto each other, so a traversal picks the right one automatically.

```ts
// Account → Summoner → matches. `.summoner(Region.KR)` returns a SummonerRef,
// so this whole line runs a single request (the match list):
const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
const matches = await account.summoner(Region.KR).matches({ count: 5 })
```

Three routing derivations do the heavy lifting:

- **`Region.KR` → `RegionGroup.ASIA` for match history.** `matchIds()` / `matches()` on a `KR` summoner traverse to the regional Match-V5 host automatically — you passed `Region.KR` once and never re-specify `RegionGroup.ASIA`.
- **`Region` → account routing for `account()`.** The ref maps the platform region to the account API's routing group for you.
- **`platformId` → `Region` for `match.summoners()`.** A match doesn't carry a region argument — it reads `info.platformId` off its own payload and resolves the platform region from it.

`MatchEntity` shows the same pattern from the match side:

```ts
const match     = await yasuo.lol.match.get(matches[0].id, RegionGroup.ASIA)

match.id                       // getter → metadata.matchId
match.winningTeam()            // MatchTeamDTO | null — computed locally, no request
const timeline  = await match.timeline()   // ids reused, region-group derived from context
const summoners = await match.summoners()  // Region derived from info.platformId
```

The account entity itself is the entry point into both games:

```ts
import { Game } from 'yasuo'

const account = await yasuo.riot.account.byRiotId('Faker', 'KR1', RegionGroup.ASIA)
account.summoner(Region.KR)        // SummonerRef    (LoL, chainable)
account.tftSummoner(Region.KR)     // TftSummonerRef (TFT, chainable)
await account.activeRegion(Game.LOL)  // AccountRegionEntity
await account.activeShard(Game.LOL)   // ActiveShardEntity
```

## How it works under the hood

Entities use the **interface + class declaration-merging** pattern to expose DTO fields with full types but no boilerplate:

```ts
// The empty interface merges the DTO's fields into the entity's type…
export interface SummonerEntity extends SummonerDTO {}

// …and the class supplies the behaviour. The constructor does `Object.assign(this, data)`,
// so the merged fields actually exist at runtime.
export class SummonerEntity extends Entity<SummonerDTO> {
  // relation methods only — the DTO fields come from the merge above
}
```

`Entity<TData>` (the abstract base) copies the payload onto the instance, stores `.meta`, exposes the `.rateLimits` getter, and holds a protected `EntityContext` — the client reference plus the originating `region` / `regionGroup` that every lazy relation reads to route its follow-up request. This is why entities need no arguments to traverse: the context remembers where they came from.

This pattern is the reason `noUnsafeDeclarationMerging` and `noEmptyInterface` are disabled in `biome.json`. The full binding rule — one declaration per file, DTOs mirror the wire, entities own the ergonomics — lives in [architecture.md](./architecture.md).
