import type { ValLeaderboardDTO, ValLeaderboardPlayerDTO } from '../../dto/val/ranked.dto'
import { Entity } from '../entity'

export interface ValLeaderboardEntity extends ValLeaderboardDTO {}

/**
 * A VALORANT act leaderboard, with helpers over its player rows.
 *
 * @example
 * ```ts
 * const board = await yasuo.val.ranked.leaderboard(actId, Shard.NA, { size: 10 }).execute()
 * if (board.error) return
 * for (const p of board.top(10)) console.log(p.leaderboardRank, p.gameName)
 * ```
 */
export class ValLeaderboardEntity extends Entity<ValLeaderboardDTO> {
  /**
   * Look up a player row by PUUID.
   *
   * @param puuid - The player's PUUID (only present for un-hidden players).
   */
  player(puuid: string): ValLeaderboardPlayerDTO | undefined {
    return this.players.find((player) => player.puuid === puuid)
  }

  /**
   * The top `n` players by rank (already returned in rank order).
   *
   * @param n - How many rows to take.
   */
  top(n: number): ValLeaderboardPlayerDTO[] {
    return this.players.slice(0, n)
  }
}
