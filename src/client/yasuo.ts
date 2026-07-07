import type { HttpMiddleware } from '../core/http/middleware'
import { RequestExecutor } from '../core/request/request-executor'
import { DataDragonNamespace } from '../namespaces/data-dragon/data-dragon.namespace'
import { LolNamespace } from '../namespaces/lol/lol.namespace'
import { LorNamespace } from '../namespaces/lor/lor.namespace'
import { RiotNamespace } from '../namespaces/riot/riot.namespace'
import { TftNamespace } from '../namespaces/tft/tft.namespace'
import { ValNamespace } from '../namespaces/val/val.namespace'
import type { YasuoConfig } from './config'

/**
 * The Yasuo client — the single entry point to the Riot Games API.
 *
 * Instantiate it once and reach every service through a game-scoped namespace:
 *
 * - `yasuo.lol` — League of Legends (summoner, league, match, mastery, tournament, …)
 * - `yasuo.tft` — Teamfight Tactics
 * - `yasuo.val` — VALORANT (content, match, ranked, status)
 * - `yasuo.lor` — Legends of Runeterra (match, ranked, status)
 * - `yasuo.riot` — shared Riot services (account)
 * - `yasuo.dataDragon` — static game data (no key required)
 *
 * Each product can be signed with its own API key — Riot recommends one product
 * key per game (see {@link YasuoConfig.keys}).
 *
 * @example
 * ```ts
 * import { Yasuo, Region, RegionGroup } from 'yasuo.js'
 *
 * const yasuo = new Yasuo({ keys: { lol: LOL_KEY, val: VAL_KEY }, cache: true })
 *
 * const account  = await yasuo.riot.account.byRiotId('Hide on bush', 'KR1', RegionGroup.ASIA)
 * const summoner = await account.summoner(Region.KR)
 * const ranked   = await summoner.leagueEntries()
 * const matches  = await summoner.matches({ count: 5 })
 * ```
 */
export class Yasuo {
  /** Data Dragon static data (no API key or rate limits). */
  readonly dataDragon: DataDragonNamespace
  /** League of Legends API surface. */
  readonly lol: LolNamespace
  /** Legends of Runeterra API surface. */
  readonly lor: LorNamespace
  /** Shared Riot API surface (account). */
  readonly riot: RiotNamespace
  /** Teamfight Tactics API surface. */
  readonly tft: TftNamespace
  /** VALORANT API surface. */
  readonly val: ValNamespace

  private readonly executor: RequestExecutor

  /**
   * @param config - Client configuration, or a bare API key string. When
   * omitted, keys are read from the `RIOT_API_KEY` (and per-product) environment
   * variables.
   */
  constructor(config: YasuoConfig | string = {}) {
    const resolved: YasuoConfig = typeof config === 'string' ? { key: config } : config
    this.executor = new RequestExecutor(resolved)
    this.lol = new LolNamespace(this.executor, this)
    this.tft = new TftNamespace(this.executor, this)
    this.val = new ValNamespace(this.executor, this)
    this.lor = new LorNamespace(this.executor, this)
    this.riot = new RiotNamespace(this.executor, this)
    this.dataDragon = new DataDragonNamespace()
  }

  /**
   * Register a **global** request {@link HttpMiddleware}, applied to every
   * request across all services (Data Dragon excepted). Middlewares stack:
   * global ones wrap any service-scoped middleware added with
   * `yasuo.lol.summoner.use(...)`. Returns `this` for chaining.
   *
   * @example
   * ```ts
   * yasuo
   *   .use(async (request, next) => { console.time(request.url); const r = await next(request); console.timeEnd(request.url); return r })
   *   .use((request, next) => next({ ...request, headers: { ...request.headers, 'x-app': 'my-bot' } }))
   * ```
   */
  use(middleware: HttpMiddleware): this {
    this.executor.use(middleware)
    return this
  }
}
