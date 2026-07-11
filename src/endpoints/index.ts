export {
  buildQueryString,
  DEFAULT_BASE_URL,
  type Endpoint,
  type PathParams,
  type QueryParams,
  type QueryValue,
  type ResolvedRequest,
  resolveRequest,
} from './endpoint'

import type { LOL_ENDPOINTS } from './lol'
import type { LOR_ENDPOINTS } from './lor'
import type { RIOT_ENDPOINTS } from './riot'
import type { TFT_ENDPOINTS } from './tft'
import type { TOURNAMENT_ENDPOINTS } from './tournament'
import type { VAL_ENDPOINTS } from './val'

export { LOL_ENDPOINTS } from './lol'
export { LOR_ENDPOINTS } from './lor'
export { RIOT_ENDPOINTS } from './riot'
export { TFT_ENDPOINTS } from './tft'
export { TOURNAMENT_ENDPOINTS } from './tournament'
export { VAL_ENDPOINTS } from './val'

/** The literal `id` of every endpoint in a `*_ENDPOINTS` map (`'lol.summoner.byPuuid'`, …). */
type IdOf<T> = {
  [K in keyof T]: T[K] extends { readonly id: infer I extends string } ? I : never
}[keyof T]

/**
 * The union of every endpoint's stable `id` (`'<product>.<service>.<method>'`).
 * Derived from the `as const` endpoint maps, so it stays in lock-step with the
 * endpoints and drives the `keyof`-style per-method cache-config keys
 * (`core/cache/scoped-cache`).
 */
export type EndpointId =
  | IdOf<typeof LOL_ENDPOINTS>
  | IdOf<typeof TFT_ENDPOINTS>
  | IdOf<typeof RIOT_ENDPOINTS>
  | IdOf<typeof VAL_ENDPOINTS>
  | IdOf<typeof LOR_ENDPOINTS>
  | IdOf<typeof TOURNAMENT_ENDPOINTS>
