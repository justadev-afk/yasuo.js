import { ApiError, type ApiErrorInit } from './api-error'

/**
 * Thrown on `403 Forbidden` — the key lacks access to the endpoint (common for
 * Spectator featured games on development keys) or is blacklisted.
 */
export class ForbiddenError extends ApiError {
  constructor(init: ApiErrorInit) {
    super(init, `Forbidden (403): the Riot API key cannot access this endpoint (${init.url})`)
  }
}
