import { VAL_ENDPOINTS } from '../../endpoints/val'
import { ValMatchlistEntity } from '../../entities/val/val-matchlist.entity'
import { ValRecentMatchesEntity } from '../../entities/val/val-recent-matches.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { Shard, ValPlatformType, ValQueue } from '../../enums/valorant'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * VAL-CONSOLE-MATCH-V1 methods (PlayStation/Xbox). Routes by {@link Shard} and
 * requires a {@link ValPlatformType}. Full console matches are fetched through
 * `yasuo.val.match.get`.
 */
export class ValConsoleMatchNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.ValConsoleMatch

  /**
   * A console player's match history.
   *
   * @param puuid - The player's PUUID.
   * @param shard - The VALORANT shard.
   * @param platformType - The console platform.
   */
  matchlist(
    puuid: string,
    shard: Shard,
    platformType: ValPlatformType,
  ): SingleQuery<ValMatchlistEntity> {
    return this.single(
      ValMatchlistEntity,
      shard,
      VAL_ENDPOINTS.consoleMatchlistByPuuid,
      this.shardContext(shard),
      { pathParams: { puuid }, query: { platformType } },
    )
  }

  /**
   * Recent console match ids for a queue.
   *
   * @param queue - The queue (a {@link ValQueue} or raw queue id).
   * @param shard - The VALORANT shard.
   * @param platformType - The console platform.
   */
  recent(
    queue: ValQueue | string,
    shard: Shard,
    platformType: ValPlatformType,
  ): SingleQuery<ValRecentMatchesEntity> {
    return this.single(
      ValRecentMatchesEntity,
      shard,
      VAL_ENDPOINTS.consoleRecentMatchesByQueue,
      this.shardContext(shard),
      { pathParams: { queue }, query: { platformType } },
    )
  }
}
