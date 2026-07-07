# Endpoint coverage

`yasuo` exposes every Riot Games API endpoint as a typed, discoverable method, grouped by game and Riot service. Reach each service through a game-scoped namespace on the client — `yasuo.lol.*`, `yasuo.tft.*`, `yasuo.val.*`, `yasuo.lor.*`, `yasuo.riot.*` and `yasuo.dataDragon.*`. Each method returns a **query builder** you run with a terminal `.execute()`, which resolves — non-throwing — to a rich entity, a `Collection`, or a scalar `ValueResult` directly (never a raw wire DTO), each carrying its own [`.error`/`.http`](errors.md) (opt into throwing with `.execute({ throw: true })`, or get the raw payload with `.execute({ raw: true })`). Two exceptions: `stream*` methods return a [`Paginator`](pagination.md) you loop with `for await`, and `yasuo.dataDragon.*` returns raw DTO promises directly. Platform-scoped services route by `Region`; `match`/`account`/LoR/Tournament route by `RegionGroup`; VALORANT routes by `Shard`. This page is the exhaustive method-by-method reference.

**Coverage: 44 LoL (incl. Tournament-V5 + stub) + 14 TFT + 8 VALORANT + 4 Legends of Runeterra + 4 Riot Account endpoints + Data Dragon = 100% of the key-authenticated Riot API.** The only endpoints not wrapped are the RSO/OAuth-gated ones (LoR Deck & Inventory, RSO Match), which need a user-authorization flow rather than an API key.

> The **Returns** column shows what a query method's `.execute()` resolves to: an entity or a `Collection` **directly**, or — for scalar endpoints — a `ValueResult` you read via `.value`. `Paginator` rows are async-iterables you consume with `for await`; Data Dragon rows are raw payload promises. Lazy [`*Ref`](entities-and-relations.md) builders are `SingleQuery` subclasses — `.execute()` them, or chain a relation and `.execute()` that instead.

Deprecated methods are flagged _(deprecated)_ — they still work, but Riot is phasing out encrypted summoner/account ids in favour of PUUIDs.

## League of Legends — `yasuo.lol`

### SUMMONER-V4 — `yasuo.lol.summoner`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.summoner.byPuuid(puuid: string, region: Region)` | `SUMMONER-V4 /summoners/by-puuid/{puuid}` | Region | lazy `SummonerRef extends SingleQuery` → `SummonerEntity` |
| `yasuo.lol.summoner.byId(summonerId: string, region: Region)` _(deprecated)_ | `SUMMONER-V4 /summoners/{summonerId}` | Region | `SummonerEntity` |
| `yasuo.lol.summoner.byAccountId(accountId: string, region: Region)` _(deprecated)_ | `SUMMONER-V4 /summoners/by-account/{accountId}` | Region | `SummonerEntity` |

### LEAGUE-V4 — `yasuo.lol.league`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.league.byPuuid(puuid: string, region: Region)` | `LEAGUE-V4 /entries/by-puuid/{puuid}` | Region | `Collection<LeagueEntryEntity>` |
| `yasuo.lol.league.bySummonerId(summonerId: string, region: Region)` _(deprecated)_ | `LEAGUE-V4 /entries/by-summoner/{summonerId}` | Region | `Collection<LeagueEntryEntity>` |
| `yasuo.lol.league.entries(queue: RankedQueue, tier: Tier, division: Division, region: Region, page?: number)` | `LEAGUE-V4 /entries/{queue}/{tier}/{division}` | Region | `Collection<LeagueEntryEntity>` |
| `yasuo.lol.league.expEntries(queue: RankedQueue, tier: Tier, division: Division, region: Region, page?: number)` | `LEAGUE-EXP-V4 /entries/{queue}/{tier}/{division}` | Region | `Collection<LeagueEntryEntity>` |
| `yasuo.lol.league.streamEntries(queue: RankedQueue, tier: Tier, division: Division, region: Region, options?: LeagueStreamOptions)` | `LEAGUE-V4 /entries/{queue}/{tier}/{division}` (auto-paged) | Region | `Paginator<LeagueEntryEntity>` |
| `yasuo.lol.league.challenger(queue: RankedQueue, region: Region)` | `LEAGUE-V4 /challengerleagues/by-queue/{queue}` | Region | `LeagueListEntity` |
| `yasuo.lol.league.grandmaster(queue: RankedQueue, region: Region)` | `LEAGUE-V4 /grandmasterleagues/by-queue/{queue}` | Region | `LeagueListEntity` |
| `yasuo.lol.league.master(queue: RankedQueue, region: Region)` | `LEAGUE-V4 /masterleagues/by-queue/{queue}` | Region | `LeagueListEntity` |
| `yasuo.lol.league.byId(leagueId: string, region: Region)` | `LEAGUE-V4 /leagues/{leagueId}` | Region | `LeagueListEntity` |

