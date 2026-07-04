import type { MiniSeriesDTO } from '../lol/league.dto'

/**
 * A TFT ranked league entry, as returned by TFT-LEAGUE-V1.
 *
 * @remarks
 * For the Hyper Roll (`RANKED_TFT_TURBO`) queue most standard-ranked fields are
 * absent and {@link ratedTier}/{@link ratedRating} are used instead.
 */
export interface TftLeagueEntryDTO {
  /** Ranked queue type, e.g. `RANKED_TFT`. */
  readonly queueType: string
  /** First-place finishes. */
  readonly wins: number
  /** Non-first finishes. */
  readonly losses: number
  /** Encrypted PUUID. */
  readonly puuid?: string
  readonly leagueId?: string
  readonly tier?: string
  readonly rank?: string
  readonly leaguePoints?: number
  readonly hotStreak?: boolean
  readonly veteran?: boolean
  readonly freshBlood?: boolean
  readonly inactive?: boolean
  readonly miniSeries?: MiniSeriesDTO
  /** Hyper Roll rated tier (`ORANGE`, `PURPLE`, …). */
  readonly ratedTier?: string
  /** Hyper Roll rated rating. */
  readonly ratedRating?: number
}

/** A single entry within a {@link TftLeagueListDTO}. */
export interface TftLeagueItemDTO {
  readonly puuid: string
  readonly rank: string
  readonly leaguePoints: number
  readonly wins: number
  readonly losses: number
  readonly hotStreak: boolean
  readonly veteran: boolean
  readonly freshBlood: boolean
  readonly inactive: boolean
  readonly miniSeries?: MiniSeriesDTO
}

/** A TFT apex league (Challenger / Grandmaster / Master). */
export interface TftLeagueListDTO {
  readonly tier: string
  readonly entries: TftLeagueItemDTO[]
  readonly leagueId?: string
  readonly name?: string
  readonly queue?: string
}

/**
 * A single row of the Hyper Roll rated ladder
 * (`TFT-LEAGUE-V1 /rated-ladders/{queue}/top`).
 */
export interface TftRatedLadderEntryDTO {
  /** Encrypted PUUID. */
  readonly puuid: string
  /** Rated tier, e.g. `ORANGE`, `PURPLE`, `BLUE`, `GREEN`, `GRAY`. */
  readonly ratedTier: string
  /** Numeric rating within the tier. */
  readonly ratedRating: number
  /** First-place finishes. */
  readonly wins: number
  /** Ladder position at the previous update. */
  readonly previousUpdateLadderPosition: number
}
