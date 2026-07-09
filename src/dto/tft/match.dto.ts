/**
 * The little legend / companion a player used, from TFT-MATCH-V1.
 *
 * @remarks Field names are snake_case + PascalCase exactly as Riot returns them.
 */
export interface TftCompanionDTO {
  readonly content_ID: string
  readonly item_ID: number
  readonly skin_ID: number
  readonly species: string
}

/** A synergy/trait a player had active. */
export interface TftTraitDTO {
  /** Trait id, e.g. `TFT17_APTrait`. */
  readonly name: string
  /** Number of units contributing to the trait. */
  readonly num_units: number
  /** Current tier of the active trait. */
  readonly tier_current: number
  /** Style: 0 none, 1 bronze, 2 silver, 3 gold, 4 chromatic. */
  readonly style?: number
  /** Total number of tiers the trait has. */
  readonly tier_total?: number
}

/** A champion unit a player fielded. */
export interface TftUnitDTO {
  /** Character id, e.g. `TFT17_Teemo`. */
  readonly character_id: string
  /** Display name (often empty). */
  readonly name: string
  /** Unit rarity/cost tier. */
  readonly rarity: number
  /** Star level (1–3). */
  readonly tier: number
  /** Equipped item ids. */
  readonly items?: number[]
  /** Equipped item names. */
  readonly itemNames?: string[]
  /** Chosen trait (legacy sets). */
  readonly chosen?: string
}

/** A player in a TFT match. */
export interface TftParticipantDTO {
  readonly puuid: string
  readonly companion: TftCompanionDTO
  /** Gold left over at elimination. */
  readonly gold_left: number
  /** The last round the player survived to. */
  readonly last_round: number
  /** Player level at elimination. */
  readonly level: number
  /** Final placement (1–8). */
  readonly placement: number
  /** Number of players this player eliminated. */
  readonly players_eliminated: number
  /** Time the player was eliminated, in seconds. */
  readonly time_eliminated: number
  /** Total damage dealt to other players. */
  readonly total_damage_to_players: number
  readonly traits: TftTraitDTO[]
  readonly units: TftUnitDTO[]
  /** Whether the player won (present in some modes). */
  readonly win?: boolean
  /** Augment ids/names chosen. */
  readonly augments?: string[]
  /** Double Up partner group id. */
  readonly partner_group_id?: number
  /** Mode-specific mission scores (flat map, all optional). */
  readonly missions?: Record<string, number>
  /** Hero-augment / skill-tree picks (id → level). Present in some modes. */
  readonly skill_tree?: Record<string, number>
  /** PvE score (PvE game modes only, e.g. Tocker's Trials). */
  readonly pve_score?: number
  /** Whether the player won their PvE run (PvE game modes only). */
  readonly pve_wonrun?: boolean
  readonly riotIdGameName?: string
  readonly riotIdTagline?: string
}

/** TFT-MATCH-V1 metadata block (snake_case). */
export interface TftMatchMetadataDTO {
  readonly data_version: string
  readonly match_id: string
  readonly participants: string[]
}

/** TFT-MATCH-V1 info block. */
export interface TftMatchInfoDTO {
  /** Game start time, as epoch milliseconds. */
  readonly game_datetime: number
  /** Game length, in seconds. */
  readonly game_length: number
  /** Game client version. */
  readonly game_version: string
  /** TFT set number, e.g. `17`. */
  readonly tft_set_number: number
  /** Numeric queue id. */
  readonly queue_id: number
  readonly participants: TftParticipantDTO[]
  /** Game type, e.g. `standard`. */
  readonly tft_game_type?: string
  /** Set core name, e.g. `TFTSet17`. */
  readonly tft_set_core_name?: string
  /** @deprecated Legacy game variation. */
  readonly game_variation?: string
  readonly endOfGameResult?: string
  readonly gameCreation?: number
  readonly gameId?: number
  readonly mapId?: number
  /** camelCase duplicate of {@link queue_id}. */
  readonly queueId?: number
}

/** A full TFT match. */
export interface TftMatchDTO {
  readonly metadata: TftMatchMetadataDTO
  readonly info: TftMatchInfoDTO
}
