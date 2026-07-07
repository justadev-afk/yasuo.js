# VAL Console Match — `yasuo.val.consoleMatch`

Wraps Riot's **VAL-CONSOLE-MATCH-V1** endpoints (PlayStation / Xbox): a console
player's match history, and the recent console match ids for a queue. VALORANT
does not use the LoL `Region` / `RegionGroup` split — every method routes by
`Shard` and takes a required `ValPlatformType` (`playstation` | `xbox`). Full
console matches are fetched through [`yasuo.val.match.get`](val-match.md).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `Shard`, `ValQueue` and
    `ValPlatformType` are imported from `'yasuo'`.

## `matchlist(puuid, shard, platformType)`

A console player's match history.

- **Params** — `puuid: string` — the player's PUUID; `shard: Shard` — the
  VALORANT shard; `platformType: ValPlatformType` — the console platform
  (`PLAYSTATION` | `XBOX`).
- **Returns** — `SingleQuery<ValMatchlistEntity>` → a `ValMatchlistEntity` with:
    - `puuid: string` — the player these matches belong to.
    - `history: ValMatchlistEntryDTO[]` — the history entries, newest first;
      each carries `matchId`, `gameStartTimeMillis`, `queueId` and an optional
      `teamId`.
    - `matchIds(): string[]` — the match ids in the history, newest first.
    - `match(matchId): SingleQuery<ValMatchEntity>` — a lazy relation to one full
      match, routed to the shard this list was fetched from.
- **Routing** — `Shard`.

```ts
const list = await yasuo.val.consoleMatch
  .matchlist(puuid, Shard.NA, ValPlatformType.PLAYSTATION)
  .execute()
if (list.error) return

console.log(list.matchIds().length, list.http.status)

// list -> full match; only the match request runs, on the same shard.
const latest = await list.match(list.matchIds()[0]).execute()
if (latest.error) return
console.log(latest.matchInfo.queueId, latest.matchInfo.mapId)
```

## `recent(queue, shard, platformType)`

The recent console match ids for a queue.

- **Params** — `queue: ValQueue | string` — the queue (a `ValQueue` member such
  as `ValQueue.COMPETITIVE`, or a raw queue id string); `shard: Shard` — the
  VALORANT shard; `platformType: ValPlatformType` — the console platform.
- **Returns** — `SingleQuery<ValRecentMatchesEntity>` → a
  `ValRecentMatchesEntity` with:
    - `currentTime: number` — epoch milliseconds the list was generated.
    - `matchIds: string[]` — the recent match ids.
    - `match(matchId): SingleQuery<ValMatchEntity>` — a lazy relation to one full
      match, routed to the shard it was fetched from.
- **Routing** — `Shard`.

```ts
const recent = await yasuo.val.consoleMatch
  .recent(ValQueue.COMPETITIVE, Shard.NA, ValPlatformType.XBOX)
  .execute()
if (recent.error) return

console.log(recent.matchIds.length, recent.currentTime)

// Opt into throwing instead of the error-carrying result.
const first = await recent.match(recent.matchIds[0]).execute({ throw: true })
console.log(first.matchInfo.matchId, first.matchInfo.isRanked)
```
