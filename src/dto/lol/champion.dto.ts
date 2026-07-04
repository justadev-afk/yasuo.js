/**
 * Optional reward configuration for the next champion-mastery season milestone.
 */
export interface RewardConfigDTO {
  /** Opaque reward value. */
  readonly rewardValue: string
  /** Reward type identifier. */
  readonly rewardType: string
  /** Maximum number of this reward obtainable. */
  readonly maximumReward: number
}

/**
 * The next season-milestone requirements for a champion.
 */
export interface NextSeasonMilestoneDTO {
  /** Number of games at each grade required to reach the milestone. */
  readonly requireGradeCounts: Record<string, number>
  /** Marks rewarded for reaching the milestone. */
  readonly rewardMarks: number
  /** Whether this milestone is a bonus milestone. */
  readonly bonus: boolean
  /** Total games required to reach the milestone. */
  readonly totalGamesRequires: number
  /** Optional reward configuration. */
  readonly rewardConfig?: RewardConfigDTO
}

/**
 * A player's mastery of a single champion, as returned by
 * CHAMPION-MASTERY-V4.
 */
export interface ChampionMasteryDTO {
  /** Encrypted PUUID of the player. */
  readonly puuid: string
  /** Champion id. */
  readonly championId: number
  /** Champion mastery level. */
  readonly championLevel: number
  /** Total mastery points accumulated. */
  readonly championPoints: number
  /** Points earned since the current level was reached. */
  readonly championPointsSinceLastLevel: number
  /** Points needed to reach the next level (0 at max level). */
  readonly championPointsUntilNextLevel: number
  /** Last time the champion was played, as epoch milliseconds. */
  readonly lastPlayTime: number
  /** Tokens earned toward the next level-up. */
  readonly tokensEarned: number
  /** Marks required to reach the next level. */
  readonly markRequiredForNextLevel: number
  /** Current season milestone reached for this champion. */
  readonly championSeasonMilestone: number
  /** Requirements for the next season milestone. */
  readonly nextSeasonMilestone: NextSeasonMilestoneDTO
  /** Grades earned toward season milestones (e.g. `["A", "S+"]`). */
  readonly milestoneGrades?: string[]
  /** Whether a chest was granted for this champion this season. */
  readonly chestGranted?: boolean
}

/**
 * The current free champion rotation, as returned by CHAMPION-V3.
 *
 * Riot reshaped this payload: it now returns `sr` (Summoner's Rift free
 * rotation) and `newplayer` (new-player rotation) instead of the historical
 * `freeChampionIds` / `freeChampionIdsForNewPlayers` / `maxNewPlayerLevel`
 * fields. Both shapes are typed here for forward/backward compatibility; prefer
 * the normalised {@link ChampionRotationEntity.freeChampions} accessor, which
 * reads whichever shape the server sent.
 */
export interface ChampionRotationDTO {
  /** Champion ids free to play on Summoner's Rift this rotation (current shape). */
  readonly sr?: number[]
  /** Champion ids free to play for new players (current shape). */
  readonly newplayer?: number[]
  /**
   * Champion ids free to play this rotation.
   * @deprecated Riot now returns {@link sr}; kept for older responses/proxies.
   */
  readonly freeChampionIds?: number[]
  /**
   * Champion ids free to play for players below `maxNewPlayerLevel`.
   * @deprecated Riot now returns {@link newplayer}.
   */
  readonly freeChampionIdsForNewPlayers?: number[]
  /**
   * Highest level considered a "new player" for the new-player rotation.
   * @deprecated No longer returned by the current CHAMPION-V3 payload.
   */
  readonly maxNewPlayerLevel?: number
}
