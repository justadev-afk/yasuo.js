import { describe, expect, test } from 'bun:test'
import { type Page, Paginator } from '../../src/core/pagination/paginator'
import { EMPTY_RATE_LIMITS } from '../../src/core/rate-limit/rate-limit-headers'
import type { ResponseMeta } from '../../src/dto/common.dto'

const META: ResponseMeta = {
  status: 200,
  rateLimits: EMPTY_RATE_LIMITS,
  url: 'https://example.test',
  headers: {},
}

/** Build a paginator over fixed pages, tracking how many fetches happened. */
function makePaginator(pages: number[][], startCursor = 0, maxItems?: number) {
  const fetches: number[] = []
  const paginator = new Paginator<number>({
    startCursor,
    maxItems,
    fetchPage: (cursor): Promise<Page<number>> => {
      fetches.push(cursor)
      const items = pages[cursor] ?? []
      return Promise.resolve({ items, meta: META, cursor })
    },
    // Stop when a page comes back short (fewer than 2 items).
    nextCursor: (cursor, page) => (page.items.length < 2 ? null : cursor + 1),
  })
  return { paginator, fetches }
}

describe('Paginator', () => {
  test('iterates every item across pages with for-await', async () => {
    const { paginator } = makePaginator([[1, 2], [3, 4], [5]])
    const collected: number[] = []
    for await (const item of paginator) {
      collected.push(item)
    }
    expect(collected).toEqual([1, 2, 3, 4, 5])
  })

  test('toArray collects everything', async () => {
    const { paginator } = makePaginator([[1, 2], [3, 4], [5]])
    expect(await paginator.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  test('respects maxItems and stops fetching early', async () => {
    const { paginator, fetches } = makePaginator([[1, 2], [3, 4], [5]], 0, 3)
    expect(await paginator.toArray()).toEqual([1, 2, 3])
    // Only the first two pages were needed to satisfy maxItems=3.
    expect(fetches).toEqual([0, 1])
  })

  test('starts from a configurable cursor', async () => {
    const { paginator } = makePaginator([[1, 2], [3, 4], [5]], 1)
    expect(await paginator.toArray()).toEqual([3, 4, 5])
  })

  test('pages() exposes each page with its meta', async () => {
    const { paginator } = makePaginator([[1, 2], [3]])
    const cursors: number[] = []
    for await (const page of paginator.pages()) {
      cursors.push(page.cursor)
      expect(page.meta.status).toBe(200)
    }
    expect(cursors).toEqual([0, 1])
  })

  test('first() returns the first item', async () => {
    const { paginator, fetches } = makePaginator([[7, 8], [9]])
    expect(await paginator.first()).toBe(7)
    // Only one page fetch was needed.
    expect(fetches).toEqual([0])
  })

  test('first() returns null on an empty sequence', async () => {
    const { paginator } = makePaginator([[]])
    expect(await paginator.first()).toBeNull()
  })
})
