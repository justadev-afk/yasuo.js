import type { ValMatchlistHydrateOptions } from '../../dto/val/query.dto'
import { VAL_ENDPOINTS } from '../../endpoints/val'
import { Collection } from '../../entities/collection'
import { ValMatchEntity } from '../../entities/val/val-match.entity'
import { ValMatchlistEntity } from '../../entities/val/val-matchlist.entity'
import { ValRecentMatchesEntity } from '../../entities/val/val-recent-matches.entity'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { Shard, ValQueue } from '../../enums/valorant'
import { CollectionQuery } from '../../query/collection-query'
import { forwardExec } from '../../query/execute-options'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/**
 * VAL-MATCH-V1 methods. Routes by {@link Shard}.
 */
export class ValMatchNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.ValMatch

  /**
   * A player's recent matches, hydrated in full (one request per match, after
   * the matchlist).
   *
   * @param puuid - The player's PUUID.
   * @param shard - The VALORANT shard.
   * @param options - Optional cap on how many recent matches to hydrate.
   */
  byPuuid(
    puuid: string,
    shard: Shard,
    options: ValMatchlistHydrateOptions = {},
  ): CollectionQuery<ValMatchEntity> {
    return new CollectionQuery<ValMatchEntity>(async (exec) => {
      const forward = forwardExec(exec)
      const list = await this.matchlist(puuid, shard).execute(forward)
      if (list.error) {
        if (exec.throw) {
          throw list.error
        }
        return exec.raw
          ? list.error.body
          : Collection.create<ValMatchEntity>([], list.http, list.error)
      }
      let ids = list.matchIds()
      if (options.count !== undefined) {
        ids = ids.slice(0, options.count)
      }
      if (exec.raw) {
        return Promise.all(ids.map((id) => this.get(id, shard).execute({ ...forward, raw: true })))
      }
      const matches = await Promise.all(
        ids.map((id) =>
          this.get(id, shard).execute(exec.throw ? { ...forward, throw: true } : forward),
        ),
      )
      const failed = matches.find((match) => match.error)
      if (failed?.error) {
        return Collection.create<ValMatchEntity>([], failed.http, failed.error)
      }
      return Collection.create(matches, matches.at(-1)?.http ?? list.http)
    })
  }

  /**
   * A full match by id.
   *
   * @param matchId - The match id.
   * @param shard - The VALORANT shard.
   */
  get(matchId: string, shard: Shard): SingleQuery<ValMatchEntity> {
    return this.single(ValMatchEntity, shard, VAL_ENDPOINTS.matchById, this.shardContext(shard), {
      pathParams: { matchId },
    })
  }

  /**
   * A player's match history (ids + timestamps), with lazy relations to each
   * full match.
   *
   * @param puuid - The player's PUUID.
   * @param shard - The VALORANT shard.
   */
  matchlist(puuid: string, shard: Shard): SingleQuery<ValMatchlistEntity> {
    return this.single(
      ValMatchlistEntity,
      shard,
      VAL_ENDPOINTS.matchlistByPuuid,
      this.shardContext(shard),
      { pathParams: { puuid } },
    )
  }

  /**
   * Recent match ids for a queue.
   *
   * @param queue - The queue (a {@link ValQueue} or raw queue id).
   * @param shard - The VALORANT shard.
   */
  recent(queue: ValQueue | string, shard: Shard): SingleQuery<ValRecentMatchesEntity> {
    return this.single(
      ValRecentMatchesEntity,
      shard,
      VAL_ENDPOINTS.recentMatchesByQueue,
      this.shardContext(shard),
      { pathParams: { queue } },
    )
  }
}