### CHAMPION-MASTERY-V4 — `yasuo.lol.mastery`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.mastery.byPuuid(puuid: string, region: Region)` | `CHAMPION-MASTERY-V4 /champion-masteries/by-puuid/{puuid}` | Region | `Collection<ChampionMasteryEntity>` |
| `yasuo.lol.mastery.byChampion(puuid: string, championId: number, region: Region)` | `CHAMPION-MASTERY-V4 /champion-masteries/by-puuid/{puuid}/by-champion/{championId}` | Region | `ChampionMasteryEntity` |
| `yasuo.lol.mastery.top(puuid: string, region: Region, count?: number)` | `CHAMPION-MASTERY-V4 /champion-masteries/by-puuid/{puuid}/top` | Region | `Collection<ChampionMasteryEntity>` |
| `yasuo.lol.mastery.score(puuid: string, region: Region)` | `CHAMPION-MASTERY-V4 /scores/by-puuid/{puuid}` | Region | `ValueResult<number>` (scalar; read `.value`) |

### CHAMPION-V3 — `yasuo.lol.champion`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.champion.rotation(region: Region)` | `CHAMPION-V3 /champion-rotations` | Region | `ChampionRotationEntity` |

### MATCH-V5 — `yasuo.lol.match`

All match methods use **regional** routing (`RegionGroup`).

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.match.get(matchId: string, regionGroup: RegionGroup)` | `MATCH-V5 /matches/{matchId}` | RegionGroup | `MatchEntity` |
| `yasuo.lol.match.timeline(matchId: string, regionGroup: RegionGroup)` | `MATCH-V5 /matches/{matchId}/timeline` | RegionGroup | `MatchTimelineEntity` |
| `yasuo.lol.match.idsByPuuid(puuid: string, regionGroup: RegionGroup, query?: MatchIdsQuery)` | `MATCH-V5 /matches/by-puuid/{puuid}/ids` | RegionGroup | `Collection<string>` |
| `yasuo.lol.match.byPuuid(puuid: string, regionGroup: RegionGroup, query?: MatchIdsQuery)` | `MATCH-V5 /matches/by-puuid/{puuid}/ids` + `/matches/{id}` | RegionGroup | `Collection<MatchEntity>` |
| `yasuo.lol.match.streamIds(puuid: string, regionGroup: RegionGroup, options?: MatchStreamOptions)` | `MATCH-V5 /matches/by-puuid/{puuid}/ids` (auto-paged) | RegionGroup | `Paginator<string>` |
| `yasuo.lol.match.streamMatches(puuid: string, regionGroup: RegionGroup, options?: MatchStreamOptions)` | `MATCH-V5 /matches/by-puuid/{puuid}/ids` + `/matches/{id}` (auto-paged) | RegionGroup | `Paginator<MatchEntity>` |

### SPECTATOR-V5 — `yasuo.lol.spectator`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.spectator.active(puuid: string, region: Region)` | `SPECTATOR-V5 /active-games/by-summoner/{puuid}` | Region | `CurrentGameEntity \| null` |
| `yasuo.lol.spectator.featured(region: Region)` | `SPECTATOR-V5 /featured-games` | Region | `FeaturedGamesEntity` |

### LOL-STATUS-V4 — `yasuo.lol.status`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.status.get(region: Region)` | `LOL-STATUS-V4 /platform-data` | Region | `PlatformStatusEntity` |

