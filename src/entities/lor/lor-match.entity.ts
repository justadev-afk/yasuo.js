import type { LorMatchDTO, LorMatchPlayerDTO } from '../../dto/lor/match.dto'
import { Entity } from '../entity'

export interface LorMatchEntity extends LorMatchDTO {}

/** Outcome string Riot uses for the winning player. */
const WIN_OUTCOME = 'win'

/**
 * A Legends of Runeterra match, with helpers over its players.
 *
 * @example
 * ```ts
 * const match = await yasuo.lor.match.get(matchId, RegionGroup.AMERICAS).execute()
 * if (match.error) return
 * console.log(match.info.gameMode, match.winner()?.puuid)
 * ```
 */
export class LorMatchEntity extends Entity<LorMatchDTO> {
  /** The match id (`metadata.matchId`). */
  get id(): string {
    return this.metadata.matchId
  }

  /**
   * Look up a player by PUUID.
   *
   * @param puuid - The player's PUUID.
   */
  player(puuid: string): LorMatchPlayerDTO | undefined {
    return this.info.players.find((player) => player.puuid === puuid)
  }

  /** The winning player, or `undefined` (e.g. a draw or incomplete data). */
  winner(): LorMatchPlayerDTO | undefined {
    return this.info.players.find((player) => player.gameOutcome === WIN_OUTCOME)
  }
}
