/** A single player row on the Legends of Runeterra leaderboard. */
export interface LorLeaderboardPlayerDTO {
  /** Player's display name. */
  readonly name: string
  /** Rank on the leaderboard (1-based). */
  readonly rank: number
  /** League points. */
  readonly lp: number
}

/**
 * The Legends of Runeterra Master-tier leaderboard, as returned by
 * LOR-RANKED-V1 `leaderboards`.
 */
export interface LorLeaderboardDTO {
  /** Players in Master tier, in rank order. */
  readonly players: LorLeaderboardPlayerDTO[]
}
