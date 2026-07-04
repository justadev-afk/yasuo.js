import type { Yasuo } from '../../client/yasuo'
import type { Paginator } from '../../core/pagination/paginator'
import type { MatchIdsQuery, MatchStreamOptions } from '../../dto/lol/query.dto'
import { type Region, regionToAccountRegionGroup, regionToRegionGroup } from '../../enums/region'
import type { Collection } from '../collection'
import type { AccountEntity } from '../riot/account.entity'
import type { ChampionMasteryEntity } from './champion-mastery.entity'
import type { ClashPlayerEntity } from './clash-player.entity'
import type { CurrentGameEntity } from './current-game.entity'
import type { LeagueEntryEntity } from './league-entry.entity'
import type { MatchEntity } from './match.entity'
import type { PlayerChallengesEntity } from './player-challenges.entity'
import type { SummonerEntity } from './summoner.entity'

/**
 * A lazy, chainable reference to a summoner identified by PUUID.
 *
 * Returned by `yasuo.lol.summoner.byPuuid(...)`, it is **thenable**: `await`ing
 * it performs the summoner request and yields a {@link SummonerEntity}. But its
 * relation methods (`matches`, `leagueEntries`, `championMasteries`, …) already
 * know the PUUID, so they fetch **only** the related resource — the summoner
 * itself is never requested.
 *
 * This is what makes a chain like the following a **single** request:
 *
 * @example
 * ```ts
 * // One request (the match list), NOT two:
 * const matches = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matches({ count: 5 })
 *
 * // Awaiting the ref directly does fetch the summoner:
 * const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
 * ```
 */
export class SummonerRef implements PromiseLike<SummonerEntity> {
  private cached?: Promise<SummonerEntity>

  constructor(
    private readonly client: Yasuo,
    private readonly puuid: string,
    private readonly region: Region,
    private readonly fetcher: () => Promise<SummonerEntity>,
  ) {}

  private resolveSummoner(): Promise<SummonerEntity> {
    this.cached ??= this.fetcher()
    return this.cached
  }

  /** Make the ref awaitable — resolves to the fully-fetched summoner. */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike — this is what makes the ref awaitable while keeping relations lazy.
  then<TResult1 = SummonerEntity, TResult2 = never>(
    onfulfilled?: ((value: SummonerEntity) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.resolveSummoner().then(onfulfilled, onrejected)
  }

  /** The underlying Riot account. */
  account(): Promise<AccountEntity> {
    return this.client.riot.account.byPuuid(this.puuid, regionToAccountRegionGroup(this.region))
  }

  /** Ranked league entries in every queue. */
  leagueEntries(): Promise<Collection<LeagueEntryEntity>> {
    return this.client.lol.league.byPuuid(this.puuid, this.region)
  }

  /** Champion mastery, one entry per champion played. */
  championMasteries(): Promise<Collection<ChampionMasteryEntity>> {
    return this.client.lol.mastery.byPuuid(this.puuid, this.region)
  }

  /**
   * Highest champion masteries.
   *
   * @param count - How many top entries to return.
   */
  topChampionMasteries(count?: number): Promise<Collection<ChampionMasteryEntity>> {
    return this.client.lol.mastery.top(this.puuid, this.region, count)
  }

  /**
   * Mastery of a single champion.
   *
   * @param championId - The champion id.
   */
  championMastery(championId: number): Promise<ChampionMasteryEntity> {
    return this.client.lol.mastery.byChampion(this.puuid, championId, this.region)
  }

  /** Total champion mastery score. */
  masteryScore(): Promise<number> {
    return this.client.lol.mastery.score(this.puuid, this.region)
  }

  /**
   * Ids of recent matches.
   *
   * @param query - Optional filters (count, queue, type, time range…).
   */
  matchIds(query?: MatchIdsQuery): Promise<Collection<string>> {
    return this.client.lol.match.idsByPuuid(this.puuid, regionToRegionGroup(this.region), query)
  }

  /**
   * Recent matches, fetched in full.
   *
   * @param query - Optional filters (count, queue, type, time range…).
   */
  matches(query?: MatchIdsQuery): Promise<MatchEntity[]> {
    return this.client.lol.match.byPuuid(this.puuid, regionToRegionGroup(this.region), query)
  }

  /**
   * Stream match ids page by page.
   *
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatchIds(options?: MatchStreamOptions): Paginator<string> {
    return this.client.lol.match.streamIds(this.puuid, regionToRegionGroup(this.region), options)
  }

  /**
   * Stream full match entities page by page.
   *
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatches(options?: MatchStreamOptions): Paginator<MatchEntity> {
    return this.client.lol.match.streamMatches(
      this.puuid,
      regionToRegionGroup(this.region),
      options,
    )
  }

  /** The live game, or `null` if not currently in one. */
  activeGame(): Promise<CurrentGameEntity | null> {
    return this.client.lol.spectator.active(this.puuid, this.region)
  }

  /** Active Clash registrations. */
  clashPlayers(): Promise<Collection<ClashPlayerEntity>> {
    return this.client.lol.clash.playersByPuuid(this.puuid, this.region)
  }

  /** Challenge progress. */
  challenges(): Promise<PlayerChallengesEntity> {
    return this.client.lol.challenges.player(this.puuid, this.region)
  }
}
