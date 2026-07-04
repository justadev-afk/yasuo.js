/**
 * Platform routing values (a.k.a. "platform regions").
 *
 * These identify a specific game server shard and are used by the
 * platform-scoped APIs: Summoner, League, Champion-Mastery, Champion,
 * Spectator, Status and Clash.
 *
 * The enum keys are the community-facing short codes (`EUW`, `NA`, `KR`…)
 * while the values are the exact platform identifiers Riot expects in the URL
 * host (`EUW1`, `NA1`, `KR`…).
 *
 * @see {@link https://developer.riotgames.com/docs/lol#routing-values}
 */
export enum Region {
  /** Brazil. */
  BR = 'BR1',
  /** Europe Nordic & East. */
  EUNE = 'EUN1',
  /** Europe West. */
  EUW = 'EUW1',
  /** Republic of Korea. */
  KR = 'KR',
  /** Latin America North. */
  LAN = 'LA1',
  /** Latin America South. */
  LAS = 'LA2',
  /** North America. */
  NA = 'NA1',
  /** Oceania. */
  OCE = 'OC1',
  /** Turkey. */
  TR = 'TR1',
  /** Russia. */
  RU = 'RU',
  /** Japan. */
  JP = 'JP1',
  /** Vietnam. */
  VN = 'VN2',
  /** Taiwan, Hong Kong and Macao. */
  TW = 'TW2',
  /** Singapore, Malaysia and Indonesia. */
  SG = 'SG2',
  /** Middle East. */
  ME = 'ME1',
  /** Public Beta Environment. */
  PBE = 'PBE1',
}

/**
 * Regional routing values (a.k.a. "region groups").
 *
 * These aggregate several {@link Region}s into a single super-region and are
 * used by the account-scoped and cross-region APIs: Account, Match-V5 and
 * TFT Match.
 *
 * @see {@link https://developer.riotgames.com/docs/lol#routing-values}
 */
export enum RegionGroup {
  /** Serves NA, BR, LAN and LAS. */
  AMERICAS = 'AMERICAS',
  /** Serves KR and JP. */
  ASIA = 'ASIA',
  /** Serves EUNE, EUW, TR, RU and ME. */
  EUROPE = 'EUROPE',
  /** Serves OCE, SG, TW and VN. */
  SEA = 'SEA',
}

/**
 * The subset of {@link RegionGroup} accepted by the ACCOUNT-V1 API.
 *
 * Account-V1 only exposes three clusters — `AMERICAS`, `ASIA` and `EUROPE`.
 * `SEA` is not a valid account routing value, so
 * {@link regionToAccountRegionGroup} folds it into `ASIA`.
 */
export type AccountRegionGroup = Exclude<RegionGroup, RegionGroup.SEA>

/**
 * Resolve the {@link RegionGroup} that serves a given platform {@link Region}.
 *
 * Used automatically by lazy relations so that, for example, a summoner
 * fetched from {@link Region.KR} traverses to their match history on
 * {@link RegionGroup.ASIA} without the caller re-specifying the routing value.
 *
 * @param region - The platform region to map.
 * @returns The regional routing value that serves it.
 * @throws {RangeError} If the region is not a recognised {@link Region}.
 * @example
 * ```ts
 * regionToRegionGroup(Region.EUW) // RegionGroup.EUROPE
 * regionToRegionGroup(Region.OCE) // RegionGroup.SEA
 * ```
 */
export function regionToRegionGroup(region: Region): RegionGroup {
  switch (region) {
    case Region.NA:
    case Region.BR:
    case Region.LAN:
    case Region.LAS:
    case Region.PBE:
      return RegionGroup.AMERICAS
    case Region.EUNE:
    case Region.EUW:
    case Region.TR:
    case Region.RU:
    case Region.ME:
      return RegionGroup.EUROPE
    case Region.KR:
    case Region.JP:
      return RegionGroup.ASIA
    case Region.OCE:
    case Region.SG:
    case Region.TW:
    case Region.VN:
      return RegionGroup.SEA
    default:
      throw new RangeError(`Unknown region: ${String(region)}`)
  }
}

/**
 * Resolve the {@link AccountRegionGroup} for a platform {@link Region}.
 *
 * Identical to {@link regionToRegionGroup} except that `SEA` is folded into
 * `ASIA`, since ACCOUNT-V1 does not accept `SEA`.
 *
 * @param region - The platform region to map.
 * @returns An account-compatible routing value (`AMERICAS`, `ASIA` or `EUROPE`).
 * @example
 * ```ts
 * regionToAccountRegionGroup(Region.OCE) // RegionGroup.ASIA
 * ```
 */
export function regionToAccountRegionGroup(region: Region): AccountRegionGroup {
  const group = regionToRegionGroup(region)
  return group === RegionGroup.SEA ? RegionGroup.ASIA : group
}

const PLATFORM_ID_TO_REGION: ReadonlyMap<string, Region> = new Map(
  Object.values(Region).map((value) => [value.toUpperCase(), value as Region]),
)

/**
 * Resolve the {@link Region} for a `platformId` such as the one embedded in a
 * MATCH-V5 `info.platformId` (`"KR"`, `"EUW1"`, `"NA1"`…).
 *
 * Used by lazy relations to traverse from a match participant back to their
 * summoner without the caller supplying the region.
 *
 * @param platformId - Platform identifier, case-insensitive.
 * @returns The matching region, or `null` if unrecognised.
 */
export function regionFromPlatformId(platformId: string): Region | null {
  return PLATFORM_ID_TO_REGION.get(platformId.toUpperCase()) ?? null
}
