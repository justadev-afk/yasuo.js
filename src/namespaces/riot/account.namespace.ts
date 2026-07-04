import type { AccountDTO, AccountRegionDTO, ActiveShardDTO } from '../../dto/riot/account.dto'
import { RIOT_ENDPOINTS } from '../../endpoints/riot'
import { AccountRegionEntity } from '../../entities/riot/account-region.entity'
import { AccountEntity } from '../../entities/riot/account.entity'
import { ActiveShardEntity } from '../../entities/riot/active-shard.entity'
import type { Game } from '../../enums/game'
import type { AccountRegionGroup } from '../../enums/region'
import { BaseNamespace } from '../base-namespace'

/**
 * ACCOUNT-V1 methods.
 */
export class RiotAccountNamespace extends BaseNamespace {
  /**
   * Get an account by PUUID.
   *
   * @param puuid - The player's PUUID.
   * @param regionGroup - Account routing value (`AMERICAS`, `ASIA` or `EUROPE`).
   */
  async byPuuid(puuid: string, regionGroup: AccountRegionGroup): Promise<AccountEntity> {
    const fetched = await this.executor.request<AccountDTO>(
      regionGroup,
      RIOT_ENDPOINTS.accountByPuuid,
      { pathParams: { puuid } },
    )
    return this.toEntity(AccountEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get an account by Riot ID.
   *
   * @param gameName - The in-game name (before the `#`).
   * @param tagLine - The tag line (after the `#`).
   * @param regionGroup - Account routing value (`AMERICAS`, `ASIA` or `EUROPE`).
   */
  async byRiotId(
    gameName: string,
    tagLine: string,
    regionGroup: AccountRegionGroup,
  ): Promise<AccountEntity> {
    const fetched = await this.executor.request<AccountDTO>(
      regionGroup,
      RIOT_ENDPOINTS.accountByRiotId,
      { pathParams: { gameName, tagLine } },
    )
    return this.toEntity(AccountEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get a player's active shard for a game.
   *
   * @param game - The game (`lol`, `tft`, …).
   * @param puuid - The player's PUUID.
   * @param regionGroup - Account routing value.
   */
  async activeShard(
    game: Game,
    puuid: string,
    regionGroup: AccountRegionGroup,
  ): Promise<ActiveShardEntity> {
    const fetched = await this.executor.request<ActiveShardDTO>(
      regionGroup,
      RIOT_ENDPOINTS.accountActiveShard,
      { pathParams: { game, puuid } },
    )
    return this.toEntity(ActiveShardEntity, fetched, this.groupContext(regionGroup))
  }

  /**
   * Get a player's active region for a game.
   *
   * @param game - The game (`lol` or `tft`).
   * @param puuid - The player's PUUID.
   * @param regionGroup - Account routing value.
   */
  async activeRegion(
    game: Game,
    puuid: string,
    regionGroup: AccountRegionGroup,
  ): Promise<AccountRegionEntity> {
    const fetched = await this.executor.request<AccountRegionDTO>(
      regionGroup,
      RIOT_ENDPOINTS.accountActiveRegion,
      { pathParams: { game, puuid } },
    )
    return this.toEntity(AccountRegionEntity, fetched, this.groupContext(regionGroup))
  }
}
