import type { ClashPosition, ClashRole } from '../../enums/clash'

/** A registered Clash player, as returned by CLASH-V1. */
export interface ClashPlayerDTO {
  /** Encrypted PUUID. */
  readonly puuid: string
  /** Assigned lane/position. */
  readonly position: ClashPosition
  /** Team role. */
  readonly role: ClashRole
  /** Team id the player belongs to, when assigned. */
  readonly teamId?: string
}

/** A Clash team. */
export interface ClashTeamDTO {
  readonly id: string
  readonly tournamentId: number
  readonly name: string
  readonly iconId: number
  readonly tier: number
  /** PUUID of the team captain. */
  readonly captain: string
  readonly abbreviation: string
  /** Team roster. */
  readonly players: ClashPlayerDTO[]
}

/** A single phase (day) of a Clash tournament. */
export interface ClashTournamentPhaseDTO {
  readonly id: number
  /** Registration open time, as epoch milliseconds. */
  readonly registrationTime: number
  /** Tournament start time, as epoch milliseconds. */
  readonly startTime: number
  readonly cancelled: boolean
}

/** A Clash tournament. */
export interface ClashTournamentDTO {
  readonly id: number
  readonly themeId: number
  readonly nameKey: string
  readonly nameKeySecondary: string
  /** The tournament's phases (typically day 1 and day 2). */
  readonly schedule: ClashTournamentPhaseDTO[]
}
