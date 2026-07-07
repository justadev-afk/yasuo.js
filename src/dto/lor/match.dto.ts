/**
 * Match metadata (LOR-MATCH-V1).
 */
export interface LorMatchMetadataDTO {
  /** Match data schema version. */
  readonly dataVersion: string
  /** The match id. */
  readonly matchId: string
  /** PUUIDs of the participants. */
  readonly participants: string[]
}

/**
 * A participant in a Legends of Runeterra match.
 */
export interface LorMatchPlayerDTO {
  readonly puuid: string
  /** Player's deck id for this game. */
  readonly deckId: string
  /** Base64 deck code played. */
  readonly deckCode: string
  /** Faction identifiers in the deck. */
  readonly factions: string[]
  /** `win` or `loss`. */
  readonly gameOutcome: string
  /** 1 if the player moved first, 0 otherwise. */
  readonly orderOfPlay: number
}

/**
 * Match info (LOR-MATCH-V1).
 */
export interface LorMatchInfoDTO {
  /** `Constructed`, `Expeditions` or `Tutorial`. */
  readonly gameMode: string
  /** `Ranked`, `Normal`, `AI`, `Tutorial`, `VanillaTrial`, `Singleton`, `StandardGauntlet`. */
  readonly gameType: string
  /** ISO-8601 start time (UTC). */
  readonly gameStartTimeUtc: string
  readonly gameVersion: string
  readonly players: LorMatchPlayerDTO[]
  /** Total turns taken in the game. */
  readonly totalTurnCount: number
}

/**
 * A full Legends of Runeterra match, as returned by LOR-MATCH-V1
 * `matches/{matchId}`.
 */
export interface LorMatchDTO {
  readonly metadata: LorMatchMetadataDTO
  readonly info: LorMatchInfoDTO
}
