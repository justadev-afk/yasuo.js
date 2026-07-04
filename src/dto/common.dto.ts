import type { RateLimitType } from '../enums/rate-limit'

/**
 * A single rate-limit window, e.g. "100 requests per 120 seconds".
 *
 * Riot advertises one or more of these per scope in the
 * `x-app-rate-limit` / `x-method-rate-limit` headers (comma separated) and the
 * matching current usage in the `*-count` headers.
 */
export interface RateLimitWindow {
  /** Maximum number of requests allowed within {@link intervalSeconds}. */
  readonly limit: number
  /** Length of the window, in seconds. */
  readonly intervalSeconds: number
  /**
   * Requests already counted in this window according to Riot's `*-count`
   * header, when available. `undefined` before the first response is seen.
   */
  readonly count?: number
}

/**
 * Rate-limit information parsed from a Riot response's headers.
 *
 * Exposed on every {@link ResponseMeta} so callers can inspect their current
 * budget, and consumed internally by the proactive rate limiter.
 */
export interface RateLimits {
  /**
   * Which limiter enforced a `429`, from `x-rate-limit-type`. `null` on
   * successful responses.
   */
  readonly type: RateLimitType | null
  /**
   * Seconds to wait before retrying, from the `retry-after` header. `null`
   * when the response was not rate limited.
   */
  readonly retryAfterSeconds: number | null
  /** Application-scoped windows parsed from `x-app-rate-limit`. */
  readonly app: readonly RateLimitWindow[]
  /** Method-scoped windows parsed from `x-method-rate-limit`. */
  readonly method: readonly RateLimitWindow[]
  /** Riot edge trace id from `x-riot-edge-trace-id`, when present. */
  readonly edgeTraceId: string | null
}

/**
 * Metadata attached to every value returned by a Riot-backed method.
 *
 * Entities expose it as `.meta`; collections expose it as `.meta` too. It is
 * the modern equivalent of Twisted's `{ rateLimits }` envelope, but travels
 * *with* the data instead of wrapping it.
 */
export interface ResponseMeta {
  /** HTTP status code of the response that produced the value. */
  readonly status: number
  /** Rate-limit budget parsed from the response headers. */
  readonly rateLimits: RateLimits
  /** Final request URL, query string included. */
  readonly url: string
  /** Raw response headers, lower-cased. */
  readonly headers: Readonly<Record<string, string>>
}
