import type { AccountDTO } from '../../dto/riot/account.dto'
import type { Game } from '../../enums/game'
import type { AccountRegionGroup, Region } from '../../enums/region'
import { Entity } from '../entity'
import type { SummonerRef } from '../lol/summoner-ref'
import type { TftSummonerRef } from '../tft/tft-summoner-ref'
import type { AccountRegionEntity } from './account-region.entity'
import type { ActiveShardEntity } from './active-shard.entity'

// Merge the DTO fields onto the entity so `account.puuid` etc. are typed.
export interface AccountEntity extends AccountDTO {}

/**
 * A Riot account with lazy relations into League of Legends and TFT.
 *
 * @example
 * ```ts
 * const account = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
 * const summoner = await account.summoner(Region.KR) // -> SummonerRef (chainable)
 * const region   = await account.activeRegion(Game.LOL)
 * ```
 */
export class AccountEntity extends Entity<AccountDTO> {
  private get routingGroup(): AccountRegionGroup {
    return this.context.regionGroup as AccountRegionGroup
  }

  /**
   * Resolve this account's League of Legends summoner on a given platform
   * region (chainable — traverse further without awaiting).
   *
   * @param region - The platform region the player plays on.
   */
  summoner(region: Region): SummonerRef {
    return this.context.client.lol.summoner.byPuuid(this.puuid, region)
  }

  /**
   * Resolve this account's Teamfight Tactics summoner on a given platform
   * region (chainable).
   *
   * @param region - The platform region the player plays on.
   */
  tftSummoner(region: Region): TftSummonerRef {
    return this.context.client.tft.summoner.byPuuid(this.puuid, region)
  }

  /**
   * Look up the player's active region for a game (LoL/TFT).
   *
   * @param game - The game to resolve the active region for.
   */
  activeRegion(game: Game): Promise<AccountRegionEntity> {
    return this.context.client.riot.account.activeRegion(game, this.puuid, this.routingGroup)
  }

  /**
   * Look up the player's active shard for a game.
   *
   * @param game - The game to resolve the active shard for.
   */
  activeShard(game: Game): Promise<ActiveShardEntity> {
    return this.context.client.riot.account.activeShard(game, this.puuid, this.routingGroup)
  }
}
