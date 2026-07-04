import type {
  AllChallengePercentilesDTO,
  ChallengeApexPlayerDTO,
  ChallengeConfigDTO,
  ChallengePercentilesDTO,
  PlayerChallengesDTO,
} from '../../dto/lol/challenges.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import type { Collection } from '../../entities/collection'
import { ChallengeConfigEntity } from '../../entities/lol/challenge-config.entity'
import { ChallengePercentilesEntity } from '../../entities/lol/challenge-percentiles.entity'
import { PlayerChallengesEntity } from '../../entities/lol/player-challenges.entity'
import type { ChallengeLevel } from '../../enums/challenge'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * LOL-CHALLENGES-V1 methods.
 */
export class LolChallengesNamespace extends BaseNamespace {
  /**
   * Get the configuration of every challenge.
   *
   * @param region - The platform region.
   */
  async config(region: Region): Promise<Collection<ChallengeConfigEntity>> {
    const fetched = await this.executor.request<ChallengeConfigDTO[]>(
      region,
      LOL_ENDPOINTS.challengesConfig,
    )
    return this.toCollection(ChallengeConfigEntity, fetched, this.regionContext(region))
  }

  /**
   * Get the percentile distributions of every challenge, keyed by challenge id
   * then tier.
   *
   * @param region - The platform region.
   */
  async percentiles(region: Region): Promise<AllChallengePercentilesDTO> {
    const fetched = await this.executor.request<AllChallengePercentilesDTO>(
      region,
      LOL_ENDPOINTS.challengesPercentiles,
    )
    return fetched.data
  }

  /**
   * Get the configuration of a single challenge.
   *
   * @param challengeId - The challenge id.
   * @param region - The platform region.
   */
  async configById(challengeId: number, region: Region): Promise<ChallengeConfigEntity> {
    const fetched = await this.executor.request<ChallengeConfigDTO>(
      region,
      LOL_ENDPOINTS.challengeConfigById,
      { pathParams: { challengeId } },
    )
    return this.toEntity(ChallengeConfigEntity, fetched, this.regionContext(region))
  }

  /**
   * Get the leaderboard (apex players) for a challenge at a given level.
   *
   * @param challengeId - The challenge id.
   * @param level - The level (`MASTER`, `GRANDMASTER` or `CHALLENGER`).
   * @param region - The platform region.
   * @param limit - Optional maximum number of entries.
   */
  async leaderboards(
    challengeId: number,
    level: ChallengeLevel,
    region: Region,
    limit?: number,
  ): Promise<Collection<ChallengeApexPlayerDTO>> {
    const fetched = await this.executor.request<ChallengeApexPlayerDTO[]>(
      region,
      LOL_ENDPOINTS.challengeLeaderboards,
      { pathParams: { challengeId, level }, query: { limit } },
    )
    return this.toScalarCollection(fetched)
  }

  /**
   * Get the percentile distribution of a single challenge, keyed by tier.
   *
   * @param challengeId - The challenge id.
   * @param region - The platform region.
   */
  async percentilesById(challengeId: number, region: Region): Promise<ChallengePercentilesEntity> {
    const fetched = await this.executor.request<ChallengePercentilesDTO>(
      region,
      LOL_ENDPOINTS.challengePercentilesById,
      { pathParams: { challengeId } },
    )
    return this.toEntity(ChallengePercentilesEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a player's challenge progress.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  async player(puuid: string, region: Region): Promise<PlayerChallengesEntity> {
    const fetched = await this.executor.request<PlayerChallengesDTO>(
      region,
      LOL_ENDPOINTS.challengesPlayer,
      { pathParams: { puuid } },
    )
    return this.toEntity(PlayerChallengesEntity, fetched, this.regionContext(region))
  }
}
