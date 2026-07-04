import type { ChampionRotationDTO } from '../../dto/lol/champion.dto'
import { Entity } from '../entity'

export interface ChampionRotationEntity extends ChampionRotationDTO {}

/**
 * The free champion rotation with response metadata.
 *
 * Exposes normalised {@link freeChampions} / {@link newPlayerChampions}
 * accessors so callers get a stable API regardless of whether Riot returns the
 * current (`sr`/`newplayer`) or legacy (`freeChampionIds`/…) payload shape.
 */
export class ChampionRotationEntity extends Entity<ChampionRotationDTO> {
  /** Champion ids free to play on Summoner's Rift, across API shapes. */
  get freeChampions(): number[] {
    return this.sr ?? this.freeChampionIds ?? []
  }

  /** Champion ids free to play for new players, across API shapes. */
  get newPlayerChampions(): number[] {
    return this.newplayer ?? this.freeChampionIdsForNewPlayers ?? []
  }
}
