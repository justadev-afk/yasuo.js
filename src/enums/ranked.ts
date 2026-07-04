/**
 * Ranked queue identifiers accepted by the LEAGUE-V4 and TFT-LEAGUE-V1
 * "by queue" endpoints.
 */
export enum RankedQueue {
  /** League of Legends ranked solo/duo (Summoner's Rift). */
  SOLO_5x5 = 'RANKED_SOLO_5x5',
  /** League of Legends ranked flex (Summoner's Rift). */
  FLEX_SR = 'RANKED_FLEX_SR',
  /** League of Legends ranked flex (Twisted Treeline, legacy). */
  FLEX_TT = 'RANKED_FLEX_TT',
  /** Teamfight Tactics ranked. */
  TFT = 'RANKED_TFT',
}

/**
 * Ranked tiers, from lowest ({@link Tier.IRON}) to highest
 * ({@link Tier.CHALLENGER}).
 */
export enum Tier {
  IRON = 'IRON',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  EMERALD = 'EMERALD',
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  GRANDMASTER = 'GRANDMASTER',
  CHALLENGER = 'CHALLENGER',
}

/**
 * Divisions within a {@link Tier}, from lowest ({@link Division.IV}) to highest
 * ({@link Division.I}). The apex tiers (Master, Grandmaster, Challenger) only
 * use {@link Division.I}.
 */
export enum Division {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}
