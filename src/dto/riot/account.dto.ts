/**
 * A Riot account, as returned by ACCOUNT-V1.
 */
export interface AccountDTO {
  /** Encrypted PUUID. Globally unique and stable across API keys. */
  readonly puuid: string
  /** In-game name (the part before the `#`). Absent for some accounts. */
  readonly gameName?: string
  /** Tag line (the part after the `#`). Absent for some accounts. */
  readonly tagLine?: string
}

/**
 * The active shard for a player in a game (ACCOUNT-V1 `active-shards`).
 */
export interface ActiveShardDTO {
  /** Encrypted PUUID. */
  readonly puuid: string
  /** The game this shard applies to (`lol`, `tft`, `val`, `lor`). */
  readonly game: string
  /** The active shard identifier. */
  readonly activeShard: string
}

/**
 * The active region for a player in a game (ACCOUNT-V1 `region`).
 */
export interface AccountRegionDTO {
  /** Encrypted PUUID. */
  readonly puuid: string
  /** The game the region was looked up for (`lol`, `tft`). */
  readonly game: string
  /** The player's active region (e.g. `kr`, `euw1`). */
  readonly region: string
}
