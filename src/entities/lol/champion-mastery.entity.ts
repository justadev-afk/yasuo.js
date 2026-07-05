import type { DDragonChampionSummaryDTO } from '../../dto/data-dragon/data-dragon.dto'
import type { ChampionMasteryDTO } from '../../dto/lol/champion.dto'
import type { Region } from '../../enums/region'
import { Entity } from '../entity'
import type { SummonerRef } from './summoner-ref'

export interface ChampionMasteryEntity extends ChampionMasteryDTO {}

/**
 * A champion mastery entry with lazy relations to its summoner and to the
 * champion's static Data Dragon data.
 *
 * @example
 * ```ts
 * const [top] = await yasuo.lol.mastery.top(puuid, Region.KR, 1)
 * const champ = await top.champion() // Data Dragon summary for the champion
 * ```
 */
export class ChampionMasteryEntity extends Entity<ChampionMasteryDTO> {
  private get region(): Region {
    return this.context.region as Region
  }

  /**
   * Resolve the champion's static Data Dragon data, or `null` if the id is not
   * present in the latest patch.
   */
  champion(): Promise<DDragonChampionSummaryDTO | null> {
    return this.context.client.dataDragon.championById(this.championId)
  }

  /** Resolve the summoner this mastery belongs to (chainable). */
  summoner(): SummonerRef {
    return this.context.client.lol.summoner.byPuuid(this.puuid, this.region)
  }
}
