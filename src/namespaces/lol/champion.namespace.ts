import type { ChampionRotationDTO } from '../../dto/lol/champion.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import { ChampionRotationEntity } from '../../entities/lol/champion-rotation.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * CHAMPION-V3 methods.
 */
export class LolChampionNamespace extends BaseNamespace {
  /**
   * Get the current free champion rotation.
   *
   * @param region - The platform region.
   */
  async rotation(region: Region): Promise<ChampionRotationEntity> {
    const fetched = await this.executor.request<ChampionRotationDTO>(
      region,
      LOL_ENDPOINTS.championRotation,
    )
    return this.toEntity(ChampionRotationEntity, fetched, this.regionContext(region))
  }
}
