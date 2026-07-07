# VAL Content — `yasuo.val.content`

Wraps Riot's **VAL-CONTENT-V1** endpoint: the static VALORANT content — agents,
maps, skins, sprays, competitive acts and more — currently live on a shard.
Routes by `Shard`.

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `Shard` is imported from
    `'yasuo'`.

## `get(shard, locale?)`

The static content live on a shard — each field a list of items of one type.

- **Params** — `shard: Shard` — the VALORANT shard. `locale?: string` — an
  optional Riot locale (`en-US`, `ko-KR`, …); when given, each item's `name` is
  localised and `localizedNames` is omitted, otherwise every item carries the
  full `localizedNames` map.
- **Returns** — `SingleQuery<ValContentEntity>` → a `ValContentEntity` with:
    - `version: string` — the content version string.
    - `characters`, `maps`, `chromas`, `skins`, `skinLevels`, `equips`,
      `gameModes`, `sprays`, `sprayLevels`, `charms`, `charmLevels`,
      `playerCards`, `playerTitles: ValContentItemDTO[]` — the items of each
      type live on the shard.
    - `acts: ValActDTO[]` — competitive acts, each flagged `isActive`.
    - `ceremonies?`, `totems?: ValContentItemDTO[]` — present on newer content
      versions.
    - `activeAct(): ValActDTO | undefined` — convenience helper: the currently
      active competitive act, or `undefined` when none is flagged.
- **Routing** — `Shard`.

Each `ValContentItemDTO` carries `name`, optional `id` (UUID; absent on a few
legacy items), `assetName`, optional `assetPath`, and optional `localizedNames`
(present only when no `locale` was requested). A `ValActDTO` extends that with a
required `id`, `isActive`, and optional `type` (e.g. `act`, `episode`) and
`parentId`.

```ts
const content = await yasuo.val.content.get(Shard.NA).execute()
if (content.error) return

console.log(content.version, content.activeAct()?.name)
for (const map of content.maps) console.log(map.name, map.assetName)
```

Pass a `locale` to get localised `name`s directly (no `localizedNames`):

```ts
const content = await yasuo.val.content.get(Shard.KR, 'ko-KR').execute()
if (content.error) return

for (const agent of content.characters) console.log(agent.name)
```

Opt into throwing instead of attaching the error to the result:

```ts
const content = await yasuo.val.content.get(Shard.EU).execute({ throw: true })
console.log(content.activeAct()?.name, content.http.status)
```
