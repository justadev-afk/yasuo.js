import { Game } from '../enums/game'
import { HttpMethod } from '../enums/http'
import type { Endpoint } from './endpoint'

/**
 * TOURNAMENT-V5 and TOURNAMENT-STUB-V5 endpoints (League of Legends). All route
 * by {@link RegionGroup} (`americas`, `asia`, `europe`).
 *
 * The provider/tournament/code creation calls are `POST`, code update is `PUT`,
 * and both carry a JSON body. The **stub** variants mint fake codes without a
 * production tournament key — use them to build against the flow. Signed with
 * the League of Legends product key.
 */
export const TOURNAMENT_ENDPOINTS = {
  // TOURNAMENT-V5
  createProvider: {
    id: 'lol.tournament.createProvider',
    game: Game.LOL,
    path: 'tournament/v5/providers',
    method: HttpMethod.POST,
  },
  createTournament: {
    id: 'lol.tournament.createTournament',
    game: Game.LOL,
    path: 'tournament/v5/tournaments',
    method: HttpMethod.POST,
  },
  createCodes: {
    id: 'lol.tournament.createCodes',
    game: Game.LOL,
    path: 'tournament/v5/codes',
    method: HttpMethod.POST,
  },
  getCode: {
    id: 'lol.tournament.getCode',
    game: Game.LOL,
    path: 'tournament/v5/codes/:tournamentCode',
  },
  updateCode: {
    id: 'lol.tournament.updateCode',
    game: Game.LOL,
    path: 'tournament/v5/codes/:tournamentCode',
    method: HttpMethod.PUT,
  },
  lobbyEvents: {
    id: 'lol.tournament.lobbyEvents',
    game: Game.LOL,
    path: 'tournament/v5/lobby-events/by-code/:tournamentCode',
  },

  // TOURNAMENT-STUB-V5
  stubCreateProvider: {
    id: 'lol.tournamentStub.createProvider',
    game: Game.LOL,
    path: 'tournament-stub/v5/providers',
    method: HttpMethod.POST,
  },
  stubCreateTournament: {
    id: 'lol.tournamentStub.createTournament',
    game: Game.LOL,
    path: 'tournament-stub/v5/tournaments',
    method: HttpMethod.POST,
  },
  stubCreateCodes: {
    id: 'lol.tournamentStub.createCodes',
    game: Game.LOL,
    path: 'tournament-stub/v5/codes',
    method: HttpMethod.POST,
  },
  stubGetCode: {
    id: 'lol.tournamentStub.getCode',
    game: Game.LOL,
    path: 'tournament-stub/v5/codes/:tournamentCode',
  },
  stubLobbyEvents: {
    id: 'lol.tournamentStub.lobbyEvents',
    game: Game.LOL,
    path: 'tournament-stub/v5/lobby-events/by-code/:tournamentCode',
  },
} as const satisfies Record<string, Endpoint>
