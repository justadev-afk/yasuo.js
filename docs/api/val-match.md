# VAL Match — `yasuo.val.match`

Wraps Riot's **VAL-MATCH-V1** endpoints: a full match by id, a player's match
history, the recent match ids for a queue, and a player's recent matches
hydrated in full. VALORANT has no `Region`/`RegionGroup` split — every method
routes by `Shard` (the shard host, e.g. `na`, `eu`, `ap`).

Every method returns a query — run it with `.execute()`. The result is the
entity itself (a `Collection` for `byPuuid`), carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists, a `puuid` string is in scope, and
    `Shard` / `ValQueue` are imported from `'yasuo'`.

## `get(matchId, shard)`

A full match by id.

- **Params** — `matchId: string` — the match id; `shard: Shard` — the VALORANT
  shard.
- **Returns** — `SingleQuery<ValMatchEntity>` → a `ValMatchEntity` with:
    - `matchInfo: ValMatchInfoDTO` — `matchId`, `mapId`, `queueId`, `gameMode`,
      `isRanked`, `gameStartMillis`, `gameLengthMillis`, `isCompleted`, …
    - `players: ValMatchPlayerDTO[]` — per-player records (`puuid`, `teamId`,
      `characterId`, `competitiveTier`, `stats`).
    - `teams: ValTeamDTO[]`, `coaches: ValCoachDTO[]`, `roundResults:
      ValRoundResultDTO[]`.
    - `id: string` — convenience getter for `matchInfo.matchId`.
    - `player(puuid): ValMatchPlayerDTO | undefined` — look up a participant.
    - `winningTeam(): ValTeamDTO | undefined` — the team with `won: true`, or
      `undefined` for a draw / non-team mode.
- **Routing** — `Shard`.

```ts
const match = await yasuo.val.match.get('match-id', Shard.NA).execute()
if (match.error) return

console.log(match.id, match.matchInfo.queueId, match.winningTeam()?.teamId)

const me = match.player(puuid)
if (me) console.log(me.characterId, me.stats.kills, me.stats.deaths)
```

## `matchlist(puuid, shard)`

A player's match history (ids + timestamps), with a lazy relation to each full
match.

- **Params** — `puuid: string` — the player's PUUID; `shard: Shard` — the
  VALORANT shard.
- **Returns** — `SingleQuery<ValMatchlistEntity>` → a `ValMatchlistEntity` with:
    - `puuid: string` and `history: ValMatchlistEntryDTO[]` — each entry carries
      `matchId`, `gameStartTimeMillis`, `queueId`, and an optional `teamId`.
    - `matchIds(): string[]` — the match ids, newest first.
    - `match(matchId): SingleQuery<ValMatchEntity>` — a **lazy** query for one
      full match, routed to the shard this list was fetched from; nothing runs
      until you `.execute()` it.
- **Routing** — `Shard`.

```ts
const list = await yasuo.val.match.matchlist(puuid, Shard.EU).execute()
if (list.error) return

const ids = list.matchIds()
console.log(ids.length, list.history[0]?.queueId)

// Lazy relation: only the match request runs.
const latest = await list.match(ids[0]).execute()
if (!latest.error) console.log(latest.matchInfo.mapId)
```

## `recent(queue, shard)`

Recent match ids for a queue, with a lazy relation to each full match.

- **Params** — `queue: ValQueue | string` — the queue (a `ValQueue` member, e.g.
  `ValQueue.COMPETITIVE`, or a raw queue id); `shard: Shard` — the VALORANT
  shard.
- **Returns** — `SingleQuery<ValRecentMatchesEntity>` → a
  `ValRecentMatchesEntity` with:
    - `currentTime: number` — epoch milliseconds the list was generated.
    - `matchIds: string[]` — the recent match ids for the queue.
    - `match(matchId): SingleQuery<ValMatchEntity>` — a **lazy** query for one
      full match, routed to the same shard.
- **Routing** — `Shard`.

```ts
const recent = await yasuo.val.match.recent(ValQueue.COMPETITIVE, Shard.AP).execute()
if (recent.error) return

console.log(recent.currentTime, recent.matchIds.length)

// Lazy relation off the first id:
const first = await recent.match(recent.matchIds[0]).execute()
if (!first.error) console.log(first.id, first.matchInfo.gameMode)
```

## `byPuuid(puuid, shard, options?)`

A player's recent matches, hydrated in full — it fetches the matchlist, then one
request per match id.

- **Params** — `puuid: string` — the player's PUUID; `shard: Shard` — the
  VALORANT shard; `options?: ValMatchlistHydrateOptions` — `count` caps how many
  of the most recent matches to hydrate (one request each).
- **Returns** — `CollectionQuery<ValMatchEntity>` → a `Collection<ValMatchEntity>`.
  If the matchlist or any hydration request fails, the collection comes back
  empty with `.error` set.
- **Routing** — `Shard`.

```ts
const matches = await yasuo.val.match.byPuuid(puuid, Shard.NA, { count: 5 }).execute()
if (matches.error) return

for (const match of matches) {
  console.log(match.id, match.matchInfo.queueId, match.player(puuid)?.stats.score)
}
```
