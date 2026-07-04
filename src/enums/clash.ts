/**
 * A player's assigned lane/position within a Clash team.
 */
export enum ClashPosition {
  UNSELECTED = 'UNSELECTED',
  FILL = 'FILL',
  TOP = 'TOP',
  JUNGLE = 'JUNGLE',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  UTILITY = 'UTILITY',
}

/**
 * A player's role within a Clash team.
 */
export enum ClashRole {
  CAPTAIN = 'CAPTAIN',
  MEMBER = 'MEMBER',
}

/**
 * Lifecycle state of a Clash tournament phase.
 */
export enum ClashTournamentState {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}
