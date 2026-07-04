import { ApiError, type ApiErrorInit } from './api-error'

/** Thrown on `401 Unauthorized` — the API key is missing, invalid or expired. */
export class UnauthorizedError extends ApiError {
  constructor(init: ApiErrorInit) {
    super(init, `Unauthorized (401): the Riot API key is invalid or expired (${init.url})`)
  }
}
