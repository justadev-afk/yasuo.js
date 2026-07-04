/** Localised content for a status update or title. */
export interface StatusContentDTO {
  /** Locale of the content, e.g. `en_US`. */
  readonly locale: string
  /** The content text. */
  readonly content: string
}

/** A single update within a maintenance/incident. */
export interface StatusUpdateDTO {
  readonly id: number
  readonly author: string
  readonly publish: boolean
  /** Where the update is published, e.g. `riotclient`, `riotstatus`, `game`. */
  readonly publish_locations: string[]
  readonly translations: StatusContentDTO[]
  readonly created_at: string
  readonly updated_at: string
}

/** A maintenance or incident entry. */
export interface StatusEntryDTO {
  readonly id: number
  readonly titles: StatusContentDTO[]
  readonly updates: StatusUpdateDTO[]
  readonly created_at: string
  /** Affected platforms, e.g. `windows`, `macos`, `android`, `ios`. */
  readonly platforms: string[]
  /** `scheduled` | `in_progress` | `complete` (maintenances only). */
  readonly maintenance_status?: string
  /** `info` | `warning` | `critical` (incidents only). */
  readonly incident_severity?: string
  readonly archive_at?: string
  readonly updated_at?: string
}

/** Platform status, as returned by LOL-STATUS-V4. */
export interface PlatformDataDTO {
  /** Platform id, e.g. `KR`. */
  readonly id: string
  /** Platform name, e.g. `Korea`. */
  readonly name: string
  /** Locales supported on the platform. */
  readonly locales: string[]
  /** Ongoing/scheduled maintenances. */
  readonly maintenances: StatusEntryDTO[]
  /** Ongoing incidents. */
  readonly incidents: StatusEntryDTO[]
}