### CLASH-V1 — `yasuo.lol.clash`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.clash.playersByPuuid(puuid: string, region: Region)` | `CLASH-V1 /players/by-puuid/{puuid}` | Region | `Collection<ClashPlayerEntity>` |
| `yasuo.lol.clash.teamById(teamId: string, region: Region)` | `CLASH-V1 /teams/{teamId}` | Region | `ClashTeamEntity` |
| `yasuo.lol.clash.tournaments(region: Region)` | `CLASH-V1 /tournaments` | Region | `Collection<ClashTournamentEntity>` |
| `yasuo.lol.clash.tournamentByTeam(teamId: string, region: Region)` | `CLASH-V1 /tournaments/by-team/{teamId}` | Region | `ClashTournamentEntity` |
| `yasuo.lol.clash.tournamentById(tournamentId: number \| string, region: Region)` | `CLASH-V1 /tournaments/{tournamentId}` | Region | `ClashTournamentEntity` |

### LOL-CHALLENGES-V1 — `yasuo.lol.challenges`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.challenges.config(region: Region)` | `LOL-CHALLENGES-V1 /challenges/config` | Region | `Collection<ChallengeConfigEntity>` |
| `yasuo.lol.challenges.percentiles(region: Region)` | `LOL-CHALLENGES-V1 /challenges/percentiles` | Region | `ValueResult<AllChallengePercentilesDTO>` (scalar; read `.value`) |
| `yasuo.lol.challenges.configById(challengeId: number, region: Region)` | `LOL-CHALLENGES-V1 /challenges/{challengeId}/config` | Region | `ChallengeConfigEntity` |
| `yasuo.lol.challenges.leaderboards(challengeId: number, level: ChallengeLevel, region: Region, limit?: number)` | `LOL-CHALLENGES-V1 /challenges/{challengeId}/leaderboards/by-level/{level}` | Region | `Collection<ChallengeApexPlayerDTO>` |
| `yasuo.lol.challenges.percentilesById(challengeId: number, region: Region)` | `LOL-CHALLENGES-V1 /challenges/{challengeId}/percentiles` | Region | `ChallengePercentilesEntity` |
| `yasuo.lol.challenges.player(puuid: string, region: Region)` | `LOL-CHALLENGES-V1 /player-data/{puuid}` | Region | `PlayerChallengesEntity` |

### TOURNAMENT-V5 — `yasuo.lol.tournament`

Regional routing (`RegionGroup`, usually `AMERICAS`). Creation calls are `POST`, `updateCode` is a `PUT`, both with a JSON body; signed with the LoL key. Needs a production key with tournament access — mirror the flow with `yasuo.lol.tournamentStub` (below) without one.

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.tournament.registerProvider(params: TournamentProviderRegistrationDTO, regionGroup: RegionGroup)` | `TOURNAMENT-V5 POST /providers` | RegionGroup | `ValueResult<number>` (provider id; read `.value`) |
| `yasuo.lol.tournament.registerTournament(params: TournamentRegistrationDTO, regionGroup: RegionGroup)` | `TOURNAMENT-V5 POST /tournaments` | RegionGroup | `ValueResult<number>` (tournament id; read `.value`) |
| `yasuo.lol.tournament.createCodes(params: TournamentCodeParametersDTO, regionGroup: RegionGroup, options: { tournamentId: number, count?: number })` | `TOURNAMENT-V5 POST /codes` | RegionGroup | `Collection<string>` (codes) |
| `yasuo.lol.tournament.getCode(tournamentCode: string, regionGroup: RegionGroup)` | `TOURNAMENT-V5 GET /codes/{tournamentCode}` | RegionGroup | `TournamentCodeEntity` |
| `yasuo.lol.tournament.updateCode(tournamentCode: string, params: TournamentCodeUpdateParametersDTO, regionGroup: RegionGroup)` | `TOURNAMENT-V5 PUT /codes/{tournamentCode}` | RegionGroup | `ValueResult<void>` (success = `.error` null) |
| `yasuo.lol.tournament.lobbyEvents(tournamentCode: string, regionGroup: RegionGroup)` | `TOURNAMENT-V5 GET /lobby-events/by-code/{tournamentCode}` | RegionGroup | `LobbyEventsEntity` |

### TOURNAMENT-STUB-V5 — `yasuo.lol.tournamentStub`

Same shape as `tournament` minus `updateCode`; mints fake providers/tournaments/codes with no production key.

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lol.tournamentStub.registerProvider(params, regionGroup)` | `TOURNAMENT-STUB-V5 POST /providers` | RegionGroup | `ValueResult<number>` |
| `yasuo.lol.tournamentStub.registerTournament(params, regionGroup)` | `TOURNAMENT-STUB-V5 POST /tournaments` | RegionGroup | `ValueResult<number>` |
| `yasuo.lol.tournamentStub.createCodes(params, regionGroup, options)` | `TOURNAMENT-STUB-V5 POST /codes` | RegionGroup | `Collection<string>` |
| `yasuo.lol.tournamentStub.getCode(tournamentCode, regionGroup)` | `TOURNAMENT-STUB-V5 GET /codes/{tournamentCode}` | RegionGroup | `TournamentCodeEntity` |
| `yasuo.lol.tournamentStub.lobbyEvents(tournamentCode, regionGroup)` | `TOURNAMENT-STUB-V5 GET /lobby-events/by-code/{tournamentCode}` | RegionGroup | `LobbyEventsEntity` |

