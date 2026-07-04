import type { CurrentGameInfoDTO, FeaturedGamesDTO } from '../../dto/lol/spectator.dto'
import { TFT_ENDPOINTS } from '../../endpoints/tft'
import { CurrentGameEntity } from '../../entities/lol/current-game.entity'
import { FeaturedGamesEntity } from '../../entities/lol/featured-games.entity'
import type { Region } from '../../enums/region'
import { NotFoundError } from '../../errors'
import { BaseNamespace } from '../base-namespace'

/**
 * SPECTATOR-TFT-V5 methods. Shares the spectator payload shape with LoL.
 */
export class TftSpectatorNamespace extends BaseNamespace {
  /**
   * Get a player's active (live) TFT game.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   * @returns The current game, or `null` if the player is not in one.
   */
  async active(puuid: string, region: Region): Promise<CurrentGameEntity | null> {
    try {
      const fetched = await this.executor.request<CurrentGameInfoDTO>(
        region,
        TFT_ENDPOINTS.spectatorActive,
        { pathParams: { puuid } },
      )
      return this.toEntity(CurrentGameEntity, fetched, this.regionContext(region))
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null
      }
      throw error
    }
  }

  /**
   * Get the list of featured TFT games.
   *
   * @param region - The platform region.
   * @remarks Development API keys often receive `403` from this endpoint.
   */
  async featured(region: Region): Promise<FeaturedGamesEntity> {
    const fetched = await this.executor.request<FeaturedGamesDTO>(
      region,
      TFT_ENDPOINTS.spectatorFeatured,
    )
    return this.toEntity(FeaturedGamesEntity, fetched, this.regionContext(region))
  }
}
