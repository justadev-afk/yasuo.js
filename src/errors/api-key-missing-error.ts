import { YasuoError } from './yasuo-error'

/**
 * Thrown when a request is attempted without an API key configured.
 *
 * Provide a key via `new Yasuo({ key })` or the `RIOT_API_KEY` environment
 * variable.
 */
export class ApiKeyMissingError extends YasuoError {
  constructor(
    message = 'No Riot API key provided. Pass `{ key }` to the Yasuo constructor or set RIOT_API_KEY.',
  ) {
    super(message)
  }
}
