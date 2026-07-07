# VAL Ranked — `yasuo.val.ranked`

Wraps Riot's **VAL-RANKED-V1** endpoint: the ranked leaderboard for a VALORANT
act. Routes by `Shard`.

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists, an `actId` string is in scope, and
    `Shard` is imported from `'yasuo'`.

## `leaderboard(actId, shard, query?)`

The ranked leaderboard for an act, in rank order.

- **Params** — `actId: string` — the act id (see `yasuo.val.content` acts, or
  Riot's act list). `shard: Shard` — the VALORANT shard. `query?: ValLeaderboardQuery`
  — optional paging: `size` (1–200, defaults to Riot's server-side page size),
  `startIndex` (zero-based index of the first player, default `0`).
- **Returns** — `SingleQuery<ValLeaderboardEntity>` → a `ValLeaderboardEntity` with:
    - `actId: string` — the act the leaderboard is for.
    - `players: ValLeaderboardPlayerDTO[]` — the player rows, in rank order.
    - `totalPlayers: number` — total ranked players in the act.
    - `startIndex: number` — the index of the first returned row.
    - `shard: string` — the shard the leaderboard was served from.
    - optional `immortalStartingPage` / `immortalStartingIndex`,
      `topTierRRThreshold`, and `tierDetails` (per-tier thresholds keyed by
      competitive-tier id).
    - `top(n: number): ValLeaderboardPlayerDTO[]` — the top `n` rows.
    - `player(puuid: string): ValLeaderboardPlayerDTO | undefined` — a row by
      PUUID (only present for un-hidden players).
- **Routing** — `Shard`.

Each `ValLeaderboardPlayerDTO` carries `leaderboardRank` (1-based), `rankedRating`,
`numberOfWins`, `competitiveTier`, and the optional `puuid` / `gameName` /
`tagLine` (absent when the player has hidden their name).

```ts
const board = await yasuo.val.ranked
  .leaderboard(actId, Shard.NA, { size: 10 })
  .execute()
if (board.error) return

console.log(board.totalPlayers, board.shard, board.http.status)
for (const p of board.top(10)) {
  console.log(p.leaderboardRank, p.gameName ?? '(hidden)', p.rankedRating)
}
```

Opt into throwing instead of attaching the error to the result:

```ts
const board = await yasuo.val.ranked
  .leaderboard(actId, Shard.EU, { startIndex: 100, size: 50 })
  .execute({ throw: true })
console.log(board.players.length)
```
