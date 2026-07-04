import type { Yasuo } from '../client/yasuo'
import type { Region, RegionGroup } from '../enums/region'

/**
 * Context threaded into every entity so that lazy relations can issue
 * follow-up requests without the caller re-specifying the client or routing.
 *
 * It carries the originating {@link Region} and/or {@link RegionGroup}, so a
 * summoner fetched from `KR` transparently traverses to their match history on
 * `ASIA`.
 */
export interface EntityContext {
  /** The root client, used to reach other namespaces. */
  readonly client: Yasuo
  /** Platform region the entity was fetched from, when applicable. */
  readonly region?: Region
  /** Regional routing value the entity was fetched from, when applicable. */
  readonly regionGroup?: RegionGroup
}
