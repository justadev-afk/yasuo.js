import type { ClashTournamentDTO } from '../../dto/lol/clash.dto'
import { Entity } from '../entity'

export interface ClashTournamentEntity extends ClashTournamentDTO {}

/** A Clash tournament with response metadata. */
export class ClashTournamentEntity extends Entity<ClashTournamentDTO> {}
