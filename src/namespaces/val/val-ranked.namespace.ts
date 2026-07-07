import type { ValLeaderboardQuery } from '../../dto/val/query.dto'
import type { QueryParams } from '../../endpoints/endpoint'
import { VAL_ENDPOINTS } from '../../endpoints/val'
import { ValLeaderboardEntity } from '../../entities/val/val-leaderboard.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { Shard } from '../../enums/valorant'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * VAL-RANKED-V1 methods. Routes by {@link Shard}.
 */
export class ValRankedNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.ValRanked

  /**
   * The ranked leaderboard for an act.
   *
   * @param actId - The act id (see `yasuo.val.content` acts, or Riot's act list).
   * @param shard - The VALORANT shard.
   * @param query - Optional paging (`size`, `startIndex`).
   */
  leaderboard(
    actId: string,
    shard: Shard,
    query?: ValLeaderboardQuery,
  ): SingleQuery<ValLeaderboardEntity> {
    return this.single(
      ValLeaderboardEntity,
      shard,
      VAL_ENDPOINTS.rankedLeaderboardByAct,
      this.shardContext(shard),
      { pathParams: { actId }, query: query as QueryParams | undefined },
    )
  }
}
