import type { PlatformDataDTO } from '../../dto/lol/status.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import { PlatformStatusEntity } from '../../entities/lol/platform-status.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * LOL-STATUS-V4 methods.
 */
export class LolStatusNamespace extends BaseNamespace {
  /**
   * Get the platform status for a region (maintenances and incidents).
   *
   * @param region - The platform region.
   */
  async get(region: Region): Promise<PlatformStatusEntity> {
    const fetched = await this.executor.request<PlatformDataDTO>(region, LOL_ENDPOINTS.status)
    return this.toEntity(PlatformStatusEntity, fetched, this.regionContext(region))
  }
}
