import type { MatchTimelineDTO } from '../../dto/lol/timeline.dto'
import type { RegionGroup } from '../../enums/region'
import { Entity } from '../entity'
import type { MatchEntity } from './match.entity'

export interface MatchTimelineEntity extends MatchTimelineDTO {}

/** A match timeline with a lazy relation back to the full match. */
export class MatchTimelineEntity extends Entity<MatchTimelineDTO> {
  private get regionGroup(): RegionGroup {
    return this.context.regionGroup as RegionGroup
  }

  /** The match id this timeline belongs to. */
  get id(): string {
    return this.metadata.matchId
  }

  /** Fetch the full match this timeline belongs to. */
  match(): Promise<MatchEntity> {
    return this.context.client.lol.match.get(this.id, this.regionGroup)
  }
}
