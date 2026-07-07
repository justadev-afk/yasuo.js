/** A point on the map (VALORANT world coordinates). */
export interface ValLocationDTO {
  readonly x: number
  readonly y: number
}

/** A player's position and facing at a moment in a round. */
export interface ValPlayerLocationDTO {
  readonly puuid: string
  readonly viewRadians: number
  readonly location: ValLocationDTO
}

/** How a kill's finishing blow was dealt. */
export interface ValFinishingDamageDTO {
  readonly damageType: string
  readonly damageItem: string
  readonly isSecondaryFireMode: boolean
}

/** A single kill within a round. */
export interface ValKillDTO {
  readonly timeSinceGameStartMillis: number
  readonly timeSinceRoundStartMillis: number
  /** PUUID of the killer. */
  readonly killer: string
  /** PUUID of the victim. */
  readonly victim: string
  readonly victimLocation: ValLocationDTO
  /** PUUIDs of assisting players. */
  readonly assistants: string[]
  readonly playerLocations: ValPlayerLocationDTO[]
  readonly finishingDamage: ValFinishingDamageDTO
}

/** Damage a player dealt to one receiver in a round. */
export interface ValDamageDTO {
  /** PUUID of the player who took the damage. */
  readonly receiver: string
  readonly damage: number
  readonly legshots: number
  readonly bodyshots: number
  readonly headshots: number
}

/** A player's economy (loadout/credits) for a round. */
export interface ValEconomyDTO {
  readonly loadoutValue: number
  readonly weapon: string
  readonly armor: string
  readonly remaining: number
  readonly spent: number
}

/** Ability-effect strings recorded for a player in a round. */
export interface ValAbilityDTO {
  readonly grenadeEffects: string | null
  readonly ability1Effects: string | null
  readonly ability2Effects: string | null
  readonly ultimateEffects: string | null
}

/** A player's per-round statistics. */
export interface ValRoundPlayerStatsDTO {
  readonly puuid: string
  readonly kills: ValKillDTO[]
  readonly damage: ValDamageDTO[]
  readonly score: number
  readonly economy: ValEconomyDTO
  readonly ability?: ValAbilityDTO
  readonly stayInSpawn?: number
}

/** The result of a single round. */
export interface ValRoundResultDTO {
  readonly roundNum: number
  readonly roundResult: string
  readonly roundCeremony: string
  /** Team id (`Blue`/`Red`) that won the round. */
  readonly winningTeam: string
  /** PUUID of the spike planter, when planted. */
  readonly bombPlanter?: string
  /** PUUID of the spike defuser, when defused. */
  readonly bombDefuser?: string
  readonly plantRoundTime?: number
  readonly plantPlayerLocations?: ValPlayerLocationDTO[]
  readonly plantLocation?: ValLocationDTO
  readonly plantSite?: string
  readonly defuseRoundTime?: number
  readonly defusePlayerLocations?: ValPlayerLocationDTO[]
  readonly defuseLocation?: ValLocationDTO
  readonly playerStats: ValRoundPlayerStatsDTO[]
  readonly roundResultCode: string
}

/** Ability-cast counts across a match. */
export interface ValAbilityCastsDTO {
  readonly grenadeCasts: number
  readonly ability1Casts: number
  readonly ability2Casts: number
  readonly ultimateCasts: number
}

/** A player's aggregate match statistics. */
export interface ValPlayerStatsDTO {
  readonly score: number
  readonly roundsPlayed: number
  readonly kills: number
  readonly deaths: number
  readonly assists: number
  readonly playtimeMillis: number
  readonly abilityCasts?: ValAbilityCastsDTO
}

/** A participant in a VALORANT match. */
export interface ValMatchPlayerDTO {
  readonly puuid: string
  readonly gameName?: string
  readonly tagLine?: string
  /** Team id (`Blue`/`Red`, or the player's own id in deathmatch). */
  readonly teamId: string
  readonly partyId: string
  /** Agent (character) id. */
  readonly characterId: string
  readonly stats: ValPlayerStatsDTO
  /** Competitive tier at the time of the match. */
  readonly competitiveTier: number
  readonly isObserver?: boolean
  readonly playerCard: string
  readonly playerTitle: string
  readonly accountLevel?: number
}

/** A coach attached to a team (custom/esports matches). */
export interface ValCoachDTO {
  readonly puuid: string
  readonly teamId: string
}

/** A team's outcome and score. */
export interface ValTeamDTO {
  /** Team id (`Blue`/`Red`). */
  readonly teamId: string
  readonly won: boolean
  readonly roundsPlayed: number
  readonly roundsWon: number
  readonly numPoints: number
}

/** Match-level metadata. */
export interface ValMatchInfoDTO {
  readonly matchId: string
  readonly mapId: string
  readonly gameLengthMillis?: number
  readonly gameStartMillis: number
  readonly provisioningFlowId: string
  readonly isCompleted: boolean
  readonly customGameName: string
  /** Queue id, e.g. `competitive`, `unrated`. */
  readonly queueId: string
  readonly gameMode: string
  readonly isRanked: boolean
  readonly seasonId: string
}

/**
 * A full VALORANT match, as returned by VAL-MATCH-V1 `matches/{matchId}`.
 */
export interface ValMatchDTO {
  readonly matchInfo: ValMatchInfoDTO
  readonly players: ValMatchPlayerDTO[]
  readonly coaches: ValCoachDTO[]
  readonly teams: ValTeamDTO[]
  readonly roundResults: ValRoundResultDTO[]
}

/** One entry in a player's match history. */
export interface ValMatchlistEntryDTO {
  readonly matchId: string
  readonly gameStartTimeMillis: number
  /** Queue id, e.g. `competitive`. */
  readonly queueId: string
  readonly teamId?: string
}

/**
 * A player's match history, as returned by VAL-MATCH-V1
 * `matchlists/by-puuid/{puuid}` (and the console equivalent).
 */
export interface ValMatchlistDTO {
  readonly puuid: string
  readonly history: ValMatchlistEntryDTO[]
}

/**
 * Recent match ids for a queue, as returned by VAL-MATCH-V1
 * `recent-matches/by-queue/{queue}` (and the console equivalent).
 */
export interface ValRecentMatchesDTO {
  /** Epoch milliseconds the list was generated. */
  readonly currentTime: number
  readonly matchIds: string[]
}
