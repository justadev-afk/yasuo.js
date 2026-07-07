import { Game } from '../enums/game'
import type { Endpoint } from './endpoint'

/**
 * VALORANT endpoints. All route by {@link Shard} (VAL's platform routing) — the
 * `{routing}` host segment is the shard (`na`, `eu`, `ap`, `kr`, …).
 *
 * Covers VAL-CONTENT-V1, VAL-MATCH-V1, VAL-CONSOLE-MATCH-V1, VAL-RANKED-V1 and
 * VAL-STATUS-V1. Match, ranked and console endpoints require a production key
 * with VALORANT access.
 */
export const VAL_ENDPOINTS = {
  // VAL-CONTENT-V1
  content: {
    id: 'val.content.contents',
    game: Game.VAL,
    path: 'content/v1/contents',
  },

  // VAL-STATUS-V1
  status: {
    id: 'val.status.platformData',
    game: Game.VAL,
    path: 'status/v1/platform-data',
  },

  // VAL-MATCH-V1
  matchById: {
    id: 'val.match.byId',
    game: Game.VAL,
    path: 'match/v1/matches/:matchId',
  },
  matchlistByPuuid: {
    id: 'val.match.matchlist',
    game: Game.VAL,
    path: 'match/v1/matchlists/by-puuid/:puuid',
  },
  recentMatchesByQueue: {
    id: 'val.match.recent',
    game: Game.VAL,
    path: 'match/v1/recent-matches/by-queue/:queue',
  },

  // VAL-CONSOLE-MATCH-V1 (requires the `platformType` query parameter)
  consoleMatchlistByPuuid: {
    id: 'val.consoleMatch.matchlist',
    game: Game.VAL,
    path: 'match/console/v1/matchlists/by-puuid/:puuid',
  },
  consoleRecentMatchesByQueue: {
    id: 'val.consoleMatch.recent',
    game: Game.VAL,
    path: 'match/console/v1/recent-matches/by-queue/:queue',
  },

  // VAL-RANKED-V1
  rankedLeaderboardByAct: {
    id: 'val.ranked.leaderboard',
    game: Game.VAL,
    path: 'ranked/v1/leaderboards/by-act/:actId',
  },
} as const satisfies Record<string, Endpoint>
