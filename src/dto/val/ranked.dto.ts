/** A single player row on a VALORANT act leaderboard. */
export interface ValLeaderboardPlayerDTO {
  /** Encrypted PUUID. Absent when the player has hidden their name. */
  readonly puuid?: string
  readonly gameName?: string
  readonly tagLine?: string
  /** Rank on the leaderboard (1-based). */
  readonly leaderboardRank: number
  /** Ranked Rating. */
  readonly rankedRating: number
  readonly numberOfWins: number
  /** Competitive tier id. */
  readonly competitiveTier: number
}

/** Threshold details for a tier on the leaderboard. */
export interface ValTierDetailDTO {
  readonly rankedRatingThreshold: number
  readonly startingPage: number
  readonly startingIndex: number
}

/**
 * A VALORANT act leaderboard, as returned by VAL-RANKED-V1
 * `leaderboards/by-act/{actId}`.
 */
export interface ValLeaderboardDTO {
  /** The act id the leaderboard is for. */
  readonly actId: string
  readonly players: ValLeaderboardPlayerDTO[]
  readonly totalPlayers: number
  readonly immortalStartingPage?: number
  readonly immortalStartingIndex?: number
  readonly topTierRRThreshold?: number
  /** Per-tier thresholds, keyed by competitive-tier id. */
  readonly tierDetails?: Readonly<Record<string, ValTierDetailDTO>>
  readonly startIndex: number
  readonly query?: string
  /** The shard the leaderboard was served from. */
  readonly shard: string
}
