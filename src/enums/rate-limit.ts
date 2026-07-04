/**
 * The kind of rate limit that produced a `429 Too Many Requests`, as reported
 * by Riot in the {@link HttpHeader.RATE_LIMIT_TYPE} header.
 */
export enum RateLimitType {
  /** The key exceeded its total application rate limit. */
  APPLICATION = 'application',
  /** The key exceeded the rate limit of a specific method. */
  METHOD = 'method',
  /**
   * The underlying service throttled the request at the Riot API layer,
   * independent of the key's application or method limits.
   */
  SERVICE = 'service',
}

/**
 * Scope at which a rate-limit bucket is tracked internally.
 */
export enum RateLimitScope {
  /** Shared across every method on a routing host (from `x-app-rate-limit`). */
  APPLICATION = 'application',
  /** Specific to a single endpoint method (from `x-method-rate-limit`). */
  METHOD = 'method',
}
