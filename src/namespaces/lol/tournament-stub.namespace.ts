import { TOURNAMENT_ENDPOINTS } from '../../endpoints/tournament'
import { TournamentBaseNamespace, type TournamentEndpointSet } from './tournament-base.namespace'

/**
 * TOURNAMENT-STUB-V5 methods. Mints fake providers/tournaments/codes without a
 * production tournament key — ideal for building and testing the flow.
 */
export class TournamentStubNamespace extends TournamentBaseNamespace {
  protected readonly endpoints: TournamentEndpointSet = {
    createProvider: TOURNAMENT_ENDPOINTS.stubCreateProvider,
    createTournament: TOURNAMENT_ENDPOINTS.stubCreateTournament,
    createCodes: TOURNAMENT_ENDPOINTS.stubCreateCodes,
    getCode: TOURNAMENT_ENDPOINTS.stubGetCode,
    lobbyEvents: TOURNAMENT_ENDPOINTS.stubLobbyEvents,
  }
}
