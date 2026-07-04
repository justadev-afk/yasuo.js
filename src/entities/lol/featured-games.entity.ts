import type { FeaturedGamesDTO } from '../../dto/lol/spectator.dto'
import { Entity } from '../entity'

export interface FeaturedGamesEntity extends FeaturedGamesDTO {}

/** The featured-games list with response metadata. */
export class FeaturedGamesEntity extends Entity<FeaturedGamesDTO> {}
