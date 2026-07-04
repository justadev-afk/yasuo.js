import type { PlatformDataDTO } from '../../dto/lol/status.dto'
import { Entity } from '../entity'

export interface PlatformStatusEntity extends PlatformDataDTO {}

/** Platform status with response metadata. */
export class PlatformStatusEntity extends Entity<PlatformDataDTO> {
  /** Whether there is any ongoing incident or maintenance. */
  hasActiveIssues(): boolean {
    return this.incidents.length > 0 || this.maintenances.length > 0
  }
}
