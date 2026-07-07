# Status — `yasuo.val.status`

Wraps Riot's **VAL-STATUS-V1** endpoint: the VALORANT platform status for a
shard, i.e. its ongoing maintenances and incidents. Routes by `Shard`. Riot uses
one unified status schema across products, so this resolves the **same**
`PlatformStatusEntity` as [`yasuo.lol.status`](lol-status.md).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `Shard` is imported from
    `'yasuo'`.

## `get(shard)`

The VALORANT platform status for a shard — its maintenances and incidents.

- **Params** — `shard: Shard` — the VALORANT shard.
- **Returns** — `SingleQuery<PlatformStatusEntity>` → a `PlatformStatusEntity`
  with:
    - `id: string` — platform id, e.g. `"NA"`.
    - `name: string` — platform name.
    - `locales: string[]` — locales supported on the platform.
    - `maintenances: StatusEntryDTO[]` — ongoing/scheduled maintenances.
    - `incidents: StatusEntryDTO[]` — ongoing incidents.
    - `hasActiveIssues(): boolean` — convenience helper: `true` when there is any
      ongoing incident or maintenance.
- **Routing** — `Shard`.

Each `StatusEntryDTO` carries `id`, `titles` and `updates` (localised
`StatusContentDTO` text), `platforms`, and optional `maintenance_status`
(`scheduled` | `in_progress` | `complete`) or `incident_severity` (`info` |
`warning` | `critical`).

```ts
const status = await yasuo.val.status.get(Shard.NA).execute()
if (status.error) return

if (status.hasActiveIssues()) {
  for (const incident of status.incidents) {
    const title = incident.titles.find((t) => t.locale === 'en_US')?.content
    console.log(incident.incident_severity, title)
  }
}
console.log(status.name, status.http.status)
```

Opt into throwing instead of attaching the error to the result:

```ts
const status = await yasuo.val.status.get(Shard.EU).execute({ throw: true })
console.log(status.hasActiveIssues())
```
