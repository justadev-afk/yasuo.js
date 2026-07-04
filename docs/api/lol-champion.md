# Champion — `yasuo.lol.champion`

Wraps Riot's **CHAMPION-V3** endpoint: the current free champion rotation.
Routes by `Region` (platform).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `Region` is imported from
    `'yasuo'`.

## `rotation(region)`

The current free champion rotation for a platform.

- **Params** — `region: Region` — the platform region.
- **Returns** — `SingleQuery<ChampionRotationEntity>` → a
  `ChampionRotationEntity`. Prefer its normalised accessors:
    - `freeChampions: number[]` — champion ids free to play on Summoner's Rift.
    - `newPlayerChampions: number[]` — champion ids free to play for new players.
- **Routing** — `Region`.

!!! tip "Use the normalised accessors"
    Riot reshaped this payload: it now returns `sr` / `newplayer` instead of the
    legacy `freeChampionIds` / `freeChampionIdsForNewPlayers` /
    `maxNewPlayerLevel` fields. All of those wire fields are still typed on the
    entity (as optional), but they may be absent depending on the shape the
    server sent. The `freeChampions` and `newPlayerChampions` getters read
    whichever shape came back, so reach for them rather than the raw fields.

```ts
const rotation = await yasuo.lol.champion.rotation(Region.EUW).execute()
if (rotation.error) return

console.log(rotation.freeChampions)       // number[] — always populated across shapes
console.log(rotation.newPlayerChampions)  // number[]
console.log(rotation.http.status)
```

Get the raw Riot payload (typed `unknown`) when you need the exact wire shape:

```ts
const raw = await yasuo.lol.champion.rotation(Region.EUW).execute({ raw: true })
// raw is `unknown` — narrow it yourself, e.g. (raw as { sr?: number[] }).sr
```
