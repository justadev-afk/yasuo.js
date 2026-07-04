import type { PlayerChallengesDTO } from '../../dto/lol/challenges.dto'
import { Entity } from '../entity'

export interface PlayerChallengesEntity extends PlayerChallengesDTO {}

/** A player's challenge progress with response metadata. */
export class PlayerChallengesEntity extends Entity<PlayerChallengesDTO> {}
