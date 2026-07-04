import type { MatchMetadataDTO } from './match.dto'

/** A 2D map position. */
export interface PositionDTO {
  readonly x: number
  readonly y: number
}

/** Live champion stats sampled at a timeline frame. */
export interface ChampionStatsDTO {
  readonly abilityPower: number
  readonly armor: number
  readonly armorPen: number
  readonly armorPenPercent: number
  readonly attackDamage: number
  readonly attackSpeed: number
  readonly bonusArmorPenPercent: number
  readonly bonusMagicPenPercent: number
  readonly ccReduction: number
  readonly cooldownReduction: number
  readonly health: number
  readonly healthMax: number
  readonly healthRegen: number
  readonly lifesteal: number
  readonly magicPen: number
  readonly magicPenPercent: number
  readonly magicResist: number
  readonly movementSpeed: number
  readonly power: number
  readonly powerMax: number
  readonly powerRegen: number
  readonly spellVamp: number
  readonly abilityHaste?: number
  readonly omnivamp?: number
  readonly physicalVamp?: number
}

/** Cumulative damage stats sampled at a timeline frame. */
export interface DamageStatsDTO {
  readonly magicDamageDone: number
  readonly magicDamageDoneToChampions: number
  readonly magicDamageTaken: number
  readonly physicalDamageDone: number
  readonly physicalDamageDoneToChampions: number
  readonly physicalDamageTaken: number
  readonly totalDamageDone: number
  readonly totalDamageDoneToChampions: number
  readonly totalDamageTaken: number
  readonly trueDamageDone: number
  readonly trueDamageDoneToChampions: number
  readonly trueDamageTaken: number
}

/** A participant's per-frame snapshot. */
export interface ParticipantFrameDTO {
  readonly participantId: number
  readonly currentGold: number
  readonly totalGold: number
  readonly goldPerSecond: number
  readonly level: number
  readonly xp: number
  readonly minionsKilled: number
  readonly jungleMinionsKilled: number
  readonly timeEnemySpentControlled: number
  readonly position: PositionDTO
  readonly championStats: ChampionStatsDTO
  readonly damageStats: DamageStatsDTO
}

/** A record of damage a victim dealt/received, attached to kill events. */
export interface TimelineVictimDamageDTO {
  readonly basic: boolean
  readonly magicDamage: number
  readonly physicalDamage: number
  readonly trueDamage: number
  readonly participantId: number
  readonly spellSlot: number
  readonly spellName: string
  readonly name: string
  readonly type: string
}

/**
 * A timeline event. Only {@link timestamp} and {@link type} are always
 * present; every other field is optional and only set for the relevant event
 * types (kills, item transactions, ward events, objectives, etc.).
 */
export interface TimelineEventDTO {
  readonly timestamp: number
  /** Discriminator, e.g. `CHAMPION_KILL`, `ITEM_PURCHASED`, `WARD_PLACED`. */
  readonly type: string
  readonly realTimestamp?: number
  readonly participantId?: number
  readonly itemId?: number
  readonly afterId?: number
  readonly beforeId?: number
  readonly goldGain?: number
  readonly levelUpType?: string
  readonly skillSlot?: number
  readonly creatorId?: number
  readonly wardType?: string
  readonly level?: number
  readonly killerId?: number
  readonly victimId?: number
  readonly assistingParticipantIds?: number[]
  readonly position?: PositionDTO
  readonly bounty?: number
  readonly shutdownBounty?: number
  readonly killStreakLength?: number
  readonly killType?: string
  readonly multiKillLength?: number
  readonly victimDamageDealt?: TimelineVictimDamageDTO[]
  readonly victimDamageReceived?: TimelineVictimDamageDTO[]
  readonly laneType?: string
  readonly teamId?: number
  readonly killerTeamId?: number
  readonly monsterType?: string
  readonly monsterSubType?: string
  readonly buildingType?: string
  readonly towerType?: string
  readonly gameId?: number
  readonly winningTeam?: number
  readonly transformType?: string
  readonly name?: string
  readonly actualStartTime?: number
  readonly featType?: number
  readonly featValue?: number
}

/** One frame of the timeline (default interval 60s). */
export interface TimelineFrameDTO {
  readonly timestamp: number
  readonly events: TimelineEventDTO[]
  /** Per-participant snapshots, keyed by participant id (`"1"`–`"10"`). */
  readonly participantFrames: Record<string, ParticipantFrameDTO>
}

/** Participant identity within a timeline. */
export interface TimelineParticipantDTO {
  readonly participantId: number
  readonly puuid: string
}

/** MATCH-V5 timeline info block. */
export interface MatchTimelineInfoDTO {
  /** Milliseconds between frames. */
  readonly frameInterval: number
  readonly frames: TimelineFrameDTO[]
  readonly gameId?: number
  readonly participants?: TimelineParticipantDTO[]
  readonly endOfGameResult?: string
}

/** A full MATCH-V5 timeline. */
export interface MatchTimelineDTO {
  readonly metadata: MatchMetadataDTO
  readonly info: MatchTimelineInfoDTO
}
