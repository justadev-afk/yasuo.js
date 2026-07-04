# Architecture & contribution rules

This document is the source of truth for **how yasuo is organised and why**. It exists so the codebase stays consistent as it grows — whether the next change is made by a human or an agent. Treat the rules here as binding.

## Guiding principles

1. **Zero runtime dependencies.** Nothing in `dependencies`, ever. If you need a utility, write a small one under `core/util`. Dev dependencies (Biome, tsup, TypeScript, `@types/bun`) are fine.
2. **No magic strings or numbers.** Every value that Riot defines — regions, queues, tiers, HTTP headers, statuses, hosts — is an `enum` under `src/enums`. Reference the enum, never a literal.
3. **One declaration per file.** A file exports at most **one class**, or a small set of closely-related **functions**, or a cohesive group of **types**. Splitting keeps files small, diffs focused, and tree-shaking effective.
4. **DTOs mirror the wire; entities are the ergonomics.** Raw payload shapes live in `src/dto` and match Riot's JSON exactly (including snake_case where Riot uses it). Everything the *user* touches is an entity that wraps a DTO and adds relations + metadata.
5. **The wire is the source of truth.** Riot's published docs drift from the live API. When they disagree, the live response wins — type it as observed, keep the legacy shape optional, and expose a normalised accessor on the entity (see `ChampionRotationEntity` for the pattern).
6. **Everything is documented.** Every exported class, method, function, interface and enum has a JSDoc block. Public methods document their params and, where useful, an `@example`.

## Folder layout

```
src/
├── index.ts            Public barrel — the only entry point bundled for npm.
│
├── enums/              All enums. No magic strings live outside this folder.
│   ├── region.ts       Region, RegionGroup, AccountRegionGroup + routing helpers.
│   ├── game.ts         Game path segments (lol / tft / riot).
│   ├── ranked.ts       RankedQueue, Tier, Division.
│   ├── match.ts        MatchType.
│   ├── challenge.ts    Challenge levels/categories.
│   ├── clash.ts        Clash positions/roles/states.
│   ├── http.ts         HttpMethod, HttpStatus, HttpHeader (values lower-cased).
│   ├── rate-limit.ts   RateLimitType, RateLimitScope.
│   ├── data-dragon.ts  Data Dragon CDN hosts.
│   └── index.ts        Barrel.
│
├── dto/                Wire-shape interfaces. Named `*DTO`, fields `readonly`.
│   ├── common.dto.ts   RateLimits, RateLimitWindow, ResponseMeta.
│   ├── lol/  riot/  tft/  data-dragon/   One file per resource group.
│   └── index.ts        Barrel.
│
├── errors/             Error taxonomy. One class per file.
│   ├── yasuo-error.ts        Base class (all yasuo errors).
│   ├── api-error.ts          Base for HTTP errors + ApiErrorInit.
│   ├── *-error.ts            Unauthorized / Forbidden / NotFound / RateLimit / ServiceUnavailable / ApiKeyMissing.
│   ├── api-error-factory.ts  apiErrorFromStatus(): status → most specific subclass.
│   └── index.ts              Barrel.
│
├── core/               Transport & infrastructure. No Riot domain knowledge here.
│   ├── http/           HttpClient interface + FetchHttpClient.
│   ├── rate-limit/     SlidingWindow → RateLimitBucket → RateLimiter, header parsing.
│   ├── cache/          CacheStore interface, MemoryCache, RedisCache.
│   ├── pagination/     Paginator (async-iterable) + Page.
│   ├── request/        RequestExecutor — the one pipeline every call flows through.
│   ├── logger.ts       LogLevel, Logger, console logger, env resolution.
│   └── util/           clock, sleep, Semaphore. Tiny, dependency-free helpers.
│
├── endpoints/          Endpoint definitions (id + game + path template).
│   ├── endpoint.ts     Endpoint type, resolveRequest(), query/path helpers.
│   ├── lol.ts  tft.ts  riot.ts   Const maps of endpoints per product.
│   └── index.ts        Barrel.
│
├── entities/           User-facing objects. One class per file, `*.entity.ts`.
│   ├── entity.ts       Abstract Entity<TData> — merges DTO fields + `.meta`.
│   ├── collection.ts   Collection<T> extends Array, carries `.meta`.
│   ├── entity-context.ts  EntityContext { client, region?, regionGroup? }.
│   ├── lol/  riot/  tft/   Entities + the lazy `*-ref.ts` references.
│   └── index.ts        Barrel.
│
├── namespaces/         The methods users call. One namespace class per file.
│   ├── base-namespace.ts   Shared helpers (toEntity/toCollection, contexts).
│   ├── lol/  riot/  tft/  data-dragon/   One file per Riot service + an aggregator.
│   └── …
│
└── client/
    ├── config.ts       YasuoConfig + resolvers (retry, rate limit, cache, logger, base URL).
    └── yasuo.ts        The Yasuo class — wires executor + namespaces together.
```

