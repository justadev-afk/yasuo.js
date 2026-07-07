import type {
  TournamentCodeParametersDTO,
  TournamentProviderRegistrationDTO,
  TournamentRegistrationDTO,
} from '../../dto/lol/tournament.dto'
import type { Endpoint } from '../../endpoints/endpoint'
import { LobbyEventsEntity } from '../../entities/lol/lobby-events.entity'
import { TournamentCodeEntity } from '../../entities/lol/tournament-code.entity'
import type { ValueResult } from '../../entities/value-result'
import { CacheNamespace } from '../../enums/cache-namespace'
import type { RegionGroup } from '../../enums/region'
import type { CollectionQuery } from '../../query/collection-query'
import type { SingleQuery } from '../../query/single-query'
import { BaseNamespace } from '../base-namespace'

/** Options for {@link TournamentBaseNamespace.createCodes}. */
export interface TournamentCodeCreateOptions {
  /** The tournament id the codes belong to. */
  readonly tournamentId: number
  /** How many codes to generate (1–1000). Defaults to Riot's server-side `1`. */
  readonly count?: number
}

/** The endpoint set a concrete tournament namespace binds to (live or stub). */
export interface TournamentEndpointSet {
  readonly createProvider: Endpoint
  readonly createTournament: Endpoint
  readonly createCodes: Endpoint
  readonly getCode: Endpoint
  readonly lobbyEvents: Endpoint
}

/**
 * Shared TOURNAMENT-V5 methods, bound to either the live or the stub endpoint
 * set by a concrete subclass. Routes by {@link RegionGroup}; creation calls are
 * `POST` with a JSON body.
 */
export abstract class TournamentBaseNamespace extends BaseNamespace {
  protected readonly cacheNamespace = CacheNamespace.LolTournament
  /** The endpoints (live or stub) this namespace targets. */
  protected abstract readonly endpoints: TournamentEndpointSet

  /**
   * Generate tournament codes.
   *
   * @param params - Code settings (map, pick/spectator type, team size…).
   * @param regionGroup - The regional routing value (usually `AMERICAS`).
   * @param options - The `tournamentId` and optional `count`.
   * @returns A `CollectionQuery<string>` of the generated codes.
   */
  createCodes(
    params: TournamentCodeParametersDTO,
    regionGroup: RegionGroup,
    options: TournamentCodeCreateOptions,
  ): CollectionQuery<string> {
    return this.scalarMany<string>(regionGroup, this.endpoints.createCodes, {
      body: params,
      query: { count: options.count, tournamentId: options.tournamentId },
    })
  }

  /**
   * Look up a tournament code and its settings.
   *
   * @param tournamentCode - The code string.
   * @param regionGroup - The regional routing value.
   */
  getCode(tournamentCode: string, regionGroup: RegionGroup): SingleQuery<TournamentCodeEntity> {
    return this.single(
      TournamentCodeEntity,
      regionGroup,
      this.endpoints.getCode,
      this.groupContext(regionGroup),
      { pathParams: { tournamentCode } },
    )
  }

  /**
   * The lobby events recorded for a tournament code.
   *
   * @param tournamentCode - The code string.
   * @param regionGroup - The regional routing value.
   */
  lobbyEvents(tournamentCode: string, regionGroup: RegionGroup): SingleQuery<LobbyEventsEntity> {
    return this.single(
      LobbyEventsEntity,
      regionGroup,
      this.endpoints.lobbyEvents,
      this.groupContext(regionGroup),
      { pathParams: { tournamentCode } },
    )
  }

  /**
   * Register a tournament provider (the callback that receives game results).
   *
   * @param params - The provider `region` and callback `url`.
   * @param regionGroup - The regional routing value.
   * @returns A `SingleQuery<ValueResult<number>>` — the provider id (`.value`).
   */
  registerProvider(
    params: TournamentProviderRegistrationDTO,
    regionGroup: RegionGroup,
  ): SingleQuery<ValueResult<number>> {
    return this.scalar<number>(regionGroup, this.endpoints.createProvider, { body: params })
  }

  /**
   * Register a tournament under a provider.
   *
   * @param params - The `providerId` and optional `name`.
   * @param regionGroup - The regional routing value.
   * @returns A `SingleQuery<ValueResult<number>>` — the tournament id (`.value`).
   */
  registerTournament(
    params: TournamentRegistrationDTO,
    regionGroup: RegionGroup,
  ): SingleQuery<ValueResult<number>> {
    return this.scalar<number>(regionGroup, this.endpoints.createTournament, { body: params })
  }
}
