import type { ChampionMasteryDTO } from '../../dto/lol/champion.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import type { Collection } from '../../entities/collection'
import { ChampionMasteryEntity } from '../../entities/lol/champion-mastery.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * CHAMPION-MASTERY-V4 methods.
 */
export class LolMasteryNamespace extends BaseNamespace {
  /**
   * Get all champion mastery entries for a player.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  async byPuuid(puuid: string, region: Region): Promise<Collection<ChampionMasteryEntity>> {
    const fetched = await this.executor.request<ChampionMasteryDTO[]>(
      region,
      LOL_ENDPOINTS.masteryByPuuid,
      { pathParams: { puuid } },
    )
    return this.toCollection(ChampionMasteryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a player's mastery of a single champion.
   *
   * @param puuid - The player's PUUID.
   * @param championId - The champion id.
   * @param region - The platform region.
   */
  async byChampion(
    puuid: string,
    championId: number,
    region: Region,
  ): Promise<ChampionMasteryEntity> {
    const fetched = await this.executor.request<ChampionMasteryDTO>(
      region,
      LOL_ENDPOINTS.masteryByPuuidChampion,
      { pathParams: { puuid, championId } },
    )
    return this.toEntity(ChampionMasteryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a player's highest champion masteries.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   * @param count - How many top entries to return (Riot defaults to 3).
   */
  async top(
    puuid: string,
    region: Region,
    count?: number,
  ): Promise<Collection<ChampionMasteryEntity>> {
    const fetched = await this.executor.request<ChampionMasteryDTO[]>(
      region,
      LOL_ENDPOINTS.masteryTop,
      { pathParams: { puuid }, query: { count } },
    )
    return this.toCollection(ChampionMasteryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a player's total champion mastery score.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   * @returns The raw numeric score.
   */
  async score(puuid: string, region: Region): Promise<number> {
    const fetched = await this.executor.request<number>(region, LOL_ENDPOINTS.masteryScore, {
      pathParams: { puuid },
    })
    return typeof fetched.data === 'number' ? fetched.data : 0
  }
}
