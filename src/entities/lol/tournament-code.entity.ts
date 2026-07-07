import type { TournamentCodeDTO } from '../../dto/lol/tournament.dto'
import { Entity } from '../entity'

export interface TournamentCodeEntity extends TournamentCodeDTO {}

/**
 * A tournament code with its settings and response metadata.
 *
 * @example
 * ```ts
 * const code = await yasuo.lol.tournament.getCode('NA1234a-...').execute()
 * if (code.error) return
 * console.log(code.map, code.teamSize, code.participants)
 * ```
 */
export class TournamentCodeEntity extends Entity<TournamentCodeDTO> {}
