/**
 * A single sliding-window rate-limit counter.
 *
 * Keeps a log of request timestamps and evicts entries older than
 * {@link intervalMs}. Because it reasons over a *rolling* window (rather than
 * fixed buckets) it never allows a boundary burst that would trip Riot's `429`,
 * as long as Yasuo is the only consumer of the key.
 */
export class SlidingWindow {
  private timestamps: number[] = []

  /**
   * @param limit - Maximum requests permitted within the window.
   * @param intervalMs - Window length in milliseconds.
   */
  constructor(
    public limit: number,
    public intervalMs: number,
  ) {}

  /** Update the window's limit/interval when Riot advertises different values. */
  reconfigure(limit: number, intervalMs: number): void {
    this.limit = limit
    this.intervalMs = intervalMs
  }

  /** Record that a request was sent at `now`. */
  record(now: number): void {
    this.timestamps.push(now)
  }

  /** Number of requests currently counted in the window. */
  size(now: number): number {
    this.prune(now)
    return this.timestamps.length
  }

  /**
   * Reconcile the local log with Riot's advertised usage count, topping it up
   * so we never believe we have more budget than Riot reports (protects
   * against other consumers sharing the key).
   *
   * @param serverCount - Value from the matching `*-count` header.
   * @param now - Current time.
   */
  syncCount(serverCount: number, now: number): void {
    this.prune(now)
    for (let i = this.timestamps.length; i < serverCount; i += 1) {
      this.timestamps.push(now)
    }
  }

  /**
   * Milliseconds until at least one slot is free.
   *
   * @returns `0` when a request may be sent immediately, otherwise the wait.
   */
  timeUntilAvailable(now: number): number {
    this.prune(now)
    if (this.timestamps.length < this.limit) {
      return 0
    }
    const oldest = this.timestamps[0] as number
    return Math.max(0, oldest + this.intervalMs - now)
  }

  /** Drop timestamps that have aged out of the current window. */
  private prune(now: number): void {
    const cutoff = now - this.intervalMs
    let removable = 0
    while (removable < this.timestamps.length && (this.timestamps[removable] as number) <= cutoff) {
      removable += 1
    }
    if (removable > 0) {
      this.timestamps.splice(0, removable)
    }
  }
}
