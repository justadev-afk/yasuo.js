import { VAL_ENDPOINTS } from '../../endpoints/val'
import { ValContentEntity } from '../../entities/val/val-content.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { Shard } from '../../enums/valorant'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * VAL-CONTENT-V1 methods. Routes by {@link Shard}.
 */
export class ValContentNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.ValContent

  /**
   * The static content (agents, maps, skins, acts…) live on a shard.
   *
   * @param shard - The VALORANT shard.
   * @param locale - Optional Riot locale (`en-US`, `ko-KR`, …). When given, each
   * item's `name` is localised and `localizedNames` is omitted.
   */
  get(shard: Shard, locale?: string): SingleQuery<ValContentEntity> {
    return this.single(ValContentEntity, shard, VAL_ENDPOINTS.content, this.shardContext(shard), {
      query: { locale },
    })
  }
}
