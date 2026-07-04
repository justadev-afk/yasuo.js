import { Game } from '../enums/game'
import type { Endpoint } from './endpoint'

/**
 * Teamfight Tactics endpoints.
 *
 * `summoner`, `league` and `spectator` use **platform** routing
 * ({@link Region}); `match/v1` uses **regional** routing ({@link RegionGroup}).
 */
export const TFT_ENDPOINTS = {
  // TFT-SUMMONER-V1
  summonerByPuuid: {
    id: 'tft.summoner.byPuuid',
    game: Game.TFT,
    path: 'summoner/v1/summoners/by-puuid/:puuid',
  },
  summonerById: {
    id: 'tft.summoner.byId',
    game: Game.TFT,
    path: 'summoner/v1/summoners/:summonerId',
  },

  // TFT-LEAGUE-V1
  leagueByPuuid: {
    id: 'tft.league.byPuuid',
    game: Game.TFT,
    path: 'league/v1/by-puuid/:puuid',
  },
  leagueEntriesBySummoner: {
    id: 'tft.league.entriesBySummoner',
    game: Game.TFT,
    path: 'league/v1/entries/by-summoner/:summonerId',
  },
  leagueEntries: {
    id: 'tft.league.entries',
    game: Game.TFT,
    path: 'league/v1/entries/:tier/:division',
  },
  leagueChallenger: {
    id: 'tft.league.challenger',
    game: Game.TFT,
    path: 'league/v1/challenger',
  },
  leagueGrandmaster: {
    id: 'tft.league.grandmaster',
    game: Game.TFT,
    path: 'league/v1/grandmaster',
  },
  leagueMaster: {
    id: 'tft.league.master',
    game: Game.TFT,
    path: 'league/v1/master',
  },
  leagueById: {
    id: 'tft.league.byId',
    game: Game.TFT,
    path: 'league/v1/leagues/:leagueId',
  },
  leagueRatedLadder: {
    id: 'tft.league.ratedLadder',
    game: Game.TFT,
    path: 'league/v1/rated-ladders/:queue/top',
  },

  // TFT-MATCH-V1 (regional routing)
  matchIdsByPuuid: {
    id: 'tft.match.idsByPuuid',
    game: Game.TFT,
    path: 'match/v1/matches/by-puuid/:puuid/ids',
  },
  matchById: {
    id: 'tft.match.byId',
    game: Game.TFT,
    path: 'match/v1/matches/:matchId',
  },

  // SPECTATOR-TFT-V5
  spectatorActive: {
    id: 'tft.spectator.active',
    game: Game.TFT,
    path: 'spectator/tft/v5/active-games/by-puuid/:puuid',
  },
  spectatorFeatured: {
    id: 'tft.spectator.featured',
    game: Game.TFT,
    path: 'spectator/tft/v5/featured-games',
  },
} as const satisfies Record<string, Endpoint>
