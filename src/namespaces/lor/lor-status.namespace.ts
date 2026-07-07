import { LOR_ENDPOINTS } from '../../endpoints/lor'
import { PlatformStatusEntity } from '../../entities/lol/platform-status.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { RegionGroup } from '../../enums/region'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * LOR-STATUS-V1 methods. Routes by {@link RegionGroup}.
 *
 * Riot uses one unified status schema across products, so this resolves the same
 * {@link PlatformStatusEntity} as `yasuo.lol.status`.
 */
export class LorStatusNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.LorStatus

  /**
   * The Legends of Runeterra platform status for a region.
   *
   * @param regionGroup - The regional routing value.
   */
  get(regionGroup: RegionGroup): SingleQuery<PlatformStatusEntity> {
    return this.single(
      PlatformStatusEntity,
      regionGroup,
      LOR_ENDPOINTS.status,
      this.groupContext(regionGroup),
    )
  }
}
