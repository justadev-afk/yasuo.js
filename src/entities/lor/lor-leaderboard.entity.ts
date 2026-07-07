import type { LorLeaderboardDTO, LorLeaderboardPlayerDTO } from '../../dto/lor/ranked.dto'
import { Entity } from '../entity'

export interface LorLeaderboardEntity extends LorLeaderboardDTO {}

/**
 * The Legends of Runeterra Master-tier leaderboard, with helpers over its rows.
 *
 * @example
 * ```ts
 * const board = await yasuo.lor.ranked.leaderboard(RegionGroup.AMERICAS).execute()
 * if (board.error) return
 * for (const p of board.top(10)) console.log(p.rank, p.name, p.lp)
 * ```
 */
export class LorLeaderboardEntity extends Entity<LorLeaderboardDTO> {
  /**
   * Look up a player row by display name.
   *
   * @param name - The player's display name.
   */
  player(name: string): LorLeaderboardPlayerDTO | undefined {
    return this.players.find((player) => player.name === name)
  }

  /**
   * The top `n` players by rank (already returned in rank order).
   *
   * @param n - How many rows to take.
   */
  top(n: number): LorLeaderboardPlayerDTO[] {
    return this.players.slice(0, n)
  }
}
