import type { CurrentGameInfoDTO, CurrentGameParticipantDTO } from '../../dto/lol/spectator.dto'
import { type Region, regionFromPlatformId } from '../../enums/region'
import { Entity } from '../entity'
import type { SummonerEntity } from './summoner.entity'

export interface CurrentGameEntity extends CurrentGameInfoDTO {}

/**
 * A live (spectated) game with lazy relations to its participants' summoners.
 */
export class CurrentGameEntity extends Entity<CurrentGameInfoDTO> {
  /** The {@link Region} the game is on, from `platformId`. */
  platformRegion(): Region | null {
    return regionFromPlatformId(this.platformId)
  }

  /**
   * Resolve summoner entities for every non-anonymised participant.
   *
   * @throws {Error} If `platformId` is not a recognised region.
   */
  summoners(): Promise<SummonerEntity[]> {
    const region = this.platformRegion()
    if (region === null) {
      throw new Error(`Unrecognised platformId "${this.platformId}" — cannot resolve summoners`)
    }
    const identified = this.participants.filter(
      (participant): participant is CurrentGameParticipantDTO & { puuid: string } =>
        typeof participant.puuid === 'string' && participant.puuid.length > 0,
    )
    return Promise.all(
      identified.map((participant) =>
        this.context.client.lol.summoner.byPuuid(participant.puuid, region),
      ),
    )
  }
}
