import { type Page, Paginator } from '../../core/pagination/paginator'
import type { TftMatchDTO } from '../../dto/tft/match.dto'
import type { TftMatchIdsQuery, TftMatchStreamOptions } from '../../dto/tft/query.dto'
import type { QueryParams } from '../../endpoints/endpoint'
import { TFT_ENDPOINTS } from '../../endpoints/tft'
import type { Collection } from '../../entities/collection'
import { TftMatchEntity } from '../../entities/tft/tft-match.entity'
import type { RegionGroup } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

const DEFAULT_PAGE_SIZE = 100

/**
 * TFT-MATCH-V1 methods. All use **regional** routing ({@link RegionGroup}).
 */
export class TftMatchNamespace extends BaseNamespace {
  /**
   * Get a page of TFT match ids for a player.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param query - Optional filters (count, time range…).
   */
  async idsByPuuid(
    puuid: string,
    regionGroup: RegionGroup,
    query?: TftMatchIdsQuery,
  ): Promise<Collection<string>> {
    const fetched = await this.executor.request<string[]>(
      regionGroup,
      TFT_ENDPOINTS.matchIdsByPuuid,
      { pathParams: { puuid }, query: query as QueryParams | undefined },
    )
    return this.toScalarCollection(fetched)
  }

  /**
   * Get a full TFT match by id.
   *
   * @param matchId - The match id.
   * @param regionGroup - The regional routing value.
   */
  async get(matchId: string, regionGroup: RegionGroup): Promise<TftMatchEntity> {
    const fetched = await this.executor.request<TftMatchDTO>(regionGroup, TFT_ENDPOINTS.matchById, {
      pathParams: { matchId },
    })
    return this.toEntity(TftMatchEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get a player's recent TFT matches, fetched in full.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param query - Optional filters (count, time range…).
   */
  async byPuuid(
    puuid: string,
    regionGroup: RegionGroup,
    query?: TftMatchIdsQuery,
  ): Promise<TftMatchEntity[]> {
    const ids = await this.idsByPuuid(puuid, regionGroup, query)
    return Promise.all(ids.map((id) => this.get(id, regionGroup)))
  }

  /**
   * Stream a player's entire TFT match history as full match entities.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatches(
    puuid: string,
    regionGroup: RegionGroup,
    options: TftMatchStreamOptions = {},
  ): Paginator<TftMatchEntity> {
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    return new Paginator<TftMatchEntity>({
      startCursor: options.start ?? 0,
      maxItems: options.maxItems,
      fetchPage: async (cursor): Promise<Page<TftMatchEntity>> => {
        const fetched = await this.executor.request<string[]>(
          regionGroup,
          TFT_ENDPOINTS.matchIdsByPuuid,
          {
            pathParams: { puuid },
            query: {
              start: cursor,
              count: pageSize,
              startTime: options.startTime,
              endTime: options.endTime,
            },
          },
        )
        const items = await Promise.all(fetched.data.map((id) => this.get(id, regionGroup)))
        return { items, meta: fetched.meta, cursor }
      },
      nextCursor: (cursor, page) => (page.items.length < pageSize ? null : cursor + pageSize),
    })
  }
}
