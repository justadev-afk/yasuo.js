import type { ChallengeLevel } from '../../enums/challenge'

/** Configuration of a single challenge, as returned by LOL-CHALLENGES-V1. */
export interface ChallengeConfigDTO {
  readonly id: number
  /** Localised names keyed by locale, then by field (`name`, `description`…). */
  readonly localizedNames: Record<string, Record<string, string>>
  /** `DISABLED` | `HIDDEN` | `ENABLED` | `ARCHIVED`. */
  readonly state: string
  /** Whether the challenge has a leaderboard. */
  readonly leaderboard: boolean
  /** Point thresholds required for each tier, keyed by tier name. */
  readonly thresholds: Record<string, number>
  /** `LIFETIME` | `SEASON`. */
  readonly tracking?: string
  readonly startTimestamp?: number
  readonly endTimestamp?: number
}

/** A challenge percentile distribution, keyed by tier. */
export type ChallengePercentilesDTO = Record<string, number>

/** All challenge percentiles, keyed by challenge id then tier. */
export type AllChallengePercentilesDTO = Record<string, ChallengePercentilesDTO>

/** A leaderboard entry for a challenge (apex players). */
export interface ChallengeApexPlayerDTO {
  readonly puuid: string
  readonly value: number
  readonly position: number
}

/** A player's progress on a single challenge. */
export interface ChallengeInfoDTO {
  readonly challengeId: number
  readonly percentile: number
  readonly level: ChallengeLevel
  readonly value: number
  readonly playersInLevel?: number
  /** Time the current level was achieved, as epoch milliseconds. */
  readonly achievedTime?: number
  readonly position?: number
}

/** A points tally (total or per-category). */
export interface ChallengePointsDTO {
  readonly level: string
  readonly current: number
  readonly max: number
  readonly percentile?: number
  readonly position?: number
}

/** A player's client-side challenge preferences. */
export interface ChallengePreferencesDTO {
  readonly bannerAccent?: string
  readonly title?: string
  readonly challengeIds?: number[]
  readonly crestBorder?: string
  readonly prestigeCrestBorderLevel?: number
}

/** A player's full challenge data. */
export interface PlayerChallengesDTO {
  readonly totalPoints: ChallengePointsDTO
  /** Points per top-level {@link ChallengeCategory}. */
  readonly categoryPoints: Record<string, ChallengePointsDTO>
  readonly challenges: ChallengeInfoDTO[]
  readonly preferences: ChallengePreferencesDTO
}
