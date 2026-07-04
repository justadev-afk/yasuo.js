import type { LeagueEntryDTO } from '../../dto/lol/league.dto'
import type { Region } from '../../enums/region'
import { Entity } from '../entity'
import type { SummonerRef } from './summoner-ref'

export interface LeagueEntryEntity extends LeagueEntryDTO {}

/**
 * A ranked league entry with a lazy relation back to its summoner.
 *
 * @example
 * ```ts
 * const [entry] = await yasuo.lol.league.byPuuid(puuid, Region.EUW)
 * const summoner = await entry.summoner() // same region, no re-passing
 * ```
 */
export class LeagueEntryEntity extends Entity<LeagueEntryDTO> {
  private get region(): Region {
    return this.context.region as Region
  }

  /** Resolve the summoner this entry belongs to (chainable). */
  summoner(): SummonerRef {
    return this.context.client.lol.summoner.byPuuid(this.puuid, this.region)
  }
}
