import type { MatchType } from '../../enums/match'

/**
 * Query parameters for the MATCH-V5 "matches by PUUID" endpoint.
 */
export interface MatchIdsQuery {
  /** Epoch seconds; only matches after this time are returned. */
  readonly startTime?: number
  /** Epoch seconds; only matches before this time are returned. */
  readonly endTime?: number
  /** Filter by queue id. Cannot be combined with {@link type}. */
  readonly queue?: number
  /** Filter by match category. Cannot be combined with {@link queue}. */
  readonly type?: MatchType
  /** Offset into the match list. Default `0`. */
  readonly start?: number
  /** Number of match ids to return, 0–100. Default `20`. */
  readonly count?: number
}

/**
 * Options for streaming a full match history with a {@link Paginator}.
 */
export interface MatchStreamOptions {
  /** Item offset to start from. Default `0`. */
  readonly start?: number
  /** Page size (match ids fetched per request), 1–100. Default `100`. */
  readonly pageSize?: number
  /** Hard cap on the total number of matches yielded. */
  readonly maxItems?: number
  /** Epoch seconds filter, forwarded to each page request. */
  readonly startTime?: number
  /** Epoch seconds filter, forwarded to each page request. */
  readonly endTime?: number
  /** Queue filter, forwarded to each page request. */
  readonly queue?: number
  /** Type filter, forwarded to each page request. */
  readonly type?: MatchType
}

/**
 * Options for streaming ranked ladder entries with a {@link Paginator}.
 */
export interface LeagueStreamOptions {
  /** Page number to start from (1-indexed). Default `1`. */
  readonly startPage?: number
  /** Hard cap on the total number of entries yielded. */
  readonly maxItems?: number
}
