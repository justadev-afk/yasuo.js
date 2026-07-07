import type { Yasuo } from '../client/yasuo'
import type { Region, RegionGroup } from '../enums/region'
import type { Shard } from '../enums/valorant'

/**
 * Context threaded into every entity so that lazy relations can issue
 * follow-up requests without the caller re-specifying the client or routing.
 *
 * It carries the originating {@link Region}, {@link RegionGroup} and/or
 * {@link Shard}, so a summoner fetched from `KR` transparently traverses to
 * their match history on `ASIA`, and a VALORANT matchlist to its full matches on
 * the same shard.
 */
export interface EntityContext {
  /** The root client, used to reach other namespaces. */
  readonly client: Yasuo
  /** Platform region the entity was fetched from, when applicable. */
  readonly region?: Region
  /** Regional routing value the entity was fetched from, when applicable. */
  readonly regionGroup?: RegionGroup
  /** VALORANT shard the entity was fetched from, when applicable. */
  readonly shard?: Shard
}
