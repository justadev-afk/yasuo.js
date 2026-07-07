import type { ValRecentMatchesDTO } from '../../dto/val/match.dto'
import type { SingleQuery } from '../../query/single-query'
import { Entity } from '../entity'
import type { ValMatchEntity } from './val-match.entity'

export interface ValRecentMatchesEntity extends ValRecentMatchesDTO {}

/**
 * The recent match ids for a VALORANT queue, with a lazy relation to each full
 * match on the same shard.
 *
 * @example
 * ```ts
 * const recent = await yasuo.val.match.recent(ValQueue.COMPETITIVE, Shard.NA).execute()
 * const first = await recent.match(recent.matchIds[0]).execute()
 * ```
 */
export class ValRecentMatchesEntity extends Entity<ValRecentMatchesDTO> {
  /**
   * A lazy {@link SingleQuery} for one full match in this list, routed to the
   * shard it was fetched from.
   *
   * @param matchId - The match id (from `matchIds`).
   * @throws {Error} If the originating shard is unknown.
   */
  match(matchId: string): SingleQuery<ValMatchEntity> {
    const { shard } = this.context
    if (shard === undefined) {
      throw new Error('Cannot resolve a VALORANT match without the originating shard')
    }
    return this.context.client.val.match.get(matchId, shard)
  }
}
