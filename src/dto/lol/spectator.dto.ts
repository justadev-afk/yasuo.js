/** Rune perks of a spectated participant. */
export interface SpectatorPerksDTO {
  readonly perkIds: number[]
  readonly perkStyle: number
  readonly perkSubStyle: number
}

/** A game-customization object attached to a spectated participant. */
export interface GameCustomizationObjectDTO {
  readonly category: string
  readonly content: string
}

/** A participant in a spectated (live) game. */
export interface CurrentGameParticipantDTO {
  readonly championId: number
  readonly profileIconId: number
  readonly spell1Id: number
  readonly spell2Id: number
  readonly teamId: number
  readonly bot: boolean
  readonly gameCustomizationObjects: GameCustomizationObjectDTO[]
  /** Encrypted PUUID. Absent/null when the player is anonymised. */
  readonly puuid?: string
  /** Riot ID (`gameName#tagLine`), when available. */
  readonly riotId?: string
  readonly perks?: SpectatorPerksDTO
}

/** A champion banned in a spectated game. */
export interface BannedChampionDTO {
  readonly championId: number
  readonly teamId: number
  readonly pickTurn: number
}

/** Observer credentials for a spectated game. */
export interface ObserverDTO {
  readonly encryptionKey: string
}

/** A live game, as returned by SPECTATOR-V5. */
export interface CurrentGameInfoDTO {
  readonly gameId: number
  readonly gameType: string
  readonly gameStartTime: number
  readonly mapId: number
  readonly gameLength: number
  readonly platformId: string
  readonly gameMode: string
  readonly bannedChampions: BannedChampionDTO[]
  readonly observers: ObserverDTO
  readonly participants: CurrentGameParticipantDTO[]
  readonly gameQueueConfigId?: number
}

/** The featured-games list, as returned by SPECTATOR-V5. */
export interface FeaturedGamesDTO {
  readonly gameList: CurrentGameInfoDTO[]
  /** Suggested seconds between refreshes. */
  readonly clientRefreshInterval?: number
}
