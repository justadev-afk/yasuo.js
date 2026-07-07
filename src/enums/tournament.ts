/**
 * Map a tournament game is played on (TOURNAMENT-V5 `mapType`).
 */
export enum TournamentMap {
  SUMMONERS_RIFT = 'SUMMONERS_RIFT',
  HOWLING_ABYSS = 'HOWLING_ABYSS',
  TWISTED_TREELINE = 'TWISTED_TREELINE',
}

/**
 * Champion-select pick type for a tournament code (TOURNAMENT-V5 `pickType`).
 */
export enum TournamentPickType {
  BLIND_PICK = 'BLIND_PICK',
  DRAFT_MODE = 'DRAFT_MODE',
  ALL_RANDOM = 'ALL_RANDOM',
  TOURNAMENT_DRAFT = 'TOURNAMENT_DRAFT',
}

/**
 * Who may spectate a tournament game (TOURNAMENT-V5 `spectatorType`).
 */
export enum TournamentSpectatorType {
  NONE = 'NONE',
  LOBBY_ONLY = 'LOBBYONLY',
  ALL = 'ALL',
}

/**
 * Region a tournament provider registers for (TOURNAMENT-V5 provider `region`).
 *
 * These are the shorthand region codes the tournament API expects — distinct
 * from the platform {@link Region} host ids.
 */
export enum TournamentRegion {
  BR = 'BR',
  EUNE = 'EUNE',
  EUW = 'EUW',
  JP = 'JP',
  LAN = 'LAN',
  LAS = 'LAS',
  NA = 'NA',
  OCE = 'OCE',
  PBE = 'PBE',
  RU = 'RU',
  TR = 'TR',
  KR = 'KR',
}
