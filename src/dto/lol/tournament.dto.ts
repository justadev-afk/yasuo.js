/**
 * Body for registering a tournament provider (TOURNAMENT-V5
 * `POST providers`). `region` uses the shorthand tournament region codes
 * (see {@link TournamentRegion}); `url` is the callback that receives game
 * result events.
 */
export interface TournamentProviderRegistrationDTO {
  /** Tournament region code (e.g. `NA`, `EUW`, `KR`). */
  readonly region: string
  /** Callback URL for tournament game result events. */
  readonly url: string
}

/**
 * Body for registering a tournament (TOURNAMENT-V5 `POST tournaments`).
 */
export interface TournamentRegistrationDTO {
  /** Provider id returned by provider registration. */
  readonly providerId: number
  /** Optional display name for the tournament. */
  readonly name?: string
}

/**
 * Body for generating tournament codes (TOURNAMENT-V5 `POST codes`).
 */
export interface TournamentCodeParametersDTO {
  /** Map for the games (see {@link TournamentMap}). */
  readonly mapType: string
  /** Pick type (see {@link TournamentPickType}). */
  readonly pickType: string
  /** Spectator policy (see {@link TournamentSpectatorType}). */
  readonly spectatorType: string
  /** Team size, 1–5. */
  readonly teamSize: number
  /** PUUIDs allowed to join. Omit for an open code. */
  readonly allowedParticipants?: string[]
  /** Opaque string stored on the code and echoed back on lobby events. */
  readonly metadata?: string
  /** Require the full set of `allowedParticipants` before the game can start. */
  readonly enoughPlayers?: boolean
}

/**
 * Body for updating a tournament code (TOURNAMENT-V5 `PUT codes/{code}`).
 */
export interface TournamentCodeUpdateParametersDTO {
  /** Replacement list of allowed PUUIDs. */
  readonly allowedParticipants?: string[]
  readonly pickType: string
  readonly mapType: string
  readonly spectatorType: string
}

/**
 * A tournament code and its settings (TOURNAMENT-V5 `GET codes/{code}`).
 */
export interface TournamentCodeDTO {
  readonly code: string
  readonly spectators: string
  readonly lobbyName: string
  readonly metaData: string
  readonly password: string
  readonly teamSize: number
  readonly providerId: number
  readonly pickType: string
  readonly tournamentId: number
  readonly id: number
  readonly region: string
  readonly map: string
  /** PUUIDs allowed to use the code. */
  readonly participants: string[]
}

/**
 * A single tournament lobby event.
 */
export interface LobbyEventDTO {
  /** Epoch-millisecond timestamp (as a string). */
  readonly timestamp: string
  /** Event type, e.g. `PracticeGameCreatedEvent`. */
  readonly eventType: string
  /** PUUID the event pertains to, when applicable. */
  readonly puuid?: string
}

/**
 * The lobby-event list for a code (TOURNAMENT-V5 `GET lobby-events/by-code`).
 */
export interface LobbyEventsWrapperDTO {
  readonly eventList: LobbyEventDTO[]
}
