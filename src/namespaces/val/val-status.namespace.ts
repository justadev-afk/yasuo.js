import { VAL_ENDPOINTS } from '../../endpoints/val'
import { PlatformStatusEntity } from '../../entities/lol/platform-status.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { Shard } from '../../enums/valorant'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * VAL-STATUS-V1 methods. Routes by {@link Shard}.
 *
 * Riot uses one unified status schema across products, so this resolves the same
 * {@link PlatformStatusEntity} as `yasuo.lol.status`.
 */
export class ValStatusNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.ValStatus

  /**
   * The VALORANT platform status for a shard — its maintenances and incidents.
   *
   * @param shard - The VALORANT shard.
   */
  get(shard: Shard): SingleQuery<PlatformStatusEntity> {
    return this.single(PlatformStatusEntity, shard, VAL_ENDPOINTS.status, this.shardContext(shard))
  }
}