## Where does new code go?

| You are adding… | Put it in… | Naming |
| --- | --- | --- |
| A new Riot constant | `src/enums/<group>.ts` | `PascalCase` enum, `SCREAMING` or exact-value members |
| A new response shape | `src/dto/<product>/<resource>.dto.ts` | `interface XxxDTO`, `readonly` fields |
| A new endpoint | `src/endpoints/<product>.ts` | key = camelCase id; `path` uses `:param` placeholders |
| A new user-facing object | `src/entities/<product>/<name>.entity.ts` | `class XxxEntity extends Entity<XxxDTO>` |
| A lazy, chainable reference | `src/entities/<product>/<name>-ref.ts` | `class XxxRef implements PromiseLike<XxxEntity>` |
| A new method group | `src/namespaces/<product>/<service>.namespace.ts` | `class XxxNamespace extends BaseNamespace` |
| A transport/infra concern | `src/core/<area>/…` | no Riot domain types |
| A new error case | `src/errors/<name>-error.ts` + wire into `api-error-factory.ts` | `class XxxError extends ApiError` |

After adding a file, export it from the nearest `index.ts` barrel, and — if it's public — from `src/index.ts`.

## The entity pattern (declaration merging)

Entities expose their DTO's fields directly (`summoner.summonerLevel`) via TypeScript **declaration merging**: an `interface` and a `class` share the name. The base `Entity` constructor `Object.assign`s the DTO onto `this`.

```ts
import type { SummonerDTO } from '../../dto/lol/summoner.dto'
import { Entity } from '../entity'

// 1. Interface merges the DTO's fields onto the entity type.
export interface SummonerEntity extends SummonerDTO {}

// 2. Class adds relations + metadata. Fields come from the merged interface.
export class SummonerEntity extends Entity<SummonerDTO> {
  matches(query?: MatchIdsQuery) { /* … lazy relation … */ }
}
```

This is why `biome.json` disables `noUnsafeDeclarationMerging` and `noEmptyInterface` — the pattern is deliberate and load-bearing, not an accident.

## The lazy-reference pattern (thenable)

A `*Ref` is a `PromiseLike` that holds an identifier (e.g. a PUUID) and a fetcher. `await`ing it runs the fetcher; calling a relation runs **only** the related request. This is what makes `summoner.byPuuid(...).matchIds()` a single call. `then()` on these classes is intentional, so it carries a `biome-ignore lint/suspicious/noThenProperty` comment.

## The request pipeline

Every network call — no exceptions — flows through `RequestExecutor.request()`:

> key check → resolve URL → cache lookup → rate-limiter `acquire` → `Semaphore` (concurrency cap) → send → parse rate-limit headers → feed limiter → cache store on 2xx → on 429/503 penalise + retry → else throw the typed `ApiError`.

Namespaces never call `fetch` directly; they call `this.executor.request(...)`. (The one exception is `DataDragonNamespace`, which hits a keyless, un-rate-limited CDN and uses its own tiny fetch wrapper.)

## Enum conventions

- Enum **keys** are the community-facing short names (`EUW`, `NA`, `KR`).
- Enum **values** are exactly what Riot expects on the wire (`EUW1`, `NA1`, `KR`).
- HTTP header enum values are **lower-cased** — response headers are normalised to lower case before lookup.
- Reverse lookups (e.g. platformId → Region) use a `Map` built from `Object.values`, never a hand-maintained second table.

## Tooling

- **Package manager & runtime:** Bun.
- **Lint & format:** Biome (`bun run lint`, `bun run format`). Config in `biome.json`.
- **Types:** `tsc --noEmit` in strict mode (`bun run typecheck`). Must stay green.
- **Build:** tsup → a single ESM + CJS file with `.d.ts` (`bun run build`). `splitting: false` guarantees one file each.
- **Tests:** `bun test`. Unit tests under `test/unit` (no network, deterministic); live tests under `test/integration` (skipped without `RIOT_API_KEY`).

## Definition of done for a change

1. `bun run typecheck` — clean.
2. `bun run lint` — clean (no new `biome-ignore` without a justifying comment).
3. `bun test test/unit` — green; new logic has a unit test.
4. New public surface has JSDoc and is exported from `src/index.ts`.
5. If it touches the wire shape, verify against a live response before trusting the docs.
