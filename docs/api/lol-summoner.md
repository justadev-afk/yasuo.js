# Summoner — `yasuo.lol.summoner`

Wraps Riot's **SUMMONER-V4** endpoints: look up a League of Legends summoner
profile by PUUID, encrypted summoner id, or encrypted account id. Every lookup
routes by `Region` (platform).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

The most useful fields on a `SummonerEntity` are `puuid`, `summonerLevel`,
`profileIconId`, and `revisionDate` (epoch ms). Riot has removed `name` and
`accountId` from the payload, and `id` (the encrypted summoner id) is deprecated
and often absent — prefer `puuid` everywhere.

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` and a `puuid` string already exist, and
    `Region` is imported from `'yasuo'`.

## Lazy relations — the important part

`byPuuid(...)` does **not** return a plain query — it returns a `SummonerRef`. A
`SummonerRef extends SingleQuery<SummonerEntity>`, so calling `.execute()` on it
fetches the summoner. But the ref already knows the PUUID and region, so each of
its **relation** methods builds a query for **only** that related resource — the
summoner itself is never requested.

```ts
// ONE request (the match-id list). The summoner is NOT fetched:
const matchIds = await yasuo.lol.summoner
  .byPuuid(puuid, Region.KR)
  .matchIds({ count: 5 })
  .execute()

// Calling .execute() directly is what fetches the summoner:
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).execute()
```

Every relation runs a single, independent request. The same relation methods are
also available on a **loaded** `SummonerEntity`, so once you have the summoner
you can reach any player-scoped resource without re-passing the PUUID or region:

```ts
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).execute()
if (summoner.error) return
const ranked = await summoner.leagueEntries().execute() // separate request
```

### Relations available on `SummonerRef` / `SummonerEntity`

Each returns a query you run with `.execute()`.

| Relation | Returns | Routing | Resource |
| --- | --- | --- | --- |
| `account()` | `SingleQuery<AccountEntity>` | `RegionGroup` | Riot account (game name + tag line) |
| `leagueEntries()` | `CollectionQuery<LeagueEntryEntity>` | `Region` | ranked entries in every queue — see [lol-league.md](lol-league.md) |
| `championMasteries()` | `CollectionQuery<ChampionMasteryEntity>` | `Region` | mastery per champion — see [lol-champion-mastery.md](lol-champion-mastery.md) |
| `topChampionMasteries(count?)` | `CollectionQuery<ChampionMasteryEntity>` | `Region` | highest masteries (Riot defaults to 3) |
| `championMastery(championId)` | `SingleQuery<ChampionMasteryEntity>` | `Region` | mastery of one champion |
| `masteryScore()` | `SingleQuery<ValueResult<number>>` | `Region` | total mastery score — read `.value` |
| `matchIds(query?)` | `CollectionQuery<string>` | `RegionGroup` | recent match ids — see [lol-match.md](lol-match.md) |
| `matches(query?)` | `CollectionQuery<MatchEntity>` | `RegionGroup` | recent matches in full (one request per match) |
| `streamMatchIds(options?)` | `Paginator<string>` | `RegionGroup` | stream all match ids — see [Pagination](../pagination.md) |
| `streamMatches(options?)` | `Paginator<MatchEntity>` | `RegionGroup` | stream all matches in full |
| `activeGame()` | `SingleQuery<CurrentGameEntity \| null>` | `Region` | live game, or `null` if not in one |
| `clashPlayers()` | `CollectionQuery<ClashPlayerEntity>` | `Region` | active Clash registrations |
| `challenges()` | `SingleQuery<PlayerChallengesEntity>` | `Region` | challenge progress |

`matchIds` / `matches` / the stream options accept the match filters
(`count`, `queue`, `type`, `start`, `startTime`, `endTime`); see
[lol-match.md](lol-match.md).

```ts
// Scalar relation → read .value:
const score = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).masteryScore().execute()
if (score.error) return
console.log(score.value) // number | null

// Nullable relation → check for null:
const game = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).activeGame().execute()
if (game === null) console.log('not currently in a game')
```

## `byPuuid(puuid, region)`

Look up a summoner by PUUID and return a lazy `SummonerRef` (see above).

- **Params** — `puuid: string` — the player's encrypted PUUID; `region: Region`
  — the platform region.
- **Returns** — `SummonerRef` (a `SingleQuery<SummonerEntity>`) → `.execute()`
  fetches a `SummonerEntity` with `puuid`, `summonerLevel`, `profileIconId`,
  `revisionDate`; relation methods run only their own request.
- **Routing** — `Region`.

```ts
const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).execute()
if (summoner.error) return
console.log(summoner.summonerLevel, summoner.http.status)
```

## `byId(summonerId, region)`

Look up a summoner by encrypted summoner id.

!!! warning "Deprecated"
    Riot is phasing out encrypted summoner ids — prefer
    [`byPuuid`](#bypuuidpuuid-region).

- **Params** — `summonerId: string` — the encrypted summoner id;
  `region: Region` — the platform region.
- **Returns** — `SingleQuery<SummonerEntity>` → a `SummonerEntity` with `puuid`,
  `summonerLevel`, `profileIconId`, `revisionDate`.
- **Routing** — `Region`.

```ts
// Opt into throwing instead of attaching the error:
const summoner = await yasuo.lol.summoner.byId(summonerId, Region.EUW).execute({ throw: true })
console.log(summoner.puuid)
```

## `byAccountId(accountId, region)`

Look up a summoner by encrypted account id.

!!! warning "Deprecated"
    Account ids are no longer returned by Riot — prefer
    [`byPuuid`](#bypuuidpuuid-region).

- **Params** — `accountId: string` — the encrypted account id; `region: Region`
  — the platform region.
- **Returns** — `SingleQuery<SummonerEntity>` → a `SummonerEntity` with `puuid`,
  `summonerLevel`, `profileIconId`, `revisionDate`.
- **Routing** — `Region`.

```ts
const summoner = await yasuo.lol.summoner.byAccountId(accountId, Region.NA).execute()
if (summoner.error) {
  console.error(summoner.error.message, summoner.http.status)
  return
}
console.log(summoner.puuid)
```
