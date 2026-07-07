import type { ValActDTO, ValContentDTO } from '../../dto/val/content.dto'
import { Entity } from '../entity'

export interface ValContentEntity extends ValContentDTO {}

/**
 * VALORANT static content (agents, maps, skins, acts…) with response metadata.
 *
 * @example
 * ```ts
 * const content = await yasuo.val.content.get(Shard.NA).execute()
 * if (content.error) return
 * console.log(content.version, content.activeAct()?.name)
 * ```
 */
export class ValContentEntity extends Entity<ValContentDTO> {
  /** The currently active competitive act, or `undefined` when none is flagged. */
  activeAct(): ValActDTO | undefined {
    return this.acts.find((act) => act.isActive)
  }
}
