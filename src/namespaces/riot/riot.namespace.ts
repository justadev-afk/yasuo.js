import type { Yasuo } from '../../client/yasuo'
import type { RequestExecutor } from '../../core/request/request-executor'
import { RiotAccountNamespace } from './account.namespace'

/**
 * Shared Riot API surface (services not specific to one game).
 *
 * Reached via `yasuo.riot` — e.g. `yasuo.riot.account`.
 */
export class RiotNamespace {
  /** ACCOUNT-V1. */
  readonly account: RiotAccountNamespace

  constructor(executor: RequestExecutor, client: Yasuo) {
    this.account = new RiotAccountNamespace(executor, client)
  }
}
