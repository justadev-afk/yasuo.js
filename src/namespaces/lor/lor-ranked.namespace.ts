import { LOR_ENDPOINTS } from '../../endpoints/lor'
import { LorLeaderboardEntity } from '../../entities/lor/lor-leaderboard.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { RegionGroup } from '../../enums/region'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * LOR-RANKED-V1 methods. Routes by {@link RegionGroup}.
 */
export class LorRankedNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.LorRanked

  /**
   * The Master-tier leaderboard for a region.
   *
   * @param regionGroup - The regional routing value.
   */
  leaderboard(regionGroup: RegionGroup): SingleQuery<LorLeaderboardEntity> {
    return this.single(
      LorLeaderboardEntity,
      regionGroup,
      LOR_ENDPOINTS.rankedLeaderboard,
      this.groupContext(regionGroup),
    )
  }
}
