/**
 * Achievement level of a challenge, as returned by LOL-CHALLENGES-V1.
 */
export enum ChallengeLevel {
  NONE = 'NONE',
  IRON = 'IRON',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  GRANDMASTER = 'GRANDMASTER',
  CHALLENGER = 'CHALLENGER',
  HIGHEST = 'HIGHEST',
  LOWEST = 'LOWEST',
}

/**
 * Top-level challenge categories that group individual challenges and
 * accumulate category points.
 */
export enum ChallengeCategory {
  VETERANCY = 'VETERANCY',
  COLLECTION = 'COLLECTION',
  EXPERTISE = 'EXPERTISE',
  IMAGINATION = 'IMAGINATION',
  TEAMWORK = 'TEAMWORK',
}
