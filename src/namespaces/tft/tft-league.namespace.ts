import type {
  TftLeagueEntryDTO,
  TftLeagueListDTO,
  TftRatedLadderEntryDTO,
} from '../../dto/tft/league.dto'
import { TFT_ENDPOINTS } from '../../endpoints/tft'
import type { Collection } from '../../entities/collection'
import { TftLeagueEntryEntity } from '../../entities/tft/tft-league-entry.entity'
import { TftLeagueListEntity } from '../../entities/tft/tft-league-list.entity'
import { TftRatedLadderEntryEntity } from '../../entities/tft/tft-rated-ladder-entry.entity'
import type { Division, Tier } from '../../enums/ranked'
import type { Region } from '../../enums/region'
import { TftRatedLadderQueue } from '../../enums/tft'
import { BaseNamespace } from '../base-namespace'

const DEFAULT_START_PAGE = 1

/**
 * TFT-LEAGUE-V1 methods.
 */
export class TftLeagueNamespace extends BaseNamespace {
  /**
   * Get a player's TFT ranked entries by PUUID.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  async byPuuid(puuid: string, region: Region): Promise<Collection<TftLeagueEntryEntity>> {
    const fetched = await this.executor.request<TftLeagueEntryDTO[]>(
      region,
      TFT_ENDPOINTS.leagueByPuuid,
      { pathParams: { puuid } },
    )
    return this.toCollection(TftLeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a player's TFT ranked entries by encrypted summoner id.
   *
   * @param summonerId - The encrypted summoner id.
   * @param region - The platform region.
   * @deprecated Riot is phasing out encrypted summoner ids — prefer {@link byPuuid}.
   */
  async bySummonerId(
    summonerId: string,
    region: Region,
  ): Promise<Collection<TftLeagueEntryEntity>> {
    const fetched = await this.executor.request<TftLeagueEntryDTO[]>(
      region,
      TFT_ENDPOINTS.leagueEntriesBySummoner,
      { pathParams: { summonerId } },
    )
    return this.toCollection(TftLeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a page of TFT ranked entries for a tier/division.
   *
   * @param tier - Ranked tier.
   * @param division - Division within the tier.
   * @param region - The platform region.
   * @param page - Page number (1-indexed). Default `1`.
   */
  async entries(
    tier: Tier,
    division: Division,
    region: Region,
    page = DEFAULT_START_PAGE,
  ): Promise<Collection<TftLeagueEntryEntity>> {
    const fetched = await this.executor.request<TftLeagueEntryDTO[]>(
      region,
      TFT_ENDPOINTS.leagueEntries,
      { pathParams: { tier, division }, query: { page } },
    )
    return this.toCollection(TftLeagueEntryEntity, fetched, this.regionContext(region))
  }

  /**
   * Get the TFT Challenger league.
   *
   * @param region - The platform region.
   */
  challenger(region: Region): Promise<TftLeagueListEntity> {
    return this.leagueList(TFT_ENDPOINTS.leagueChallenger, region)
  }

  /**
   * Get the TFT Grandmaster league.
   *
   * @param region - The platform region.
   */
  grandmaster(region: Region): Promise<TftLeagueListEntity> {
    return this.leagueList(TFT_ENDPOINTS.leagueGrandmaster, region)
  }

  /**
   * Get the TFT Master league.
   *
   * @param region - The platform region.
   */
  master(region: Region): Promise<TftLeagueListEntity> {
    return this.leagueList(TFT_ENDPOINTS.leagueMaster, region)
  }

  /**
   * Get a TFT league by id.
   *
   * @param leagueId - The league id.
   * @param region - The platform region.
   */
  async byId(leagueId: string, region: Region): Promise<TftLeagueListEntity> {
    const fetched = await this.executor.request<TftLeagueListDTO>(
      region,
      TFT_ENDPOINTS.leagueById,
      { pathParams: { leagueId } },
    )
    return this.toEntity(TftLeagueListEntity, fetched, this.regionContext(region))
  }

  /**
   * Get the top of the Hyper Roll rated ladder.
   *
   * @param region - The platform region.
   * @param queue - Rated-ladder queue. Defaults to Hyper Roll.
   */
  async ratedLadder(
    region: Region,
    queue: TftRatedLadderQueue = TftRatedLadderQueue.HYPER_ROLL,
  ): Promise<Collection<TftRatedLadderEntryEntity>> {
    const fetched = await this.executor.request<TftRatedLadderEntryDTO[]>(
      region,
      TFT_ENDPOINTS.leagueRatedLadder,
      { pathParams: { queue } },
    )
    return this.toCollection(TftRatedLadderEntryEntity, fetched, this.regionContext(region))
  }

  private async leagueList(
    endpoint: (typeof TFT_ENDPOINTS)['leagueChallenger' | 'leagueGrandmaster' | 'leagueMaster'],
    region: Region,
  ): Promise<TftLeagueListEntity> {
    const fetched = await this.executor.request<TftLeagueListDTO>(region, endpoint)
    return this.toEntity(TftLeagueListEntity, fetched, this.regionContext(region))
  }
}
