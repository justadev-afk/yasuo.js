/**
 * MATCH-V5 metadata block.
 */
export interface MatchMetadataDTO {
  /** Match data version. */
  readonly dataVersion: string
  /** Match id, e.g. `KR_1234567890`. */
  readonly matchId: string
  /** PUUIDs of the participants, in team order. */
  readonly participants: string[]
}

/** Rune/stat perk selections for a participant. */
export interface PerkStatsDTO {
  readonly defense: number
  readonly flex: number
  readonly offense: number
}

/** A single selection within a rune style. */
export interface PerkStyleSelectionDTO {
  readonly perk: number
  readonly var1: number
  readonly var2: number
  readonly var3: number
}

/** A configured rune style (primary or secondary). */
export interface PerkStyleDTO {
  /** `"primaryStyle"` or `"subStyle"`. */
  readonly description: string
  readonly selections: PerkStyleSelectionDTO[]
  readonly style: number
}

/** A participant's full rune page. */
export interface PerksDTO {
  readonly statPerks: PerkStatsDTO
  readonly styles: PerkStyleDTO[]
}

/**
 * Per-participant challenge statistics. A large, mostly-optional flat map of
 * numbers; the well-known keys are typed for convenience and the index
 * signature keeps arbitrary/newer keys accessible.
 */
export interface ChallengesDTO {
  readonly [key: string]: number | number[] | undefined
  readonly kda?: number
  readonly killParticipation?: number
  readonly damagePerMinute?: number
  readonly damageTakenOnTeamPercentage?: number
  readonly goldPerMinute?: number
  readonly teamDamagePercentage?: number
  readonly visionScorePerMinute?: number
  readonly soloKills?: number
  readonly takedowns?: number
  readonly abilityUses?: number
  readonly skillshotsHit?: number
  readonly skillshotsDodged?: number
  readonly controlWardsPlaced?: number
  readonly wardTakedowns?: number
  readonly turretPlatesTaken?: number
  readonly dragonTakedowns?: number
  readonly baronTakedowns?: number
  readonly riftHeraldTakedowns?: number
  readonly effectiveHealAndShielding?: number
  readonly laneMinionsFirst10Minutes?: number
  readonly maxLevelLeadLaneOpponent?: number
  readonly gameLength?: number
  /** Item ids of legendary items used. */
  readonly legendaryItemUsed?: number[]
}

/** Arena/mode-specific mission scores. All optional. */
export interface MissionsDTO {
  readonly playerScore0?: number
  readonly playerScore1?: number
  readonly playerScore2?: number
  readonly playerScore3?: number
  readonly playerScore4?: number
  readonly playerScore5?: number
  readonly playerScore6?: number
  readonly playerScore7?: number
  readonly playerScore8?: number
  readonly playerScore9?: number
  readonly playerScore10?: number
  readonly playerScore11?: number
}

/** Newly-added behavioural telemetry. Shape is not fully documented by Riot. */
export interface ParticipantPlayerBehaviorDTO {
  readonly PlayerBehavior_IsHeroInCombat?: number
  readonly [key: string]: number | undefined
}

/**
 * A single participant in a MATCH-V5 game.
 *
 * @remarks
 * The core combat/economy stats are always present. Pings, `challenges`,
 * `missions`, Arena augment/subteam fields and the IGNB/severe-transgressor
 * fields only appear in certain modes or recent patches, so they are optional.
 */
export interface MatchParticipantDTO {
  readonly puuid: string
  readonly participantId: number
  readonly teamId: number
  readonly championId: number
  readonly championName: string
  /** Kayn transform: 0 none, 1 slayer, 2 assassin. */
  readonly championTransform: number
  readonly champLevel: number
  readonly champExperience: number
  readonly summonerLevel: number
  readonly profileIcon: number
  readonly riotIdGameName?: string
  readonly riotIdTagline?: string
  /** @deprecated Use {@link riotIdGameName}/{@link riotIdTagline}. */
  readonly summonerName?: string
  /** @deprecated Use {@link puuid}. */
  readonly summonerId?: string

