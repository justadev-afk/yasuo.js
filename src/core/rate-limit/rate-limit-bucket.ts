import type { RateLimitWindow } from '../../dto/common.dto'
import { SlidingWindow } from './sliding-window'

const MS_PER_SECOND = 1000

/**
 * A rate-limit bucket groups every {@link SlidingWindow} that governs one
 * scope (an application host, or a specific method) plus a `blockedUntil`
 * penalty applied when Riot returns a `429`/`503`.
 *
 * A request is only permitted when *all* of the bucket's windows have a free
 * slot and no penalty is active.
 */
export class RateLimitBucket {
  /** Whether the bucket has learned any windows yet. */
  get configured(): boolean {
    return this.windows.size > 0
  }

  private blockedUntil = 0
  private windows = new Map<number, SlidingWindow>()

  /** Block the bucket until `until` (epoch ms) — used to honour `retry-after`. */
  blockUntil(until: number): void {
    this.blockedUntil = Math.max(this.blockedUntil, until)
  }

  /**
   * Reconcile the bucket's windows with the specs advertised by Riot.
   *
   * Existing windows are reconfigured in place (preserving their timestamp
   * log), new intervals are added, and intervals Riot no longer advertises are
   * dropped. When a spec carries a `count`, the window is synced to it.
   *
   * @param specs - Windows parsed from a rate-limit header.
   * @param now - Current time.
   */
  configure(specs: readonly RateLimitWindow[], now: number): void {
    const seen = new Set<number>()
    for (const spec of specs) {
      const intervalMs = spec.intervalSeconds * MS_PER_SECOND
      seen.add(intervalMs)
      const existing = this.windows.get(intervalMs)
      if (existing) {
        existing.reconfigure(spec.limit, intervalMs)
      } else {
        this.windows.set(intervalMs, new SlidingWindow(spec.limit, intervalMs))
      }
      if (spec.count !== undefined) {
        ;(this.windows.get(intervalMs) as SlidingWindow).syncCount(spec.count, now)
      }
    }
    for (const intervalMs of [...this.windows.keys()]) {
      if (!seen.has(intervalMs)) {
        this.windows.delete(intervalMs)
      }
    }
  }

  /** Record a request against every window in the bucket. */
  record(now: number): void {
    for (const window of this.windows.values()) {
      window.record(now)
    }
  }

  /** Milliseconds until the bucket can accept another request. */
  timeUntilAvailable(now: number): number {
    let wait = Math.max(0, this.blockedUntil - now)
    for (const window of this.windows.values()) {
      wait = Math.max(wait, window.timeUntilAvailable(now))
    }
    return wait
  }
}
