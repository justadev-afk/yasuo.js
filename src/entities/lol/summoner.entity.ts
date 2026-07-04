import type { Paginator } from '../../core/pagination/paginator'
import type { MatchIdsQuery, MatchStreamOptions } from '../../dto/lol/query.dto'
import type { SummonerDTO } from '../../dto/lol/summoner.dto'
import type { Region } from '../../enums/region'
import type { Collection } from '../collection'
import { Entity } from '../entity'
import type { AccountEntity } from '../riot/account.entity'
import type { ChampionMasteryEntity } from './champion-mastery.entity'
import type { ClashPlayerEntity } from './clash-player.entity'
import type { CurrentGameEntity } from './current-game.entity'
import type { LeagueEntryEntity } from './league-entry.entity'
import type { MatchEntity } from './match.entity'
import type { PlayerChallengesEntity } from './player-challenges.entity'
import { SummonerRef } from './summoner-ref'

// Merge the DTO fields onto the entity so `summoner.puuid` etc. are typed.
export interface SummonerEntity extends SummonerDTO {}

/**
 * A League of Legends summoner with lazy relations into every player-scoped
 * resource. Because it remembers the region it was fetched from, you can reach
 * ranked entries, champion mastery, live game and match history without ever
 * re-passing the PUUID or routing value.
 *
 * The relation methods mirror {@link SummonerRef}; on a materialised entity they
 * still issue one request per relation (the summoner itself is already loaded).
 *
 * @example
 * ```ts
 * const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
 * const ranked   = await summoner.leagueEntries()       // Region.KR
 * const history  = await summoner.matches({ count: 5 }) // RegionGroup.ASIA, derived
 * ```
 */
export class SummonerEntity extends Entity<SummonerDTO> {
  private get region(): Region {
    return this.context.region as Region
  }

  /** A ref bound to this already-loaded summoner, reused for every relation. */
  private ref(): SummonerRef {
    return new SummonerRef(this.context.client, this.puuid, this.region, () =>
      Promise.resolve(this),
    )
  }

  /** Resolve the underlying Riot account (game name + tag line). */
  account(): Promise<AccountEntity> {
    return this.ref().account()
  }

  /** This summoner's ranked league entries in every queue. */
  leagueEntries(): Promise<Collection<LeagueEntryEntity>> {
    return this.ref().leagueEntries()
  }

  /** This summoner's champion mastery, one entry per champion played. */
  championMasteries(): Promise<Collection<ChampionMasteryEntity>> {
    return this.ref().championMasteries()
  }

  /**
   * This summoner's highest champion masteries.
   *
   * @param count - How many top entries to return. Defaults to Riot's default (3).
   */
  topChampionMasteries(count?: number): Promise<Collection<ChampionMasteryEntity>> {
    return this.ref().topChampionMasteries(count)
  }

  /**
   * This summoner's mastery of a single champion.
   *
   * @param championId - The champion id.
   */
  championMastery(championId: number): Promise<ChampionMasteryEntity> {
    return this.ref().championMastery(championId)
  }

  /** This summoner's total champion mastery score. */
  masteryScore(): Promise<number> {
    return this.ref().masteryScore()
  }

  /**
   * Ids of this summoner's recent matches.
   *
   * @param query - Optional filters (count, queue, type, time range…).
   */
  matchIds(query?: MatchIdsQuery): Promise<Collection<string>> {
    return this.ref().matchIds(query)
  }

  /**
   * This summoner's recent matches, fetched in full. Issues one request per
   * match; all are paced by the rate limiter.
   *
   * @param query - Optional filters (count, queue, type, time range…).
   */
  matches(query?: MatchIdsQuery): Promise<MatchEntity[]> {
    return this.ref().matches(query)
  }

  /**
   * Stream this summoner's entire match history of ids as an async iterator.
   *
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatchIds(options?: MatchStreamOptions): Paginator<string> {
    return this.ref().streamMatchIds(options)
  }

  /**
   * Stream this summoner's entire match history as full match entities.
   *
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatches(options?: MatchStreamOptions): Paginator<MatchEntity> {
    return this.ref().streamMatches(options)
  }

  /** This summoner's live game, or `null` if they are not currently in one. */
  activeGame(): Promise<CurrentGameEntity | null> {
    return this.ref().activeGame()
  }

  /** This summoner's active Clash registrations. */
  clashPlayers(): Promise<Collection<ClashPlayerEntity>> {
    return this.ref().clashPlayers()
  }

  /** This summoner's challenge progress. */
  challenges(): Promise<PlayerChallengesEntity> {
    return this.ref().challenges()
  }
}
