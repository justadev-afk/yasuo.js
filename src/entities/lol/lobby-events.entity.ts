import type { LobbyEventDTO, LobbyEventsWrapperDTO } from '../../dto/lol/tournament.dto'
import { Entity } from '../entity'

export interface LobbyEventsEntity extends LobbyEventsWrapperDTO {}

/**
 * The lobby events recorded for a tournament code, with response metadata.
 *
 * @example
 * ```ts
 * const events = await yasuo.lol.tournament.lobbyEvents(code).execute()
 * if (events.error) return
 * for (const e of events.events()) console.log(e.eventType, e.puuid)
 * ```
 */
export class LobbyEventsEntity extends Entity<LobbyEventsWrapperDTO> {
  /** The lobby events, oldest first (alias for `eventList`). */
  events(): LobbyEventDTO[] {
    return this.eventList
  }
}
