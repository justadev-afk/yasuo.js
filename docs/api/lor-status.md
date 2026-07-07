# Status — `yasuo.lor.status`

Wraps Riot's **LOR-STATUS-V1** endpoint: the Legends of Runeterra platform status
for a region, i.e. its ongoing maintenances and incidents. Riot uses one unified
status schema across products, so this resolves the **same**
`PlatformStatusEntity` as [`yasuo.lol.status`](lol-status.md). Routes by
`RegionGroup` (regional / continental).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `RegionGroup` is imported from
    `'yasuo'`.

## `get(regionGroup)`

The Legends of Runeterra platform status for a region — its maintenances and
incidents.

- **Params** — `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<PlatformStatusEntity>` → a `PlatformStatusEntity`
  with:
    - `id: string` — platform id, e.g. `"KR"`.
    - `name: string` — platform name, e.g. `"Korea"`.
    - `locales: string[]` — locales supported on the platform.
    - `maintenances: StatusEntryDTO[]` — ongoing/scheduled maintenances.
    - `incidents: StatusEntryDTO[]` — ongoing incidents.
    - `hasActiveIssues(): boolean` — convenience helper: `true` when there is any
      ongoing incident or maintenance.
- **Routing** — `RegionGroup`.

Each `StatusEntryDTO` carries `id`, `titles` and `updates` (localised
`StatusContentDTO` text), `platforms`, and optional `maintenance_status`
(`scheduled` | `in_progress` | `complete`) or `incident_severity` (`info` |
`warning` | `critical`).

```ts
const status = await yasuo.lor.status.get(RegionGroup.AMERICAS).execute()
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
const status = await yasuo.lor.status.get(RegionGroup.EUROPE).execute({ throw: true })
console.log(status.hasActiveIssues())
```
