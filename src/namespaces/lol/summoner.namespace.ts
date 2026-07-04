import type { SummonerDTO } from '../../dto/lol/summoner.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import { SummonerRef } from '../../entities/lol/summoner-ref'
import { SummonerEntity } from '../../entities/lol/summoner.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * SUMMONER-V4 methods.
 */
export class LolSummonerNamespace extends BaseNamespace {
  /**
   * Get a summoner by PUUID.
   *
   * Returns a lazy, chainable {@link SummonerRef}: `await` it to fetch the
   * summoner, or call a relation (e.g. `.matches()`) to fetch **only** that
   * related resource — the summoner request is skipped entirely.
   *
   * @param puuid - The player's encrypted PUUID.
   * @param region - The platform region.
   * @example
   * ```ts
   * // One request:
   * const matches = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matches({ count: 5 })
   * ```
   */
  byPuuid(puuid: string, region: Region): SummonerRef {
    return new SummonerRef(this.client, puuid, region, () => this.fetchByPuuid(puuid, region))
  }

  private async fetchByPuuid(puuid: string, region: Region): Promise<SummonerEntity> {
    const fetched = await this.executor.request<SummonerDTO>(
      region,
      LOL_ENDPOINTS.summonerByPuuid,
      {
        pathParams: { puuid },
      },
    )
    return this.toEntity(SummonerEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a summoner by encrypted summoner id.
   *
   * @param summonerId - The encrypted summoner id.
   * @param region - The platform region.
   * @deprecated Riot is phasing out encrypted summoner ids — prefer {@link byPuuid}.
   */
  async byId(summonerId: string, region: Region): Promise<SummonerEntity> {
    const fetched = await this.executor.request<SummonerDTO>(region, LOL_ENDPOINTS.summonerById, {
      pathParams: { summonerId },
    })
    return this.toEntity(SummonerEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a summoner by encrypted account id.
   *
   * @param accountId - The encrypted account id.
   * @param region - The platform region.
   * @deprecated Account ids are no longer returned by Riot — prefer {@link byPuuid}.
   */
  async byAccountId(accountId: string, region: Region): Promise<SummonerEntity> {
    const fetched = await this.executor.request<SummonerDTO>(
      region,
      LOL_ENDPOINTS.summonerByAccount,
      { pathParams: { accountId } },
    )
    return this.toEntity(SummonerEntity, fetched, this.regionContext(region))
  }
}
