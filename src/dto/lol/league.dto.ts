/**
 * A promotion mini-series ("promos"), present only while a player is being
 * promoted between tiers.
 */
export interface MiniSeriesDTO {
  /** Number of wins required to be promoted. */
  readonly target: number
  /** Wins so far in the series. */
  readonly wins: number
  /** Losses so far in the series. */
  readonly losses: number
  /** Per-game progress string, e.g. `"WLN"` (win, loss, not played). */
  readonly progress: string
}

/**
 * A ranked league entry for a player, as returned by the LEAGUE-V4 "entries"
 * endpoints (`by-puuid`, `by tier/division`, `league-exp`).
 */
export interface LeagueEntryDTO {
  /** Encrypted PUUID of the player. */
  readonly puuid: string
  /** Ranked queue type, e.g. `RANKED_SOLO_5x5`. */
  readonly queueType: string
  /** League points within the current division. */
  readonly leaguePoints: number
  /** Total wins (first placement in TFT). */
  readonly wins: number
  /** Total losses (2nd–8th placement in TFT). */
  readonly losses: number
  /** Whether the player is on a hot streak. */
  readonly hotStreak: boolean
  /** Whether the player is a veteran of the league. */
  readonly veteran: boolean
  /** Whether the player recently joined the league. */
  readonly freshBlood: boolean
  /** Whether the player is inactive. */
  readonly inactive: boolean
  /** League id. May be absent on `by-puuid`/`by tier` responses. */
  readonly leagueId?: string
  /** Ranked tier, e.g. `GOLD`. May be absent on some responses. */
  readonly tier?: string
  /** Division within the tier, e.g. `II`. May be absent on some responses. */
  readonly rank?: string
  /** Promotion series info, present only during promos. */
  readonly miniSeries?: MiniSeriesDTO
  /**
   * Encrypted summoner id.
   * @deprecated Use {@link LeagueEntryDTO.puuid}.
   */
  readonly summonerId?: string
}

/**
 * A single entry within a {@link LeagueListDTO} (apex leagues).
 *
 * Unlike {@link LeagueEntryDTO}, the `queueType`/`tier` live on the parent
 * {@link LeagueListDTO}, not on each item.
 */
export interface LeagueItemDTO {
  /** Encrypted PUUID of the player. */
  readonly puuid: string
  /** Division within the tier. */
  readonly rank: string
  /** League points. */
  readonly leaguePoints: number
  /** Total wins. */
  readonly wins: number
  /** Total losses. */
  readonly losses: number
  /** Whether the player is on a hot streak. */
  readonly hotStreak: boolean
  /** Whether the player is a veteran of the league. */
  readonly veteran: boolean
  /** Whether the player recently joined the league. */
  readonly freshBlood: boolean
  /** Whether the player is inactive. */
  readonly inactive: boolean
  /** Promotion series info, present only during promos. */
  readonly miniSeries?: MiniSeriesDTO
  /**
   * Encrypted summoner id.
   * @deprecated Use {@link LeagueItemDTO.puuid}.
   */
  readonly summonerId?: string
}

/**
 * An apex league (Challenger / Grandmaster / Master), as returned by the
 * LEAGUE-V4 "by queue" and "by id" endpoints.
 */
export interface LeagueListDTO {
  /** Tier of the league (`CHALLENGER`, `GRANDMASTER`, `MASTER`). */
  readonly tier: string
  /** The players in the league. */
  readonly entries: LeagueItemDTO[]
  /** League id. */
  readonly leagueId?: string
  /** Human-readable league name. */
  readonly name?: string
  /** Ranked queue type. */
  readonly queue?: string
}
