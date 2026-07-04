import type { AccountRegionDTO } from '../../dto/riot/account.dto'
import { type Region, regionFromPlatformId } from '../../enums/region'
import { Entity } from '../entity'

export interface AccountRegionEntity extends AccountRegionDTO {}

/** The active region of a player for a game (ACCOUNT-V1). */
export class AccountRegionEntity extends Entity<AccountRegionDTO> {
  /** Resolve the {@link Region} enum member for this active region, if known. */
  toRegion(): Region | null {
    return regionFromPlatformId(this.region)
  }
}
