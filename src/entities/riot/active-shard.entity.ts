import type { ActiveShardDTO } from '../../dto/riot/account.dto'
import { Entity } from '../entity'

export interface ActiveShardEntity extends ActiveShardDTO {}

/** The active shard of a player for a game (ACCOUNT-V1). */
export class ActiveShardEntity extends Entity<ActiveShardDTO> {}
