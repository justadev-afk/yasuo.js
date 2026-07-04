import { describe, expect, test } from 'bun:test'
import {
  EMPTY_RATE_LIMITS,
  parseRateLimits,
  parseWindows,
} from '../../src/core/rate-limit/rate-limit-headers'
import { HttpHeader } from '../../src/enums/http'
import { RateLimitType } from '../../src/enums/rate-limit'

describe('parseWindows', () => {
  test('parses "limit:interval" pairs and merges the count header', () => {
    expect(parseWindows('100:120,20:1', '10:120,5:1')).toEqual([
      { limit: 100, intervalSeconds: 120, count: 10 },
      { limit: 20, intervalSeconds: 1, count: 5 },
    ])
  })

  test('omits count when the count header is absent', () => {
    expect(parseWindows('20:1', undefined)).toEqual([{ limit: 20, intervalSeconds: 1 }])
  })

  test('returns an empty array for a missing limit header', () => {
    expect(parseWindows(undefined, undefined)).toEqual([])
  })

  test('skips malformed pairs (non-numeric or zero interval)', () => {
    expect(parseWindows('abc:1,20:0,15:60', undefined)).toEqual([
      { limit: 15, intervalSeconds: 60 },
    ])
  })
})

describe('parseRateLimits', () => {
  test('parses a full set of headers', () => {
    const limits = parseRateLimits({
      [HttpHeader.APP_RATE_LIMIT]: '100:120,20:1',
      [HttpHeader.APP_RATE_LIMIT_COUNT]: '1:120,1:1',
      [HttpHeader.METHOD_RATE_LIMIT]: '2000:10',
      [HttpHeader.METHOD_RATE_LIMIT_COUNT]: '3:10',
      [HttpHeader.RATE_LIMIT_TYPE]: RateLimitType.APPLICATION,
      [HttpHeader.RETRY_AFTER]: '5',
      [HttpHeader.EDGE_TRACE_ID]: 'trace-123',
    })
    expect(limits.type).toBe(RateLimitType.APPLICATION)
    expect(limits.retryAfterSeconds).toBe(5)
    expect(limits.app).toEqual([
      { limit: 100, intervalSeconds: 120, count: 1 },
      { limit: 20, intervalSeconds: 1, count: 1 },
    ])
    expect(limits.method).toEqual([{ limit: 2000, intervalSeconds: 10, count: 3 }])
    expect(limits.edgeTraceId).toBe('trace-123')
  })

  test('defaults gracefully when headers are absent', () => {
    const limits = parseRateLimits({})
    expect(limits.type).toBeNull()
    expect(limits.retryAfterSeconds).toBeNull()
    expect(limits.app).toEqual([])
    expect(limits.method).toEqual([])
    expect(limits.edgeTraceId).toBeNull()
  })

  test('ignores an unrecognised rate-limit-type', () => {
    expect(parseRateLimits({ [HttpHeader.RATE_LIMIT_TYPE]: 'bogus' }).type).toBeNull()
  })
})

describe('EMPTY_RATE_LIMITS', () => {
  test('is a fully-null/empty snapshot', () => {
    expect(EMPTY_RATE_LIMITS).toEqual({
      type: null,
      retryAfterSeconds: null,
      app: [],
      method: [],
      edgeTraceId: null,
    })
  })
})
