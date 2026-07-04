/**
 * Base hosts for Data Dragon and the static community data, used to build
 * asset/data URLs without hard-coding them at call sites.
 */
export enum DataDragonHost {
  /** Versioned game data & assets. */
  DDRAGON = 'https://ddragon.leagueoflegends.com',
  /** Static reference data (queues, maps, game modes, …). */
  STATIC = 'https://static.developer.riotgames.com',
}
