import type { ClashPlayerDTO, ClashTeamDTO, ClashTournamentDTO } from '../../dto/lol/clash.dto'
import { LOL_ENDPOINTS } from '../../endpoints/lol'
import type { Collection } from '../../entities/collection'
import { ClashPlayerEntity } from '../../entities/lol/clash-player.entity'
import { ClashTeamEntity } from '../../entities/lol/clash-team.entity'
import { ClashTournamentEntity } from '../../entities/lol/clash-tournament.entity'
import type { Region } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * CLASH-V1 methods.
 */
export class LolClashNamespace extends BaseNamespace {
  /**
   * Get a player's active Clash registrations by PUUID.
   *
   * @param puuid - The player's PUUID.
   * @param region - The platform region.
   */
  async playersByPuuid(puuid: string, region: Region): Promise<Collection<ClashPlayerEntity>> {
    const fetched = await this.executor.request<ClashPlayerDTO[]>(
      region,
      LOL_ENDPOINTS.clashPlayersByPuuid,
      { pathParams: { puuid } },
    )
    return this.toCollection(ClashPlayerEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a Clash team by id.
   *
   * @param teamId - The team id.
   * @param region - The platform region.
   */
  async teamById(teamId: string, region: Region): Promise<ClashTeamEntity> {
    const fetched = await this.executor.request<ClashTeamDTO>(region, LOL_ENDPOINTS.clashTeamById, {
      pathParams: { teamId },
    })
    return this.toEntity(ClashTeamEntity, fetched, this.regionContext(region))
  }

  /**
   * Get active and upcoming Clash tournaments.
   *
   * @param region - The platform region.
   */
  async tournaments(region: Region): Promise<Collection<ClashTournamentEntity>> {
    const fetched = await this.executor.request<ClashTournamentDTO[]>(
      region,
      LOL_ENDPOINTS.clashTournaments,
    )
    return this.toCollection(ClashTournamentEntity, fetched, this.regionContext(region))
  }

  /**
   * Get the tournament a team is registered for.
   *
   * @param teamId - The team id.
   * @param region - The platform region.
   */
  async tournamentByTeam(teamId: string, region: Region): Promise<ClashTournamentEntity> {
    const fetched = await this.executor.request<ClashTournamentDTO>(
      region,
      LOL_ENDPOINTS.clashTournamentByTeam,
      { pathParams: { teamId } },
    )
    return this.toEntity(ClashTournamentEntity, fetched, this.regionContext(region))
  }

  /**
   * Get a Clash tournament by id.
   *
   * @param tournamentId - The tournament id.
   * @param region - The platform region.
   */
  async tournamentById(
    tournamentId: number | string,
    region: Region,
  ): Promise<ClashTournamentEntity> {
    const fetched = await this.executor.request<ClashTournamentDTO>(
      region,
      LOL_ENDPOINTS.clashTournamentById,
      { pathParams: { tournamentId } },
    )
    return this.toEntity(ClashTournamentEntity, fetched, this.regionContext(region))
  }
}