  readonly kills: number
  readonly deaths: number
  readonly assists: number
  readonly doubleKills: number
  readonly tripleKills: number
  readonly quadraKills: number
  readonly pentaKills: number
  readonly unrealKills: number
  readonly largestKillingSpree: number
  readonly largestMultiKill: number
  readonly killingSprees: number
  readonly longestTimeSpentLiving: number
  readonly firstBloodKill: boolean
  readonly firstBloodAssist: boolean
  readonly firstTowerKill: boolean
  readonly firstTowerAssist: boolean

  readonly goldEarned: number
  readonly goldSpent: number
  readonly bountyLevel?: number
  readonly totalMinionsKilled: number
  readonly neutralMinionsKilled: number
  readonly totalAllyJungleMinionsKilled?: number
  readonly totalEnemyJungleMinionsKilled?: number

  readonly item0: number
  readonly item1: number
  readonly item2: number
  readonly item3: number
  readonly item4: number
  readonly item5: number
  readonly item6: number
  readonly itemsPurchased: number
  readonly consumablesPurchased: number
  readonly sightWardsBoughtInGame: number
  readonly visionWardsBoughtInGame: number
  readonly detectorWardsPlaced: number
  readonly wardsPlaced: number
  readonly wardsKilled: number
  readonly visionScore: number

  readonly totalDamageDealt: number
  readonly totalDamageDealtToChampions: number
  readonly totalDamageTaken: number
  readonly totalDamageShieldedOnTeammates: number
  readonly damageSelfMitigated: number
  readonly damageDealtToBuildings?: number
  readonly damageDealtToObjectives: number
  readonly damageDealtToTurrets: number
  readonly damageDealtToEpicMonsters?: number
  readonly physicalDamageDealt: number
  readonly physicalDamageDealtToChampions: number
  readonly physicalDamageTaken: number
  readonly magicDamageDealt: number
  readonly magicDamageDealtToChampions: number
  readonly magicDamageTaken: number
  readonly trueDamageDealt: number
  readonly trueDamageDealtToChampions: number
  readonly trueDamageTaken: number
  readonly largestCriticalStrike: number

  readonly totalHeal: number
  readonly totalHealsOnTeammates: number
  readonly totalUnitsHealed: number
  readonly totalTimeCCDealt: number
  readonly timeCCingOthers: number
  readonly totalTimeSpentDead: number
  readonly timePlayed: number

  readonly turretKills: number
  readonly turretTakedowns?: number
  readonly turretsLost?: number
  readonly inhibitorKills: number
  readonly inhibitorTakedowns?: number
  readonly inhibitorsLost?: number
  readonly nexusKills: number
  readonly nexusTakedowns?: number
  readonly nexusLost?: number
  readonly dragonKills: number
  readonly baronKills: number
  readonly objectivesStolen: number
  readonly objectivesStolenAssists: number

  readonly individualPosition: string
  readonly teamPosition: string
  readonly lane: string
  readonly role: string
  readonly positionAssignedByMatchmaking?: string
  readonly selectedRolePreferences?: string
  readonly roleBoundItem?: number

  readonly spell1Casts: number
  readonly spell2Casts: number
  readonly spell3Casts: number
  readonly spell4Casts: number
  readonly summoner1Id: number
  readonly summoner1Casts: number
  readonly summoner2Id: number
  readonly summoner2Casts: number
  readonly perks: PerksDTO

  readonly win: boolean
  readonly gameEndedInEarlySurrender: boolean
  readonly gameEndedInSurrender: boolean
  readonly teamEarlySurrendered: boolean
  readonly eligibleForProgression?: boolean

