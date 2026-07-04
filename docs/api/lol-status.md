# Status — `yasuo.lol.status`

Wraps Riot's **LOL-STATUS-V4** endpoint: the platform status for a region, i.e.
its ongoing maintenances and incidents. Routes by `Region` (platform).

Every method returns a query — run it with `.execute()`. The result is the
entity itself, carrying `.error` and `.http`; see
[Entities & relations](../entities-and-relations.md) and [Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `Region` is imported from
    `'yasuo'`.

## `get(region)`

The platform status for a region — its maintenances and incidents.

- **Params** — `region: Region` — the platform region.
- **Returns** — `SingleQuery<PlatformStatusEntity>` → a `PlatformStatusEntity`
  with:
    - `id: string` — platform id, e.g. `"KR"`.
    - `name: string` — platform name, e.g. `"Korea"`.
    - `locales: string[]` — locales supported on the platform.
    - `maintenances: StatusEntryDTO[]` — ongoing/scheduled maintenances.
    - `incidents: StatusEntryDTO[]` — ongoing incidents.
    - `hasActiveIssues(): boolean` — convenience helper: `true` when there is any
      ongoing incident or maintenance.
- **Routing** — `Region`.

Each `StatusEntryDTO` carries `id`, `titles` and `updates` (localised
`StatusContentDTO` text), `platforms`, and optional `maintenance_status`
(`scheduled` | `in_progress` | `complete`) or `incident_severity` (`info` |
`warning` | `critical`).

```ts
const status = await yasuo.lol.status.get(Region.KR).execute()
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
const status = await yasuo.lol.status.get(Region.NA).execute({ throw: true })
console.log(status.hasActiveIssues())
```
