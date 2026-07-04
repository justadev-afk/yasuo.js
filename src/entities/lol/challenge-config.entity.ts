import type { ChallengeConfigDTO } from '../../dto/lol/challenges.dto'
import { Entity } from '../entity'

export interface ChallengeConfigEntity extends ChallengeConfigDTO {}

/** A challenge configuration with response metadata. */
export class ChallengeConfigEntity extends Entity<ChallengeConfigDTO> {
  /**
   * The localised name of the challenge for a locale.
   *
   * @param locale - Locale key, e.g. `en_US`. Defaults to `en_US`.
   */
  name(locale = 'en_US'): string | undefined {
    return this.localizedNames[locale]?.name
  }
}
