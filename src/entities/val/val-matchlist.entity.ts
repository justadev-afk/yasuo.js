import type { ValMatchlistDTO } from '../../dto/val/match.dto'
import type { SingleQuery } from '../../query/single-query'
import { Entity } from '../entity'
import type { ValMatchEntity } from './val-match.entity'

export interface ValMatchlistEntity extends ValMatchlistDTO {}

/**
 * A VALORANT player's match history, with a lazy relation to each full match on
 * the same shard.
 *
 * @example
 * ```ts
 * const list = await yasuo.val.match.matchlist(puuid, Shard.NA).execute()
 * const latest = await list.match(list.matchIds()[0]).execute()
 * ```
 */
export class ValMatchlistEntity extends Entity<ValMatchlistDTO> {
  /** The match ids in this history, newest first. */
  matchIds(): string[] {
    return this.history.map((entry) => entry.matchId)
  }

  /**
   * A lazy {@link SingleQuery} for one full match in this history, routed to the
   * shard this list was fetched from.
   *
   * @param matchId - The match id (from {@link matchIds}).
   * @throws {Error} If the originating shard is unknown.
   */
  match(matchId: string): SingleQuery<ValMatchEntity> {
    return this.context.client.val.match.get(matchId, this.requireShard())
  }

  private requireShard() {
    const { shard } = this.context
    if (shard === undefined) {
      throw new Error('Cannot resolve a VALORANT match without the originating shard')
    }
    return shard
  }
}
