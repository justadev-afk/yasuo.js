import type { LeagueListDTO } from '../../dto/lol/league.dto'
import { Entity } from '../entity'

export interface LeagueListEntity extends LeagueListDTO {}

/** An apex league (Challenger / Grandmaster / Master) with response metadata. */
export class LeagueListEntity extends Entity<LeagueListDTO> {
  /** The PUUIDs of every player in the league. */
  puuids(): string[] {
    return this.entries.map((entry) => entry.puuid)
  }
}
