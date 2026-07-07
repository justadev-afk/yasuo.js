# Tournament — `yasuo.lol.tournament` / `yasuo.lol.tournamentStub`

Wraps Riot's **TOURNAMENT-V5** and **TOURNAMENT-STUB-V5** endpoints: register a
provider and a tournament, generate tournament codes, then read a code back and
its lobby events. Creation calls are `POST` (and `updateCode` is a `PUT`) with a
JSON body, all signed with your LoL API key and routed by `RegionGroup`
(regional / continental — usually `RegionGroup.AMERICAS`).

`yasuo.lol.tournament` is the **live** API and needs a production key with
tournament access. `yasuo.lol.tournamentStub` mints fake
providers/tournaments/codes without one — ideal for building and testing the
flow. The two share the same five methods (`registerProvider`,
`registerTournament`, `createCodes`, `getCode`, `lobbyEvents`) — swap the
accessor to switch; only the live `tournament` adds `updateCode`.

Every method returns a query — run it with `.execute()`. The result is the
entity itself (or a `ValueResult` / `Collection`), carrying `.error` and
`.http`; see [Entities & relations](../entities-and-relations.md) and
[Errors](../errors.md).

!!! note "Examples assume"
    `const yasuo = new Yasuo({ key })` exists and `RegionGroup`,
    `TournamentMap`, `TournamentPickType`, `TournamentSpectatorType` and
    `TournamentRegion` are imported from `'yasuo'`.

## `registerProvider(params, regionGroup)`

Register a tournament provider — the callback that receives game-result events.
Available on both `tournament` and `tournamentStub`.

- **Params** — `params: TournamentProviderRegistrationDTO` — `region: string`
  (the shorthand tournament region code, e.g. `TournamentRegion.NA`) and
  `url: string` (the callback URL). `regionGroup: RegionGroup` — the regional
  routing value.
- **Returns** — `SingleQuery<ValueResult<number>>` → a `ValueResult<number>`.
  A primitive can't carry HTTP context, so read the provider id from `.value`
  (`number | null` — `null` on failure).
- **Routing** — `RegionGroup`.

```ts
const provider = await yasuo.lol.tournamentStub
  .registerProvider({ region: TournamentRegion.NA, url: 'https://example.com/cb' }, RegionGroup.AMERICAS)
  .execute()
if (provider.error) return

console.log(provider.value) // provider id, e.g. 1234
```

## `registerTournament(params, regionGroup)`

Register a tournament under a provider. Available on both `tournament` and
`tournamentStub`.