## Teamfight Tactics — `yasuo.tft`

### TFT-SUMMONER-V1 — `yasuo.tft.summoner`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.tft.summoner.byPuuid(puuid: string, region: Region)` | `TFT-SUMMONER-V1 /summoners/by-puuid/{puuid}` | Region | lazy `TftSummonerRef extends SingleQuery` → `TftSummonerEntity` |
| `yasuo.tft.summoner.byId(summonerId: string, region: Region)` _(deprecated)_ | `TFT-SUMMONER-V1 /summoners/{summonerId}` | Region | `TftSummonerEntity` |

### TFT-LEAGUE-V1 — `yasuo.tft.league`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.tft.league.byPuuid(puuid: string, region: Region)` | `TFT-LEAGUE-V1 /by-puuid/{puuid}` | Region | `Collection<TftLeagueEntryEntity>` |
| `yasuo.tft.league.bySummonerId(summonerId: string, region: Region)` _(deprecated)_ | `TFT-LEAGUE-V1 /entries/by-summoner/{summonerId}` | Region | `Collection<TftLeagueEntryEntity>` |
| `yasuo.tft.league.entries(tier: Tier, division: Division, region: Region, page?: number)` | `TFT-LEAGUE-V1 /entries/{tier}/{division}` | Region | `Collection<TftLeagueEntryEntity>` |
| `yasuo.tft.league.challenger(region: Region)` | `TFT-LEAGUE-V1 /challenger` | Region | `TftLeagueListEntity` |
| `yasuo.tft.league.grandmaster(region: Region)` | `TFT-LEAGUE-V1 /grandmaster` | Region | `TftLeagueListEntity` |
| `yasuo.tft.league.master(region: Region)` | `TFT-LEAGUE-V1 /master` | Region | `TftLeagueListEntity` |
| `yasuo.tft.league.byId(leagueId: string, region: Region)` | `TFT-LEAGUE-V1 /leagues/{leagueId}` | Region | `TftLeagueListEntity` |
| `yasuo.tft.league.ratedLadder(region: Region, queue?: TftRatedLadderQueue)` | `TFT-LEAGUE-V1 /rated-ladders/{queue}/top` | Region | `Collection<TftRatedLadderEntryEntity>` |

### TFT-MATCH-V1 — `yasuo.tft.match`

