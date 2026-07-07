import { Game } from '../enums/game'
import type { Endpoint } from './endpoint'

/**
 * Legends of Runeterra endpoints. All route by {@link RegionGroup}
 * (`americas`, `asia`, `europe`, `sea`).
 *
 * Covers LOR-MATCH-V1, LOR-RANKED-V1 and LOR-STATUS-V1. The RSO-gated
 * LOR-DECK-V1 / LOR-INVENTORY-V1 (which need a user OAuth token) are not
 * included.
 */
export const LOR_ENDPOINTS = {
  // LOR-MATCH-V1
  matchIdsByPuuid: {
    id: 'lor.match.idsByPuuid',
    game: Game.LOR,
    path: 'match/v1/matches/by-puuid/:puuid/ids',
  },
  matchById: {
    id: 'lor.match.byId',
    game: Game.LOR,
    path: 'match/v1/matches/:matchId',
  },

  // LOR-RANKED-V1
  rankedLeaderboard: {
    id: 'lor.ranked.leaderboard',
    game: Game.LOR,
    path: 'ranked/v1/leaderboards',
  },

  // LOR-STATUS-V1
  status: {
    id: 'lor.status.platformData',
    game: Game.LOR,
    path: 'status/v1/platform-data',
  },
} as const satisfies Record<string, Endpoint>
