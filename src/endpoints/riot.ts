import { Game } from '../enums/game'
import type { Endpoint } from './endpoint'

/**
 * ACCOUNT-V1 endpoints (shared Riot services, regional routing).
 */
export const RIOT_ENDPOINTS = {
  /** Get an account by PUUID. */
  accountByPuuid: {
    id: 'riot.account.byPuuid',
    game: Game.RIOT,
    path: 'account/v1/accounts/by-puuid/:puuid',
  },
  /** Get an account by Riot ID (`gameName` + `tagLine`). */
  accountByRiotId: {
    id: 'riot.account.byRiotId',
    game: Game.RIOT,
    path: 'account/v1/accounts/by-riot-id/:gameName/:tagLine',
  },
  /** Get the active shard for a player in a game. */
  accountActiveShard: {
    id: 'riot.account.activeShard',
    game: Game.RIOT,
    path: 'account/v1/active-shards/by-game/:game/by-puuid/:puuid',
  },
  /** Get the active region for a player in a game (LoL/TFT). */
  accountActiveRegion: {
    id: 'riot.account.activeRegion',
    game: Game.RIOT,
    path: 'account/v1/region/by-game/:game/by-puuid/:puuid',
  },
} as const satisfies Record<string, Endpoint>
