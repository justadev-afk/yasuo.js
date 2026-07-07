# LOR Match — `yasuo.lor.match`

Wraps Riot's **LOR-MATCH-V1** endpoints: a player's Legends of Runeterra match
ids, a full match by id, and a player's matches hydrated in full. Every method
routes by `RegionGroup` (regional / continental).

Every method returns a query — run it with `.execute()`. The result is the
entity itself (or a `Collection`), carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists, a `puuid` string already exists,
    and `RegionGroup` is imported from `'yasuo'`.

A `LorMatchEntity` exposes the wire payload's `metadata` (`dataVersion`,
`matchId`, `participants` — a list of PUUIDs) and `info` (`gameMode`, `gameType`,
`gameStartTimeUtc`, `gameVersion`, `totalTurnCount`, and `players` — the full
per-player records). It adds helpers: an `id` getter (`metadata.matchId`),
`player(puuid)` (the player's `LorMatchPlayerDTO`, or `undefined`), and
`winner()` (the player whose `gameOutcome` is `"win"`, or `undefined` on a draw
or incomplete data). Each `LorMatchPlayerDTO` carries `puuid`, `deckId`,
`deckCode`, `factions`, `gameOutcome` (`"win"` / `"loss"`) and `orderOfPlay`.

## `idsByPuuid(puuid, regionGroup)`

A player's match ids, newest first.

- **Params** — `puuid: string` — the player's PUUID; `regionGroup: RegionGroup` —
  the regional routing value.
- **Returns** — `CollectionQuery<string>` → a `Collection<string>` of match ids;
  iterate/index/`.length` it directly.
- **Routing** — `RegionGroup`.

```ts
const ids = await yasuo.lor.match.idsByPuuid(puuid, RegionGroup.AMERICAS).execute()
if (ids.error) return
for (const id of ids) console.log(id) // 'NA_01…'
```

## `get(matchId, regionGroup)`

A full match by id.

- **Params** — `matchId: string` — the match id; `regionGroup: RegionGroup` —
  the regional routing value.
- **Returns** — `SingleQuery<LorMatchEntity>` → a `LorMatchEntity`.
- **Routing** — `RegionGroup`.

```ts
const match = await yasuo.lor.match.get('NA_01234567', RegionGroup.AMERICAS).execute()
if (match.error) return
console.log(match.id, match.info.gameMode, match.info.totalTurnCount)

const top = match.winner()
if (top) console.log('winner:', top.puuid, top.factions, top.deckCode)
```

## `byPuuid(puuid, regionGroup)`

A player's matches, hydrated in full — one request per match id, after the id
list.

- **Params** — `puuid: string` — the player's PUUID; `regionGroup: RegionGroup` —
  the regional routing value.
- **Returns** — `CollectionQuery<LorMatchEntity>` → a `Collection<LorMatchEntity>`.
  If any underlying request fails, the collection comes back empty with `.error`
  set.
- **Routing** — `RegionGroup`.

```ts
const matches = await yasuo.lor.match.byPuuid(puuid, RegionGroup.EUROPE).execute()
if (matches.error) return
for (const match of matches) {
  console.log(match.id, match.info.gameStartTimeUtc, match.player(puuid)?.gameOutcome)
}
```

Opt into throwing instead of attaching the error to the result:

```ts
const matches = await yasuo.lor.match.byPuuid(puuid, RegionGroup.ASIA).execute({ throw: true })
console.log(matches.length)
```
