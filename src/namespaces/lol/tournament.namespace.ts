import type { TournamentCodeUpdateParametersDTO } from '../../dto/lol/tournament.dto'
import { TOURNAMENT_ENDPOINTS } from '../../endpoints/tournament'
import type { ValueResult } from '../../entities/value-result'
import type { RegionGroup } from '../../enums/region'
import type { SingleQuery } from '../../query/single-query'
import { TournamentBaseNamespace, type TournamentEndpointSet } from './tournament-base.namespace'

/**
 * TOURNAMENT-V5 methods (live). Requires a production key with tournament
 * access. For building/testing without one, use `yasuo.lol.tournamentStub`.
 */
export class TournamentNamespace extends TournamentBaseNamespace {
  protected readonly endpoints: TournamentEndpointSet = {
    createProvider: TOURNAMENT_ENDPOINTS.createProvider,
    createTournament: TOURNAMENT_ENDPOINTS.createTournament,
    createCodes: TOURNAMENT_ENDPOINTS.createCodes,
    getCode: TOURNAMENT_ENDPOINTS.getCode,
    lobbyEvents: TOURNAMENT_ENDPOINTS.lobbyEvents,
  }

  /**
   * Update a tournament code's settings (live only). Success is signalled by a
   * `null` `.error` on the resolved result.
   *
   * @param tournamentCode - The code to update.
   * @param params - The new pick/map/spectator settings and allowed participants.
   * @param regionGroup - The regional routing value.
   */
  updateCode(
    tournamentCode: string,
    params: TournamentCodeUpdateParametersDTO,
    regionGroup: RegionGroup,
  ): SingleQuery<ValueResult<void>> {
    return this.scalar<void>(regionGroup, TOURNAMENT_ENDPOINTS.updateCode, {
      pathParams: { tournamentCode },
      body: params,
    })
  }
}
