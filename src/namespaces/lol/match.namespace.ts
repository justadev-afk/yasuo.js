import { type Page, Paginator } from '../../core/pagination/paginator'
import type { MatchDTO } from '../../dto/lol/match.dto'
import type { MatchIdsQuery, MatchStreamOptions } from '../../dto/lol/query.dto'
import type { MatchTimelineDTO } from '../../dto/lol/timeline.dto'
import type { QueryParams } from '../../endpoints/endpoint'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import type { Collection } from '../../entities/collection'
import { MatchTimelineEntity } from '../../entities/lol/match-timeline.entity'
import { MatchEntity } from '../../entities/lol/match.entity'
import type { RegionGroup } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

const DEFAULT_PAGE_SIZE = 100

/**
 * MATCH-V5 methods. All use **regional** routing ({@link RegionGroup}).
 */
export class LolMatchNamespace extends BaseNamespace {
  /**
   * Get a full match by id.
   *
   * @param matchId - The match id, e.g. `KR_1234567890`.
   * @param regionGroup - The regional routing value.
   */
  async get(matchId: string, regionGroup: RegionGroup): Promise<MatchEntity> {
    const fetched = await this.executor.request<MatchDTO>(regionGroup, LOL_ENDPOINTS.matchById, {
      pathParams: { matchId },
    })
    return this.toEntity(MatchEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get a match timeline by id.
   *
   * @param matchId - The match id.
   * @param regionGroup - The regional routing value.
   */
  async timeline(matchId: string, regionGroup: RegionGroup): Promise<MatchTimelineEntity> {
    const fetched = await this.executor.request<MatchTimelineDTO>(
      regionGroup,
      LOL_ENDPOINTS.matchTimeline,
      { pathParams: { matchId } },
    )
    return this.toEntity(MatchTimelineEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get a page of match ids for a player.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param query - Optional filters (count, queue, type, time range…).
   */
  async idsByPuuid(
    puuid: string,
    regionGroup: RegionGroup,
    query?: MatchIdsQuery,
  ): Promise<Collection<string>> {
    const fetched = await this.executor.request<string[]>(
      regionGroup,
      LOL_ENDPOINTS.matchIdsByPuuid,
      { pathParams: { puuid }, query: query as QueryParams | undefined },
    )
    return this.toScalarCollection(fetched)
  }

  /**
   * Get a player's recent matches, fetched in full (one request per match).
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param query - Optional filters (count, queue, type, time range…).
   */
  async byPuuid(
    puuid: string,
    regionGroup: RegionGroup,
    query?: MatchIdsQuery,
  ): Promise<MatchEntity[]> {
    const ids = await this.idsByPuuid(puuid, regionGroup, query)
    return Promise.all(ids.map((id) => this.get(id, regionGroup)))
  }

  /**
   * Stream a player's entire match-id history as an async iterator.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamIds(
    puuid: string,
    regionGroup: RegionGroup,
    options: MatchStreamOptions = {},
  ): Paginator<string> {
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    return new Paginator<string>({
      startCursor: options.start ?? 0,
      maxItems: options.maxItems,
      fetchPage: async (cursor): Promise<Page<string>> => {
        const fetched = await this.executor.request<string[]>(
          regionGroup,
          LOL_ENDPOINTS.matchIdsByPuuid,
          { pathParams: { puuid }, query: this.pageQuery(cursor, pageSize, options) },
        )
        return { items: fetched.data, meta: fetched.meta, cursor }
      },
      nextCursor: (cursor, page) => (page.items.length < pageSize ? null : cursor + pageSize),
    })
  }

  /**
   * Stream a player's entire match history as full match entities.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   * @param options - Paging options (start offset, page size, max items…).
   */
  streamMatches(
    puuid: string,
    regionGroup: RegionGroup,
    options: MatchStreamOptions = {},
  ): Paginator<MatchEntity> {
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    return new Paginator<MatchEntity>({
      startCursor: options.start ?? 0,
      maxItems: options.maxItems,
      fetchPage: async (cursor): Promise<Page<MatchEntity>> => {
        const fetched = await this.executor.request<string[]>(
          regionGroup,
          LOL_ENDPOINTS.matchIdsByPuuid,
          { pathParams: { puuid }, query: this.pageQuery(cursor, pageSize, options) },
        )
        const items = await Promise.all(fetched.data.map((id) => this.get(id, regionGroup)))
        return { items, meta: fetched.meta, cursor }
      },
      nextCursor: (cursor, page) => (page.items.length < pageSize ? null : cursor + pageSize),
    })
  }

  private pageQuery(cursor: number, pageSize: number, options: MatchStreamOptions): QueryParams {
    return {
      start: cursor,
      count: pageSize,
      startTime: options.startTime,
      endTime: options.endTime,
      queue: options.queue,
      type: options.type,
    }
  }
}