All match methods use **regional** routing (`RegionGroup`).

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.tft.match.idsByPuuid(puuid: string, regionGroup: RegionGroup, query?: TftMatchIdsQuery)` | `TFT-MATCH-V1 /matches/by-puuid/{puuid}/ids` | RegionGroup | `Collection<string>` |
| `yasuo.tft.match.get(matchId: string, regionGroup: RegionGroup)` | `TFT-MATCH-V1 /matches/{matchId}` | RegionGroup | `TftMatchEntity` |
| `yasuo.tft.match.byPuuid(puuid: string, regionGroup: RegionGroup, query?: TftMatchIdsQuery)` | `TFT-MATCH-V1 /matches/by-puuid/{puuid}/ids` + `/matches/{id}` | RegionGroup | `Collection<TftMatchEntity>` |
| `yasuo.tft.match.streamMatches(puuid: string, regionGroup: RegionGroup, options?: TftMatchStreamOptions)` | `TFT-MATCH-V1 /matches/by-puuid/{puuid}/ids` + `/matches/{id}` (auto-paged) | RegionGroup | `Paginator<TftMatchEntity>` |

### SPECTATOR-TFT-V5 — `yasuo.tft.spectator`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.tft.spectator.active(puuid: string, region: Region)` | `SPECTATOR-TFT-V5 /active-games/by-puuid/{puuid}` | Region | `CurrentGameEntity \| null` |
| `yasuo.tft.spectator.featured(region: Region)` | `SPECTATOR-TFT-V5 /featured-games` | Region | `FeaturedGamesEntity` |

## VALORANT — `yasuo.val`

Every VALORANT service routes by `Shard` (`NA`, `EU`, `AP`, `KR`, `LATAM`, `BR`, `ESPORTS`). Match, ranked and console endpoints need a production key with VALORANT access.

### VAL-CONTENT-V1 — `yasuo.val.content`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.val.content.get(shard: Shard, locale?: string)` | `VAL-CONTENT-V1 /contents` | Shard | `ValContentEntity` |

### VAL-MATCH-V1 — `yasuo.val.match`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.val.match.get(matchId: string, shard: Shard)` | `VAL-MATCH-V1 /matches/{matchId}` | Shard | `ValMatchEntity` |
| `yasuo.val.match.matchlist(puuid: string, shard: Shard)` | `VAL-MATCH-V1 /matchlists/by-puuid/{puuid}` | Shard | `ValMatchlistEntity` |
| `yasuo.val.match.recent(queue: ValQueue \| string, shard: Shard)` | `VAL-MATCH-V1 /recent-matches/by-queue/{queue}` | Shard | `ValRecentMatchesEntity` |
| `yasuo.val.match.byPuuid(puuid: string, shard: Shard, options?: { count?: number })` | `VAL-MATCH-V1 /matchlists/by-puuid/{puuid}` + `/matches/{id}` | Shard | `Collection<ValMatchEntity>` |

### VAL-CONSOLE-MATCH-V1 — `yasuo.val.consoleMatch`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.val.consoleMatch.matchlist(puuid: string, shard: Shard, platformType: ValPlatformType)` | `VAL-CONSOLE-MATCH-V1 /matchlists/by-puuid/{puuid}` | Shard | `ValMatchlistEntity` |
| `yasuo.val.consoleMatch.recent(queue: ValQueue \| string, shard: Shard, platformType: ValPlatformType)` | `VAL-CONSOLE-MATCH-V1 /recent-matches/by-queue/{queue}` | Shard | `ValRecentMatchesEntity` |

### VAL-RANKED-V1 — `yasuo.val.ranked`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.val.ranked.leaderboard(actId: string, shard: Shard, query?: ValLeaderboardQuery)` | `VAL-RANKED-V1 /leaderboards/by-act/{actId}` | Shard | `ValLeaderboardEntity` |

### VAL-STATUS-V1 — `yasuo.val.status`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.val.status.get(shard: Shard)` | `VAL-STATUS-V1 /platform-data` | Shard | `PlatformStatusEntity` |

## Legends of Runeterra — `yasuo.lor`

Every LoR service routes by `RegionGroup` (`AMERICAS`, `ASIA`, `EUROPE`, `SEA`).

### LOR-MATCH-V1 — `yasuo.lor.match`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lor.match.idsByPuuid(puuid: string, regionGroup: RegionGroup)` | `LOR-MATCH-V1 /matches/by-puuid/{puuid}/ids` | RegionGroup | `Collection<string>` |
| `yasuo.lor.match.get(matchId: string, regionGroup: RegionGroup)` | `LOR-MATCH-V1 /matches/{matchId}` | RegionGroup | `LorMatchEntity` |
| `yasuo.lor.match.byPuuid(puuid: string, regionGroup: RegionGroup)` | `LOR-MATCH-V1 /matches/by-puuid/{puuid}/ids` + `/matches/{id}` | RegionGroup | `Collection<LorMatchEntity>` |

