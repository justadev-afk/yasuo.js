/**
 * Query parameters for the VAL-RANKED-V1 act leaderboard.
 */
export interface ValLeaderboardQuery {
  /** Number of players to return (1–200). Defaults to Riot's server-side page size. */
  readonly size?: number
  /** Zero-based index of the first player to return. Default `0`. */
  readonly startIndex?: number
}

/**
 * Options for hydrating a VALORANT match history into full matches.
 */
export interface ValMatchlistHydrateOptions {
  /** Cap on how many of the most recent matches to fetch (one request each). */
  readonly count?: number
}
