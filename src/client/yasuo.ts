import { RequestExecutor } from '../core/request/request-executor'
import { DataDragonNamespace } from '../namespaces/data-dragon/data-dragon.namespace'
import { LolNamespace } from '../namespaces/lol/lol.namespace'
import { RiotNamespace } from '../namespaces/riot/riot.namespace'
import { TftNamespace } from '../namespaces/tft/tft.namespace'
import type { YasuoConfig } from './config'

/**
 * The Yasuo client — the single entry point to the Riot Games API.
 *
 * Instantiate it once and reach every service through a game-scoped namespace:
 *
 * - `yasuo.lol` — League of Legends (summoner, league, match, mastery, …)
 * - `yasuo.tft` — Teamfight Tactics
 * - `yasuo.riot` — shared Riot services (account)
 * - `yasuo.dataDragon` — static game data (no key required)
 *
 * @example
 * ```ts
 * import { Yasuo, Region, RegionGroup } from 'yasuo'
 *
 * const yasuo = new Yasuo({ key: process.env.RIOT_API_KEY, cache: true, logLevel: LogLevel.INFO })
 *
 * const account  = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
 * const summoner = await account.summoner(Region.KR)
 * const ranked   = await summoner.leagueEntries()
 * const matches  = await summoner.matches({ count: 5 })
 * ```
 */
export class Yasuo {
  /** League of Legends API surface. */
  readonly lol: LolNamespace
  /** Teamfight Tactics API surface. */
  readonly tft: TftNamespace
  /** Shared Riot API surface (account). */
  readonly riot: RiotNamespace
  /** Data Dragon static data (no API key or rate limits). */
  readonly dataDragon: DataDragonNamespace

  /**
   * @param config - Client configuration, or a bare API key string. When
   * omitted, the key is read from the `RIOT_API_KEY` environment variable.
   */
  constructor(config: YasuoConfig | string = {}) {
    const resolved: YasuoConfig = typeof config === 'string' ? { key: config } : config
    const executor = new RequestExecutor(resolved)
    this.lol = new LolNamespace(executor, this)
    this.tft = new TftNamespace(executor, this)
    this.riot = new RiotNamespace(executor, this)
    this.dataDragon = new DataDragonNamespace()
  }
}
