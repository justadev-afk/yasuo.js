import { ApiError, type ApiErrorInit } from './api-error'

/**
 * Thrown on `429 Too Many Requests` once automatic retries are exhausted or
 * disabled. Inspect {@link ApiError.rateLimits} for the `retryAfterSeconds`.
 */
export class RateLimitError extends ApiError {
  constructor(init: ApiErrorInit) {
    const retry = init.rateLimits.retryAfterSeconds
    super(init, `Rate limited (429)${retry != null ? `, retry after ${retry}s` : ''} (${init.url})`)
  }
}
