# LOR Ranked — `yasuo.lor.ranked`

Wraps Riot's **LOR-RANKED-V1** endpoint: the Legends of Runeterra Master-tier
leaderboard for a region. Routes by `RegionGroup` (regional / continental).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `RegionGroup` is imported from
    `'yasuo'`.

## `leaderboard(regionGroup)`

The Master-tier leaderboard for a region.

- **Params** — `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<LorLeaderboardEntity>` → a `LorLeaderboardEntity`
  with:
    - `players: LorLeaderboardPlayerDTO[]` — the Master-tier rows, in rank
      order. Each row carries `name: string`, `rank: number` (1-based) and
      `lp: number` (league points).
    - `top(n): LorLeaderboardPlayerDTO[]` — convenience helper: the top `n`
      rows (the list is already in rank order).
    - `player(name): LorLeaderboardPlayerDTO | undefined` — convenience helper:
      look up a row by display name.
- **Routing** — `RegionGroup`.

```ts
const board = await yasuo.lor.ranked.leaderboard(RegionGroup.AMERICAS).execute()
if (board.error) return

for (const p of board.top(10)) {
  console.log(p.rank, p.name, p.lp)
}
console.log(board.players.length, board.http.status)
```

Opt into throwing instead of attaching the error to the result:

```ts
const board = await yasuo.lor.ranked
  .leaderboard(RegionGroup.EUROPE)
  .execute({ throw: true })

const me = board.player('Hide on bush')
if (me) console.log(me.rank, me.lp)
```
