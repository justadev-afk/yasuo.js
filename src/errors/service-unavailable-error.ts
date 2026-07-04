import { ApiError, type ApiErrorInit } from './api-error'

/**
 * Thrown on `503 Service Unavailable` (or `502`/`504`) once retries are
 * exhausted. Check the Riot API status page for ongoing incidents.
 */
export class ServiceUnavailableError extends ApiError {
  constructor(init: ApiErrorInit) {
    super(
      init,
      `Riot service unavailable (${init.status}): check https://developer.riotgames.com/api-status (${init.url})`,
    )
  }
}
