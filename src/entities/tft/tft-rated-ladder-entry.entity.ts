import type { TftRatedLadderEntryDTO } from '../../dto/tft/league.dto'
import type { Region } from '../../enums/region'
import { Entity } from '../entity'
import type { TftSummonerRef } from './tft-summoner-ref'

export interface TftRatedLadderEntryEntity extends TftRatedLadderEntryDTO {}

/** A Hyper Roll rated-ladder row with a lazy relation back to its summoner. */
export class TftRatedLadderEntryEntity extends Entity<TftRatedLadderEntryDTO> {
  private get region(): Region {
    return this.context.region as Region
  }

  /** Resolve the summoner this ladder row belongs to (chainable). */
  summoner(): TftSummonerRef {
    return this.context.client.tft.summoner.byPuuid(this.puuid, this.region)
  }
}