- **Params** — `params: TournamentRegistrationDTO` — `providerId: number` (from
  [`registerProvider`](#registerproviderparams-regiongroup)) and an optional
  `name: string`. `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<ValueResult<number>>` → a `ValueResult<number>`;
  read the tournament id from `.value` (`number | null` — `null` on failure).
- **Routing** — `RegionGroup`.

```ts
const tournament = await yasuo.lol.tournamentStub
  .registerTournament({ providerId: 1234, name: 'Scrims' }, RegionGroup.AMERICAS)
  .execute()
if (tournament.error) return

console.log(tournament.value) // tournament id, e.g. 5678
```

## `createCodes(params, regionGroup, options)`

Generate tournament codes for a tournament. Available on both `tournament` and
`tournamentStub`.

- **Params** — `params: TournamentCodeParametersDTO` — `mapType: string`
  (`TournamentMap`), `pickType: string` (`TournamentPickType`),
  `spectatorType: string` (`TournamentSpectatorType`), `teamSize: number`
  (1–5), and optional `allowedParticipants?: string[]` (PUUIDs; omit for an
  open code), `metadata?: string` (echoed back on lobby events) and
  `enoughPlayers?: boolean`. `regionGroup: RegionGroup` — the regional routing
  value. `options: TournamentCodeCreateOptions` — `tournamentId: number` and an
  optional `count?: number` (1–1000, defaults to Riot's server-side `1`).
- **Returns** — `CollectionQuery<string>` → a `Collection<string>` of code
  strings; iterate/index/`.length` it directly.
- **Routing** — `RegionGroup`.

```ts
const codes = await yasuo.lol.tournamentStub
  .createCodes(
    {
      mapType: TournamentMap.SUMMONERS_RIFT,
      pickType: TournamentPickType.TOURNAMENT_DRAFT,
      spectatorType: TournamentSpectatorType.ALL,
      teamSize: 5,
    },
    RegionGroup.AMERICAS,
    { tournamentId: 5678, count: 3 },
  )
  .execute()
if (codes.error) return

for (const code of codes) console.log(code) // 'NA1234a-...'
```

## `getCode(tournamentCode, regionGroup)`

Look up a tournament code and its settings. Available on both `tournament` and
`tournamentStub`.

- **Params** — `tournamentCode: string` — the code string.
  `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<TournamentCodeEntity>` → a `TournamentCodeEntity`
  with:
    - `code: string` — the code itself.
    - `map: string`, `pickType: string`, `spectators: string` — the settings.
    - `teamSize: number` — players per team.
    - `id: number`, `tournamentId: number`, `providerId: number` — the ids.
    - `region: string`, `lobbyName: string`, `password: string`,
      `metaData: string` — lobby metadata.
    - `participants: string[]` — PUUIDs allowed to use the code.
- **Routing** — `RegionGroup`.

```ts
const code = await yasuo.lol.tournamentStub.getCode('NA1234a-...', RegionGroup.AMERICAS).execute()
if (code.error) return

console.log(code.map, code.teamSize, code.participants)
```

## `lobbyEvents(tournamentCode, regionGroup)`

The lobby events recorded for a tournament code. Available on both `tournament`
and `tournamentStub`.

- **Params** — `tournamentCode: string` — the code string.
  `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<LobbyEventsEntity>` → a `LobbyEventsEntity`
  exposing `eventList: LobbyEventDTO[]` plus the helper `events()` (an alias for
  `eventList`). Each `LobbyEventDTO` carries `timestamp: string` (epoch
  milliseconds as a string), `eventType: string` (e.g.
  `"PracticeGameCreatedEvent"`) and an optional `puuid?: string`.
- **Routing** — `RegionGroup`.

```ts
const events = await yasuo.lol.tournamentStub.lobbyEvents('NA1234a-...', RegionGroup.AMERICAS).execute()
if (events.error) return

for (const e of events.events()) console.log(e.eventType, e.puuid)
```

## `updateCode(tournamentCode, params, regionGroup)`

Update a tournament code's settings (**live only** — on `yasuo.lol.tournament`,
not the stub). This is a `PUT`; there is no response body, so success is
signalled by a `null` `.error` on the resolved result.

- **Params** — `tournamentCode: string` — the code to update.
  `params: TournamentCodeUpdateParametersDTO` — `pickType: string`
  (`TournamentPickType`), `mapType: string` (`TournamentMap`),
  `spectatorType: string` (`TournamentSpectatorType`) and an optional
  `allowedParticipants?: string[]` (replacement PUUID list).
  `regionGroup: RegionGroup` — the regional routing value.
- **Returns** — `SingleQuery<ValueResult<void>>` → a `ValueResult<void>`; there
  is no meaningful `.value`, so check `.error` — `null` means the update
  succeeded.
- **Routing** — `RegionGroup`.

```ts
const result = await yasuo.lol.tournament
  .updateCode(
    'NA1234a-...',
    {
      pickType: TournamentPickType.DRAFT_MODE,
      mapType: TournamentMap.SUMMONERS_RIFT,
      spectatorType: TournamentSpectatorType.LOBBY_ONLY,
    },
    RegionGroup.AMERICAS,
  )
  .execute()

console.log(result.error === null ? 'updated' : result.error) // null on success
```

## End-to-end: provider → tournament → codes

The whole flow against the stub — no production key required. Swap
`tournamentStub` for `tournament` once you hold a production tournament key.

```ts
const region = RegionGroup.AMERICAS

// 1. Register a provider (the game-result callback).
const provider = await yasuo.lol.tournamentStub
  .registerProvider({ region: TournamentRegion.NA, url: 'https://example.com/cb' }, region)
  .execute()
if (provider.error || provider.value === null) return

// 2. Register a tournament under that provider.
const tournament = await yasuo.lol.tournamentStub
  .registerTournament({ providerId: provider.value, name: 'Scrims' }, region)
  .execute()
if (tournament.error || tournament.value === null) return

// 3. Generate codes for the tournament.
const codes = await yasuo.lol.tournamentStub
  .createCodes(
    {
      mapType: TournamentMap.SUMMONERS_RIFT,
      pickType: TournamentPickType.TOURNAMENT_DRAFT,
      spectatorType: TournamentSpectatorType.ALL,
      teamSize: 5,
    },
    region,
    { tournamentId: tournament.value, count: 2 },
  )
  .execute()
if (codes.error) return

for (const code of codes) console.log(code) // 'NA1234a-...'
```
