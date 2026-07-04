/**
 * Match category filter accepted by the MATCH-V5 "matches by PUUID" endpoint's
 * `type` query parameter.
 */
export enum MatchType {
  RANKED = 'ranked',
  NORMAL = 'normal',
  TOURNEY = 'tourney',
  TUTORIAL = 'tutorial',
}
