import type { ChallengePercentilesDTO } from '../../dto/lol/challenges.dto'
import { Entity } from '../entity'

export interface ChallengePercentilesEntity extends ChallengePercentilesDTO {}

/** A challenge percentile distribution (keyed by tier) with response metadata. */
export class ChallengePercentilesEntity extends Entity<ChallengePercentilesDTO> {}
