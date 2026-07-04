/** A Data Dragon sprite image reference. */
export interface DDragonImageDTO {
  readonly full: string
  readonly sprite: string
  readonly group: string
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

/** A champion's difficulty ratings on the champion select screen. */
export interface DDragonChampionInfoDTO {
  readonly attack: number
  readonly defense: number
  readonly magic: number
  readonly difficulty: number
}

/** A champion summary from the champion list (`champion.json`). */
export interface DDragonChampionSummaryDTO {
  readonly version: string
  readonly id: string
  readonly key: string
  readonly name: string
  readonly title: string
  readonly blurb: string
  readonly info: DDragonChampionInfoDTO
  readonly image: DDragonImageDTO
  readonly tags: string[]
  readonly partype: string
  readonly stats: Record<string, number>
}

/** The full champion list, keyed by champion id. */
export interface DDragonChampionListDTO {
  readonly type: string
  readonly format: string
  readonly version: string
  readonly data: Record<string, DDragonChampionSummaryDTO>
}

/** A champion spell (Q/W/E/R). */
export interface DDragonSpellDTO {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tooltip: string
  readonly cooldown: number[]
  readonly cost: number[]
  readonly range: number[]
  readonly image: DDragonImageDTO
  readonly [key: string]: unknown
}

/** Detailed champion data (`champion/{Name}.json`). */
export interface DDragonChampionDetailDTO extends DDragonChampionSummaryDTO {
  readonly lore: string
  readonly allytips: string[]
  readonly enemytips: string[]
  readonly spells: DDragonSpellDTO[]
  readonly passive: {
    readonly name: string
    readonly description: string
    readonly image: DDragonImageDTO
  }
  readonly skins: Array<{
    readonly id: string
    readonly num: number
    readonly name: string
    readonly chromas: boolean
  }>
}

/** A Data Dragon realm descriptor. */
export interface DDragonRealmDTO {
  readonly n: Record<string, string>
  readonly v: string
  readonly l: string
  readonly cdn: string
  readonly dd: string
  readonly lg: string
  readonly css: string
  readonly profileiconmax: number
  readonly store: unknown
}

/** A rune within a reforged path slot. */
export interface DDragonRuneDTO {
  readonly id: number
  readonly key: string
  readonly icon: string
  readonly name: string
  readonly shortDesc: string
  readonly longDesc: string
}

/** A reforged rune path (Precision, Domination, …). */
export interface DDragonRunesReforgedDTO {
  readonly id: number
  readonly key: string
  readonly icon: string
  readonly name: string
  readonly slots: Array<{ readonly runes: DDragonRuneDTO[] }>
}

/** A queue descriptor from the static queues list. */
export interface DDragonQueueDTO {
  readonly queueId: number
  readonly map: string
  readonly description: string | null
  readonly notes: string | null
}

/** A map descriptor from the static maps list. */
export interface DDragonMapDTO {
  readonly mapId: number
  readonly mapName: string
  readonly notes: string
}

/** A game-mode descriptor from the static game-modes list. */
export interface DDragonGameModeDTO {
  readonly gameMode: string
  readonly description: string
}

/** A game-type descriptor from the static game-types list. */
export interface DDragonGameTypeDTO {
  readonly gametype: string
  readonly description: string
}

/** A season descriptor from the static seasons list. */
export interface DDragonSeasonDTO {
  readonly id: number
  readonly season: string
}