### LOR-RANKED-V1 — `yasuo.lor.ranked`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lor.ranked.leaderboard(regionGroup: RegionGroup)` | `LOR-RANKED-V1 /leaderboards` | RegionGroup | `LorLeaderboardEntity` |

### LOR-STATUS-V1 — `yasuo.lor.status`

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.lor.status.get(regionGroup: RegionGroup)` | `LOR-STATUS-V1 /platform-data` | RegionGroup | `PlatformStatusEntity` |

## Riot Account — `yasuo.riot.account`

`ACCOUNT-V1` uses **regional** routing restricted to `AMERICAS`, `ASIA` or `EUROPE` (typed as `AccountRegionGroup`).

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.riot.account.byPuuid(puuid: string, regionGroup: AccountRegionGroup)` | `ACCOUNT-V1 /accounts/by-puuid/{puuid}` | RegionGroup | `AccountEntity` |
| `yasuo.riot.account.byRiotId(gameName: string, tagLine: string, regionGroup: AccountRegionGroup)` | `ACCOUNT-V1 /accounts/by-riot-id/{gameName}/{tagLine}` | RegionGroup | `AccountEntity` |
| `yasuo.riot.account.activeShard(game: Game, puuid: string, regionGroup: AccountRegionGroup)` | `ACCOUNT-V1 /active-shards/by-game/{game}/by-puuid/{puuid}` | RegionGroup | `ActiveShardEntity` |
| `yasuo.riot.account.activeRegion(game: Game, puuid: string, regionGroup: AccountRegionGroup)` | `ACCOUNT-V1 /region/by-game/{game}/by-puuid/{puuid}` | RegionGroup | `AccountRegionEntity` |

## Data Dragon — `yasuo.dataDragon`

Data Dragon is Riot's public static-data CDN (champions, runes, versions, reference lists). These methods return the raw payloads directly (not entities). `versions()` and per-locale champion lists are memoised in-process.

| Method | Riot API | Routing | Returns |
| --- | --- | --- | --- |
| `yasuo.dataDragon.versions()` | `DDragon /api/versions.json` | CDN (none) | `string[]` |
| `yasuo.dataDragon.languages()` | `DDragon /cdn/languages.json` | CDN (none) | `string[]` |
| `yasuo.dataDragon.realm(server: string)` | `DDragon /realms/{server}.json` | CDN (none) | `DDragonRealmDTO` |
| `yasuo.dataDragon.champions(language?: string)` | `DDragon /cdn/{version}/data/{language}/champion.json` | CDN (none) | `DDragonChampionListDTO` |
| `yasuo.dataDragon.champion(name: string, language?: string)` | `DDragon /cdn/{version}/data/{language}/champion/{name}.json` | CDN (none) | `DDragonChampionDetailDTO` |
| `yasuo.dataDragon.championById(championId: number, language?: string)` | `DDragon champion.json` (looked up by numeric key) | CDN (none) | `DDragonChampionSummaryDTO \| null` |
| `yasuo.dataDragon.runesReforged(language?: string)` | `DDragon /cdn/{version}/data/{language}/runesReforged.json` | CDN (none) | `DDragonRunesReforgedDTO[]` |
| `yasuo.dataDragon.queues()` | `Static /docs/lol/queues.json` | CDN (none) | `DDragonQueueDTO[]` |
| `yasuo.dataDragon.maps()` | `Static /docs/lol/maps.json` | CDN (none) | `DDragonMapDTO[]` |
| `yasuo.dataDragon.gameModes()` | `Static /docs/lol/gameModes.json` | CDN (none) | `DDragonGameModeDTO[]` |
| `yasuo.dataDragon.gameTypes()` | `Static /docs/lol/gameTypes.json` | CDN (none) | `DDragonGameTypeDTO[]` |
| `yasuo.dataDragon.seasons()` | `Static /docs/lol/seasons.json` | CDN (none) | `DDragonSeasonDTO[]` |

---

> **Note:** Data Dragon is served from a public CDN. It needs **no API key** and is **not rate-limited**, so `yasuo.dataDragon.*` calls never count against your Riot API quota and skip the client's rate limiter entirely.
