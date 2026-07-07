import type { Yasuo } from '../../client/yasuo'
import type { RequestExecutor } from '../../core/request/request-executor'
import { LorMatchNamespace } from './lor-match.namespace'
import { LorRankedNamespace } from './lor-ranked.namespace'
import { LorStatusNamespace } from './lor-status.namespace'

/**
 * Legends of Runeterra API surface, grouped by Riot service.
 *
 * Reached via `yasuo.lor` — e.g. `yasuo.lor.match`, `yasuo.lor.ranked`. Every
 * LoR service routes by {@link RegionGroup}.
 */
export class LorNamespace {
  /** LOR-MATCH-V1. */
  readonly match: LorMatchNamespace
  /** LOR-RANKED-V1. */
  readonly ranked: LorRankedNamespace
  /** LOR-STATUS-V1. */
  readonly status: LorStatusNamespace

  constructor(executor: RequestExecutor, client: Yasuo) {
    this.match = new LorMatchNamespace(executor, client)
    this.ranked = new LorRankedNamespace(executor, client)
    this.status = new LorStatusNamespace(executor, client)
  }
}
