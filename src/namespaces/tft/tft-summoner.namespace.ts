import type { SummonerDTO } from '../../dto/lol/summoner.dto'
import { TFT_ENDPOINTS } from '../../endpoints/tft'
import { TftSummonerRef } from '../../entities/tft/tft-summoner-ref'
import { TftSummonerEntity } from '../../entities/tft/tft-summoner.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * TFT-SUMMONER-V1 methods.
 */
export class TftSummonerNamespace extends BaseNamespace {
  /**
   * Get a TFT summoner by PUUID.
   *
   * Returns a lazy, chainable {@link TftSummonerRef}.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  byPuuid(puuid: string, region: Region): TftSummonerRef {
    return new TftSummonerRef(this.client, puuid, region, () => this.fetchByPuuid(puuid, region))
  }

  private async fetchByPuuid(puuid: string, region: Region): Promise<TftSummonerEntity> {
    const fetched = await this.executor.request<SummonerDTO>(
      region,
      TFT_ENDPOINTS.summonerByPuuid,
      {
        pathParams: { puuid },
      },
    )
    return this.toEntity(TftSummonerEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a TFT summoner by encrypted summoner id.
   *
   * @param summonerId - The encrypted summoner id.
   * @param region - The platform region.
   * @deprecated Prefer {@link byPuuid}.
   */
  async byId(summonerId: string, region: Region): Promise<TftSummonerEntity> {
    const fetched = await this.executor.request<SummonerDTO>(region, TFT_ENDPOINTS.summonerById, {
      pathParams: { summonerId },
    })
    return this.toEntity(TftSummonerEntity, fetched, this.regionContext(region))
  }
}
