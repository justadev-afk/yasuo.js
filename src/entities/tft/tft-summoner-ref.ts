import type { Yasuo } from '../../client/yasuo'
import type { Paginator } from '../../core/pagination/paginator'
import type { TftMatchIdsQuery, TftMatchStreamOptions } from '../../dto/tft/query.dto'
import { type Region, regionToAccountRegionGroup, regionToRegionGroup } from '../../enums/region'
import type { Collection } from '../collection'
import type { CurrentGameEntity } from '../lol/current-game.entity'
import type { AccountEntity } from '../riot/account.entity'
import type { TftLeagueEntryEntity } from './tft-league-entry.entity'
import type { TftMatchEntity } from './tft-match.entity'
import type { TftSummonerEntity } from './tft-summoner.entity'

/**
 * A lazy, chainable reference to a TFT summoner identified by PUUID. Thenable
 * like {@link SummonerRef}: `await` it to fetch the summoner, or call a relation
 * to fetch only that related resource.
 */
export class TftSummonerRef implements PromiseLike<TftSummonerEntity> {
  private cached?: Promise<TftSummonerEntity>

  constructor(
    private readonly client: Yasuo,
    private readonly puuid: string,
    private readonly region: Region,
    private readonly fetcher: () => Promise<TftSummonerEntity>,
  ) {}

  private resolveSummoner(): Promise<TftSummonerEntity> {
    this.cached ??= this.fetcher()
    return this.cached
  }

  /** Make the ref awaitable — resolves to the fully-fetched TFT summoner. */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike — this is what makes the ref awaitable while keeping relations lazy.
  then<TResult1 = TftSummonerEntity, TResult2 = never>(
    onfulfilled?: ((value: TftSummonerEntity) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.resolveSummoner().then(onfulfilled, onrejected)
  }

  /** The underlying Riot account. */
  account(): Promise<AccountEntity> {
    return this.client.riot.account.byPuuid(this.puuid, regionToAccountRegionGroup(this.region))
  }

  /** TFT ranked league entries. */
  leagueEntries(): Promise<Collection<TftLeagueEntryEntity>> {
    return this.client.tft.league.byPuuid(this.puuid, this.region)
  }

  /**
   * Ids of recent TFT matches.
   *
   * @param query - Optional filters (count, time range…).
   */
  matchIds(query?: TftMatchIdsQuery): Promise<Collection<string>> {
    return this.client.tft.match.idsByPuuid(this.puuid, regionToRegionGroup(this.region), query)
  }

  /**
   * Recent TFT matches, fetched in full.
   *
   * @param query - Optional filters (count, time range…).
   */
  matches(query?: TftMatchIdsQuery): Promise<TftMatchEntity[]> {
    return this.client.tft.match.byPuuid(this.puuid, regionToRegionGroup(this.region), query)
  }

  /**
   * Stream full TFT match entities page by page.
   *
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatches(options?: TftMatchStreamOptions): Paginator<TftMatchEntity> {
    return this.client.tft.match.streamMatches(
      this.puuid,
      regionToRegionGroup(this.region),
      options,
    )
  }

  /** The live TFT game, or `null` if not currently in one. */
  activeGame(): Promise<CurrentGameEntity | null> {
    return this.client.tft.spectator.active(this.puuid, this.region)
  }
}
