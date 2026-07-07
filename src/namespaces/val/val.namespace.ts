import type { Yasuo } from '../../client/yasuo'
import type { RequestExecutor } from '../../core/request/request-executor'
import { ValConsoleMatchNamespace } from './val-console-match.namespace'
import { ValContentNamespace } from './val-content.namespace'
import { ValMatchNamespace } from './val-match.namespace'
import { ValRankedNamespace } from './val-ranked.namespace'
import { ValStatusNamespace } from './val-status.namespace'

/**
 * VALORANT API surface, grouped by Riot service.
 *
 * Reached via `yasuo.val` — e.g. `yasuo.val.match`, `yasuo.val.content`. Every
 * VAL service routes by {@link Shard}.
 */
export class ValNamespace {
  /** VAL-CONSOLE-MATCH-V1 (PlayStation/Xbox). */
  readonly consoleMatch: ValConsoleMatchNamespace
  /** VAL-CONTENT-V1. */
  readonly content: ValContentNamespace
  /** VAL-MATCH-V1. */
  readonly match: ValMatchNamespace
  /** VAL-RANKED-V1. */
  readonly ranked: ValRankedNamespace
  /** VAL-STATUS-V1. */
  readonly status: ValStatusNamespace

  constructor(executor: RequestExecutor, client: Yasuo) {
    this.content = new ValContentNamespace(executor, client)
    this.match = new ValMatchNamespace(executor, client)
    this.consoleMatch = new ValConsoleMatchNamespace(executor, client)
    this.ranked = new ValRankedNamespace(executor, client)
    this.status = new ValStatusNamespace(executor, client)
  }
}
