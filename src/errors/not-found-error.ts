import { ApiError, type ApiErrorInit } from './api-error'

/** Thrown on `404 Not Found` — the requested resource does not exist. */
export class NotFoundError extends ApiError {
  constructor(init: ApiErrorInit) {
    super(init, `Not found (404): ${init.url}`)
  }
}
