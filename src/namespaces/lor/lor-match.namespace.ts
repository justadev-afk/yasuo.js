import { LOR_ENDPOINTS } from '../../endpoints/lor'
import { Collection } from '../../entities/collection'
import { LorMatchEntity } from '../../entities/lor/lor-match.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { RegionGroup } from '../../enums/region'
import { CollectionQuery } from '../../query/collection-query'
import { forwardExec } from '../../query/execute-options'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * LOR-MATCH-V1 methods. All route by {@link RegionGroup}.
 */
export class LorMatchNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.LorMatch

  /**
   * A player's matches, hydrated in full (one request per match, after the id
   * list).
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   */
  byPuuid(puuid: string, regionGroup: RegionGroup): CollectionQuery<LorMatchEntity> {
    return new CollectionQuery<LorMatchEntity>(async (exec) => {
      const forward = forwardExec(exec)
      const ids = await this.idsByPuuid(puuid, regionGroup).execute(forward)
      if (ids.error) {
        if (exec.throw) {
          throw ids.error
        }
        return exec.raw
          ? ids.error.body
          : Collection.create<LorMatchEntity>([], ids.http, ids.error)
      }
      if (exec.raw) {
        return Promise.all(
          [...ids].map((id) => this.get(id, regionGroup).execute({ ...forward, raw: true })),
        )
      }
      const matches = await Promise.all(
        [...ids].map((id) =>
          this.get(id, regionGroup).execute(exec.throw ? { ...forward, throw: true } : forward),
        ),
      )
      const failed = matches.find((match) => match.error)
      if (failed?.error) {
        return Collection.create<LorMatchEntity>([], failed.http, failed.error)
      }
      return Collection.create(matches, matches.at(-1)?.http ?? ids.http)
    })
  }

  /**
   * A full match by id.
   *
   * @param matchId - The match id.
   * @param regionGroup - The regional routing value.
   */
  get(matchId: string, regionGroup: RegionGroup): SingleQuery<LorMatchEntity> {
    return this.single(
      LorMatchEntity,
      regionGroup,
      LOR_ENDPOINTS.matchById,
      this.groupContext(regionGroup),
      { pathParams: { matchId } },
    )
  }

  /**
   * A player's match ids, newest first.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - The regional routing value.
   */
  idsByPuuid(puuid: string, regionGroup: RegionGroup): CollectionQuery<string> {
    return this.scalarMany<string>(regionGroup, LOR_ENDPOINTS.matchIdsByPuuid, {
      pathParams: { puuid },
    })
  }
}
