import type { ResponseMeta } from '../../dto/common.dto'

/** One page of results plus the metadata of the request that produced it. */
export interface Page<T> {
  /** Items on this page. */
  readonly items: readonly T[]
  /** Response metadata (rate limits, status, url) for this page's request. */
  readonly meta: ResponseMeta
  /** The cursor (page number or offset) this page was fetched with. */
  readonly cursor: number
}

/** Configuration for a {@link Paginator}. */
export interface PaginatorConfig<T> {
  /** Cursor of the first page — a page number or an item offset. */
  readonly startCursor: number
  /** Fetch a single page for the given cursor. */
  readonly fetchPage: (cursor: number) => Promise<Page<T>>
  /**
   * Compute the next cursor from the current one and the page just fetched.
   * Return `null` to stop (e.g. the page came back short or empty).
   */
  readonly nextCursor: (cursor: number, page: Page<T>) => number | null
  /** Optional hard cap on the total number of items yielded. */
  readonly maxItems?: number
}

/**
 * A lazy, async-iterable pager over a paginated Riot endpoint.
 *
 * Yield items one at a time with `for await`, or whole pages via
 * {@link Paginator.pages}. Every page fetch flows through the rate limiter, so
 * you can iterate an entire ranked ladder or a player's whole match history
 * without manually pacing requests. The starting page/offset is configurable,
 * so you can resume from anywhere.
 *
 * @typeParam T - The item type (typically an entity).
 * @example
 * ```ts
 * // Stream every Diamond I player, 10 at a time, starting at page 3:
 * for await (const entry of yasuo.lol.league.streamEntries(
 *   RankedQueue.SOLO_5x5, Tier.DIAMOND, Division.I, Region.EUW, { startPage: 3 },
 * )) {
 *   console.log(entry.puuid, entry.leaguePoints)
 * }
 * ```
 */
export class Paginator<T> implements AsyncIterable<T> {
  constructor(private readonly config: PaginatorConfig<T>) {}

  /** Return the first item, or `null` if the sequence is empty. */
  async first(): Promise<T | null> {
    for await (const item of this) {
      return item
    }
    return null
  }

  /**
   * Iterate over whole pages, exposing each page's {@link Page.meta}.
   */
  async *pages(): AsyncGenerator<Page<T>, void, void> {
    const { maxItems } = this.config
    let cursor: number | null = this.config.startCursor
    let emitted = 0
    while (cursor !== null) {
      const page = await this.config.fetchPage(cursor)
      if (maxItems !== undefined && emitted + page.items.length > maxItems) {
        yield { ...page, items: page.items.slice(0, maxItems - emitted) }
        return
      }
      yield page
      emitted += page.items.length
      if (maxItems !== undefined && emitted >= maxItems) {
        return
      }
      cursor = page.items.length === 0 ? null : this.config.nextCursor(cursor, page)
    }
  }

  /**
   * Eagerly collect items into an array.
   *
   * @param limit - Optional maximum number of items to collect.
   */
  async toArray(limit?: number): Promise<T[]> {
    const out: T[] = []
    for await (const item of this) {
      out.push(item)
      if (limit !== undefined && out.length >= limit) {
        break
      }
    }
    return out
  }

  /** Iterate over individual items, transparently fetching pages as needed. */
  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
    for await (const page of this.pages()) {
      for (const item of page.items) {
        yield item
      }
    }
  }
}
