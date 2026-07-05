import type { Yasuo } from '../../client/yasuo'
import type { RequestExecutor } from '../../core/request/request-executor'
import { LolChallengesNamespace } from './challenges.namespace'
import { LolChampionNamespace } from './champion.namespace'
import { LolClashNamespace } from './clash.namespace'
import { LolLeagueNamespace } from './league.namespace'
import { LolMasteryNamespace } from './mastery.namespace'
import { LolMatchNamespace } from './match.namespace'
import { LolSpectatorNamespace } from './spectator.namespace'
import { LolStatusNamespace } from './status.namespace'
import { LolSummonerNamespace } from './summoner.namespace'

/**
 * League of Legends API surface, grouped by Riot service.
 *
 * Reached via `yasuo.lol` — e.g. `yasuo.lol.summoner`, `yasuo.lol.match`.
 */
export class LolNamespace {
  /** LOL-CHALLENGES-V1. */
  readonly challenges: LolChallengesNamespace
  /** CHAMPION-V3 (champion rotation). */
  readonly champion: LolChampionNamespace
  /** CLASH-V1. */
  readonly clash: LolClashNamespace
  /** LEAGUE-V4. */
  readonly league: LolLeagueNamespace
  /** CHAMPION-MASTERY-V4. */
  readonly mastery: LolMasteryNamespace
  /** MATCH-V5. */
  readonly match: LolMatchNamespace
  /** SPECTATOR-V5. */
  readonly spectator: LolSpectatorNamespace
  /** LOL-STATUS-V4. */
  readonly status: LolStatusNamespace
  /** SUMMONER-V4. */
  readonly summoner: LolSummonerNamespace

  constructor(executor: RequestExecutor, client: Yasuo) {
    this.summoner = new LolSummonerNamespace(executor, client)
    this.league = new LolLeagueNamespace(executor, client)
    this.mastery = new LolMasteryNamespace(executor, client)
    this.champion = new LolChampionNamespace(executor, client)
    this.match = new LolMatchNamespace(executor, client)
    this.spectator = new LolSpectatorNamespace(executor, client)
    this.status = new LolStatusNamespace(executor, client)
    this.clash = new LolClashNamespace(executor, client)
    this.challenges = new LolChallengesNamespace(executor, client)
  }
}