  // Pings (optional — absent before patch 12.x / in some modes)
  readonly allInPings?: number
  readonly assistMePings?: number
  readonly baitPings?: number
  readonly basicPings?: number
  readonly commandPings?: number
  readonly dangerPings?: number
  readonly enemyMissingPings?: number
  readonly enemyVisionPings?: number
  readonly getBackPings?: number
  readonly holdPings?: number
  readonly needVisionPings?: number
  readonly onMyWayPings?: number
  readonly pushPings?: number
  readonly retreatPings?: number
  readonly visionClearedPings?: number

  readonly challenges?: ChallengesDTO
  readonly missions?: MissionsDTO
  readonly PlayerBehavior?: ParticipantPlayerBehaviorDTO

  // Arena (Cherry) only
  readonly placement?: number
  readonly subteamPlacement?: number
  readonly playerSubteamId?: number
  readonly playerAugment1?: number
  readonly playerAugment2?: number
  readonly playerAugment3?: number
  readonly playerAugment4?: number
  readonly playerAugment5?: number
  readonly playerAugment6?: number

  // IGNB / severe-transgressor telemetry (newer, optional)
  readonly causedGameEndFromIGNBSurrender?: boolean
  readonly gameEndedInIGNBSurrender?: boolean
  readonly teamIGNBSurrendered?: boolean
  readonly wasPremadeWithIGNBGameEndCauser?: boolean
  readonly wasPremadeWithSevereTransgressor?: boolean
  readonly wasSevereTransgressor?: boolean
}

/** A champion ban in the draft. */
export interface BanDTO {
  readonly championId: number
  readonly pickTurn: number
}

/** Kill/first-blood counters for a single objective. */
export interface ObjectiveDTO {
  readonly first: boolean
  readonly kills: number
}

/** Per-team objective summary. `horde` and `atakhan` are recent additions. */
export interface ObjectivesDTO {
  readonly baron: ObjectiveDTO
  readonly champion: ObjectiveDTO
  readonly dragon: ObjectiveDTO
  readonly inhibitor: ObjectiveDTO
  readonly riftHerald: ObjectiveDTO
  readonly tower: ObjectiveDTO
  /** Void Grubs. Present since late 2023. */
  readonly horde?: ObjectiveDTO
  /** Atakhan. Present since Season 2025. */
  readonly atakhan?: ObjectiveDTO
}

/** State of a single "feat of strength". */
export interface FeatDTO {
  readonly featState: number
}

/** Team feats of strength (Season 2025+). Optional. */
export interface FeatsDTO {
  readonly EPIC_MONSTER_KILL?: FeatDTO
  readonly FIRST_BLOOD?: FeatDTO
  readonly FIRST_TURRET?: FeatDTO
}

/** A team in a MATCH-V5 game. */
export interface MatchTeamDTO {
  readonly teamId: number
  readonly win: boolean
  readonly bans: BanDTO[]
  readonly objectives: ObjectivesDTO
  /** Feats of strength. Present since Season 2025. */
  readonly feats?: FeatsDTO
}

/** MATCH-V5 game info block. */
export interface MatchInfoDTO {
  readonly gameId: number
  readonly gameCreation: number
  readonly gameDuration: number
  readonly gameStartTimestamp: number
  readonly gameMode: string
  readonly gameName: string
  readonly gameType: string
  readonly gameVersion: string
  readonly mapId: number
  readonly platformId: string
  readonly queueId: number
  readonly participants: MatchParticipantDTO[]
  readonly teams: MatchTeamDTO[]
  /** Unix ms when the match ended. Added patch 11.20. */
  readonly gameEndTimestamp?: number
  /** Tournament code used to generate the match, if any. */
  readonly tournamentCode?: string
  /** Termination reason, e.g. `"GameComplete"`. */
  readonly endOfGameResult?: string
  /** Active game-mode mutators, if any. */
  readonly gameModeMutators?: string[]
}

/** A full MATCH-V5 match. */
export interface MatchDTO {
  readonly metadata: MatchMetadataDTO
  readonly info: MatchInfoDTO
}
