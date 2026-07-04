import type { Yasuo } from '../../client/yasuo'
import type { RequestExecutor } from '../../core/request/request-executor'
import { TftLeagueNamespace } from './tft-league.namespace'
import { TftMatchNamespace } from './tft-match.namespace'
import { TftSpectatorNamespace } from './tft-spectator.namespace'
import { TftSummonerNamespace } from './tft-summoner.namespace'

/**
 * Teamfight Tactics API surface, grouped by Riot service.
 *
 * Reached via `yasuo.tft` — e.g. `yasuo.tft.summoner`, `yasuo.tft.match`.
 */
export class TftNamespace {
  /** TFT-SUMMONER-V1. */
  readonly summoner: TftSummonerNamespace
  /** TFT-LEAGUE-V1. */
  readonly league: TftLeagueNamespace
  /** TFT-MATCH-V1. */
  readonly match: TftMatchNamespace
  /** SPECTATOR-TFT-V5. */
  readonly spectator: TftSpectatorNamespace

  constructor(executor: RequestExecutor, client: Yasuo) {
    this.summoner = new TftSummonerNamespace(executor, client)
    this.league = new TftLeagueNamespace(executor, client)
    this.match = new TftMatchNamespace(executor, client)
    this.spectator = new TftSpectatorNamespace(executor, client)
  }
}
