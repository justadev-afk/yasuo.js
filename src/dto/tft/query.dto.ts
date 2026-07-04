/**
 * Query parameters for the TFT-MATCH-V1 "match ids by PUUID" endpoint.
 */
export interface TftMatchIdsQuery {
  /** Epoch seconds; only matches after this time are returned. */
  readonly startTime?: number
  /** Epoch seconds; only matches before this time are returned. */
  readonly endTime?: number
  /** Offset into the match list. Default `0`. */
  readonly start?: number
  /** Number of match ids to return, 0–100. Default `20`. */
  readonly count?: number
}

/**
 * Options for streaming a full TFT match history with a {@link Paginator}.
 */
export interface TftMatchStreamOptions {
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
}
