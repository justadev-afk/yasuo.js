import type { ValMatchDTO, ValMatchPlayerDTO, ValTeamDTO } from '../../dto/val/match.dto'
import { Entity } from '../entity'

export interface ValMatchEntity extends ValMatchDTO {}

/**
 * A full VALORANT match, with helpers over its players and teams.
 *
 * @example
 * ```ts
 * const match = await yasuo.val.match.get(matchId, Shard.NA).execute()
 * if (match.error) return
 * console.log(match.matchInfo.queueId, match.winningTeam()?.teamId)
 * ```
 */
export class ValMatchEntity extends Entity<ValMatchDTO> {
  /** The match id (`matchInfo.matchId`). */
  get id(): string {
    return this.matchInfo.matchId
  }

  /**
   * Look up a participant by PUUID.
   *
   * @param puuid - The participant's PUUID.
   */
  player(puuid: string): ValMatchPlayerDTO | undefined {
    return this.players.find((player) => player.puuid === puuid)
  }

  /** The winning team, or `undefined` for a draw / non-team mode. */
  winningTeam(): ValTeamDTO | undefined {
    return this.teams.find((team) => team.won)
  }
}
