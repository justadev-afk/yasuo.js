/**
 * Riot game identifiers, as used in the API URL path segment (`/lol`, `/tft`,
 * `/riot`).
 */
export enum Game {
  /** League of Legends. */
  LOL = 'lol',
  /** Teamfight Tactics. */
  TFT = 'tft',
  /** Shared Riot services (e.g. Account-V1). */
  RIOT = 'riot',
}
