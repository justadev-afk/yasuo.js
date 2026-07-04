import type { TftLeagueEntryDTO } from '../../dto/tft/league.dto'
import type { Region } from '../../enums/region'
import { Entity } from '../entity'
import type { TftSummonerRef } from './tft-summoner-ref'

export interface TftLeagueEntryEntity extends TftLeagueEntryDTO {}

/** A TFT ranked entry with a lazy relation back to its summoner. */
export class TftLeagueEntryEntity extends Entity<TftLeagueEntryDTO> {
  private get region(): Region {
    return this.context.region as Region
  }

  /**
   * Resolve the summoner this entry belongs to (chainable).
   *
   * @throws {Error} If the entry has no `puuid` (e.g. some Hyper Roll rows).
   */
  summoner(): TftSummonerRef {
    if (!this.puuid) {
      throw new Error('This league entry has no puuid to resolve a summoner from')
    }
    return this.context.client.tft.summoner.byPuuid(this.puuid, this.region)
  }
}
