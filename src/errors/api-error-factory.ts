import { HttpStatus } from '../enums/http'
import { ApiError, type ApiErrorInit } from './api-error'
import { ForbiddenError } from './forbidden-error'
import { NotFoundError } from './not-found-error'
import { RateLimitError } from './rate-limit-error'
import { ServiceUnavailableError } from './service-unavailable-error'
import { UnauthorizedError } from './unauthorized-error'

/**
 * Build the most specific {@link ApiError} subclass for an HTTP status code.
 *
 * @param init - Details of the failed response.
 * @returns A typed error instance ready to be thrown.
 */
export function apiErrorFromStatus(init: ApiErrorInit): ApiError {
  switch (init.status) {
    case HttpStatus.UNAUTHORIZED:
      return new UnauthorizedError(init)
    case HttpStatus.FORBIDDEN:
      return new ForbiddenError(init)
    case HttpStatus.NOT_FOUND:
      return new NotFoundError(init)
    case HttpStatus.TOO_MANY_REQUESTS:
      return new RateLimitError(init)
    case HttpStatus.BAD_GATEWAY:
    case HttpStatus.SERVICE_UNAVAILABLE:
    case HttpStatus.GATEWAY_TIMEOUT:
      return new ServiceUnavailableError(init)
    default:
      return new ApiError(init)
  }
}
