import { type Page, Paginator } from '../../core/pagination/paginator'
import type { LeagueEntryDTO, LeagueListDTO } from '../../dto/lol/league.dto'
import type { LeagueStreamOptions } from '../../dto/lol/query.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import type { Collection } from '../../entities/collection'
import { LeagueEntryEntity } from '../../entities/lol/league-entry.entity'
import { LeagueListEntity } from '../../entities/lol/league-list.entity'
import type { Division, RankedQueue, Tier } from '../../enums/ranked'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

const DEFAULT_START_PAGE = 1

/**
 * LEAGUE-V4 methods.
 */
export class LolLeagueNamespace extends BaseNamespace {
  /**
   * Get all ranked entries for a player by PUUID.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  async byPuuid(puuid: string, region: Region): Promise<Collection<LeagueEntryEntity>> {
    const fetched = await this.executor.request<LeagueEntryDTO[]>(
      region,
      LOL_ENDPOINTS.leagueEntriesByPuuid,
      { pathParams: { puuid } },
    )
    return this.toCollection(LeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get ranked entries for a player by encrypted summoner id.
   *
   * @param summonerId - The encrypted summoner id.
   * @param region - The platform region.
   * @deprecated Prefer {@link byPuuid}.
   */
  async bySummonerId(summonerId: string, region: Region): Promise<Collection<LeagueEntryEntity>> {
    const fetched = await this.executor.request<LeagueEntryDTO[]>(
      region,
      LOL_ENDPOINTS.leagueEntriesBySummoner,
      { pathParams: { summonerId } },
    )
    return this.toCollection(LeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get one page of ranked entries for a queue/tier/division.
   *
   * @param queue - Ranked queue.
   * @param tier - Ranked tier.
   * @param division - Division within the tier.
   * @param region - The platform region.
   * @param page - Page number (1-indexed). Default `1`.
   */
  async entries(
    queue: RankedQueue,
    tier: Tier,
    division: Division,
    region: Region,
    page = DEFAULT_START_PAGE,
  ): Promise<Collection<LeagueEntryEntity>> {
    const fetched = await this.executor.request<LeagueEntryDTO[]>(
      region,
      LOL_ENDPOINTS.leagueEntries,
      { pathParams: { queue, tier, division }, query: { page } },
    )
    return this.toCollection(LeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get one page of experimental ranked entries (`league-exp-v4`), which also
   * covers the apex tiers.
   *
   * @param queue - Ranked queue.
   * @param tier - Ranked tier.
   * @param division - Division within the tier.
   * @param region - The platform region.
   * @param page - Page number (1-indexed). Default `1`.
   */
  async expEntries(
    queue: RankedQueue,
    tier: Tier,
    division: Division,
    region: Region,
    page = DEFAULT_START_PAGE,
  ): Promise<Collection<LeagueEntryEntity>> {
    const fetched = await this.executor.request<LeagueEntryDTO[]>(
      region,
      LOL_ENDPOINTS.leagueExpEntries,
      { pathParams: { queue, tier, division }, query: { page } },
    )
    return this.toCollection(LeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Stream every ranked entry for a queue/tier/division as an async iterator,
   * paging automatically. Start from any page.
   *
   * @param queue - Ranked queue.
   * @param tier - Ranked tier.
   * @param division - Division within the tier.
   * @param region - The platform region.
   * @param options - Paging options (start page, max items).
   */
  streamEntries(
    queue: RankedQueue,
    tier: Tier,
    division: Division,
    region: Region,
    options: LeagueStreamOptions = {},
  ): Paginator<LeagueEntryEntity> {
    const context = this.regionContext(region)
    return new Paginator<LeagueEntryEntity>({
      startCursor: options.startPage ?? DEFAULT_START_PAGE,
      maxItems: options.maxItems,
      fetchPage: async (page): Promise<Page<LeagueEntryEntity>> => {
        const fetched = await this.executor.request<LeagueEntryDTO[]>(
          region,
          LOL_ENDPOINTS.leagueEntries,
          { pathParams: { queue, tier, division }, query: { page } },
        )
        const items = fetched.data.map((dto) => new LeagueEntryEntity(dto, fetched.meta, context))
        return { items, meta: fetched.meta, cursor: page }
      },
      nextCursor: (page, result) => (result.items.length === 0 ? null : page + 1),
    })
  }

  /**
   * Get the Challenger league for a queue.
   *
   * @param queue - Ranked queue.
   * @param region - The platform region.
   */
  challenger(queue: RankedQueue, region: Region): Promise<LeagueListEntity> {
    return this.leagueList(LOL_ENDPOINTS.leagueChallenger, queue, region)
  }

  /**
   * Get the Grandmaster league for a queue.
   *
   * @param queue - Ranked queue.
   * @param region - The platform region.
   */
  grandmaster(queue: RankedQueue, region: Region): Promise<LeagueListEntity> {
    return this.leagueList(LOL_ENDPOINTS.leagueGrandmaster, queue, region)
  }

  /**
   * Get the Master league for a queue.
   *
   * @param queue - Ranked queue.
   * @param region - The platform region.
   */
  master(queue: RankedQueue, region: Region): Promise<LeagueListEntity> {
    return this.leagueList(LOL_ENDPOINTS.leagueMaster, queue, region)
  }

  /**
   * Get a league by its id.
   *
   * @param leagueId - The league id.
   * @param region - The platform region.
   */
  async byId(leagueId: string, region: Region): Promise<LeagueListEntity> {
    const fetched = await this.executor.request<LeagueListDTO>(region, LOL_ENDPOINTS.leagueById, {
      pathParams: { leagueId },
    })
    return this.toEntity(LeagueListEntity, fetched, this.regionContext(region))
  }

  private async leagueList(
    endpoint: (typeof LOL_ENDPOINTS)['leagueChallenger' | 'leagueGrandmaster' | 'leagueMaster'],
    queue: RankedQueue,
    region: Region,
  ): Promise<LeagueListEntity> {
    const fetched = await this.executor.request<LeagueListDTO>(region, endpoint, {
      pathParams: { queue },
    })
    return this.toEntity(LeagueListEntity, fetched, this.regionContext(region))
  }
}
