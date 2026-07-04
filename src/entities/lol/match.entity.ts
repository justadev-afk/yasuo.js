import type { MatchDTO, MatchParticipantDTO, MatchTeamDTO } from '../../dto/lol/match.dto'
import { type Region, type RegionGroup, regionFromPlatformId } from '../../enums/region'
import { Entity } from '../entity'
import type { MatchTimelineEntity } from './match-timeline.entity'
import type { SummonerEntity } from './summoner.entity'

export interface MatchEntity extends MatchDTO {}

/**
 * A full match with lazy relations to its timeline and participants' summoners.
 *
 * @example
 * ```ts
 * const match     = await yasuo.lol.match.get('KR_1234', RegionGroup.ASIA)
 * const timeline  = await match.timeline()          // no ids re-passed
 * const summoners = await match.summoners()          // region derived from platformId
 * ```
 */
export class MatchEntity extends Entity<MatchDTO> {
  private get regionGroup(): RegionGroup {
    return this.context.regionGroup as RegionGroup
  }

  /** The match id (`metadata.matchId`). */
  get id(): string {
    return this.metadata.matchId
  }

  /** Fetch the timeline for this match. */
  timeline(): Promise<MatchTimelineEntity> {
    return this.context.client.lol.match.timeline(this.id, this.regionGroup)
  }

  /** The winning team, or `null` if it cannot be determined. */
  winningTeam(): MatchTeamDTO | null {
    return this.info.teams.find((team) => team.win) ?? null
  }

  /**
   * Look up a participant by PUUID.
   *
   * @param puuid - The participant's PUUID.
   */
  participant(puuid: string): MatchParticipantDTO | undefined {
    return this.info.participants.find((participant) => participant.puuid === puuid)
  }

  /**
   * Resolve summoner entities for all participants, deriving the platform
   * region from `info.platformId`.
   *
   * @throws {Error} If `info.platformId` is not a recognised region.
   */
  summoners(): Promise<SummonerEntity[]> {
    const region = this.platformRegion()
    if (region === null) {
      throw new Error(
        `Unrecognised platformId "${this.info.platformId}" — cannot resolve summoners`,
      )
    }
    return Promise.all(
      this.info.participants.map((participant) =>
        this.context.client.lol.summoner.byPuuid(participant.puuid, region),
      ),
    )
  }

  /** The {@link Region} this match was played on, from `info.platformId`. */
  platformRegion(): Region | null {
    return regionFromPlatformId(this.info.platformId)
  }
}
