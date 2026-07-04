import type { TftLeagueListDTO } from '../../dto/tft/league.dto'
import { Entity } from '../entity'

export interface TftLeagueListEntity extends TftLeagueListDTO {}

/** A TFT apex league (Challenger / Grandmaster / Master) with response metadata. */
export class TftLeagueListEntity extends Entity<TftLeagueListDTO> {
  /** The PUUIDs of every player in the league. */
  puuids(): string[] {
    return this.entries.map((entry) => entry.puuid)
  }
}
