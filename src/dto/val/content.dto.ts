/**
 * Localised display names for a content item, keyed by Riot locale
 * (`en-US`, `ko-KR`, `es-ES`, …). Present only when the `locale` query
 * parameter is omitted; otherwise a single localised `name` is returned instead.
 */
export type ValLocalizedNamesDTO = Readonly<Record<string, string>>

/**
 * A single VALORANT content item (a character, map, skin, spray, …).
 */
export interface ValContentItemDTO {
  /** Display name (localised when a `locale` was requested). */
  readonly name: string
  /** Item id (UUID). Absent on a few legacy items. */
  readonly id?: string
  /** Stable asset identifier. */
  readonly assetName: string
  /** Asset path; present for some item types when no `locale` is requested. */
  readonly assetPath?: string
  /** Per-locale names; present only when the `locale` parameter is omitted. */
  readonly localizedNames?: ValLocalizedNamesDTO
}

/**
 * A VALORANT act (a competitive season chapter), which additionally tracks
 * whether it is the currently active act.
 */
export interface ValActDTO extends ValContentItemDTO {
  /** Act id (UUID). */
  readonly id: string
  /** Whether this is the currently active act. */
  readonly isActive: boolean
  /** Act type, when provided (e.g. `act`, `episode`). */
  readonly type?: string
  /** Parent episode id, for acts nested under an episode. */
  readonly parentId?: string
}

/**
 * VALORANT static content, as returned by VAL-CONTENT-V1. Each field is the list
 * of that item type currently live on the shard.
 */
export interface ValContentDTO {
  /** Content version string. */
  readonly version: string
  readonly characters: ValContentItemDTO[]
  readonly maps: ValContentItemDTO[]
  readonly chromas: ValContentItemDTO[]
  readonly skins: ValContentItemDTO[]
  readonly skinLevels: ValContentItemDTO[]
  readonly equips: ValContentItemDTO[]
  readonly gameModes: ValContentItemDTO[]
  readonly sprays: ValContentItemDTO[]
  readonly sprayLevels: ValContentItemDTO[]
  readonly charms: ValContentItemDTO[]
  readonly charmLevels: ValContentItemDTO[]
  readonly playerCards: ValContentItemDTO[]
  readonly playerTitles: ValContentItemDTO[]
  /** Competitive acts, each flagged `isActive`. */
  readonly acts: ValActDTO[]
  /** Round-end ceremonies (present on newer content versions). */
  readonly ceremonies?: ValContentItemDTO[]
  /** Totems (present on newer content versions). */
  readonly totems?: ValContentItemDTO[]
}
