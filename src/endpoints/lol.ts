import { Game } from '../enums/game'
import type { Endpoint } from './endpoint'

/**
 * League of Legends endpoints.
 *
 * `summoner`, `league`, `champion-mastery`, `champion`, `spectator`, `status`
 * and `clash`/`challenges` use **platform** routing ({@link Region}).
 * `match/v5` uses **regional** routing ({@link RegionGroup}).
 */
export const LOL_ENDPOINTS = {
  // SUMMONER-V4
  summonerByPuuid: {
    id: 'lol.summoner.byPuuid',
    game: Game.LOL,
    path: 'summoner/v4/summoners/by-puuid/:puuid',
  },
  summonerById: {
    id: 'lol.summoner.byId',
    game: Game.LOL,
    path: 'summoner/v4/summoners/:summonerId',
  },
  summonerByAccount: {
    id: 'lol.summoner.byAccount',
    game: Game.LOL,
    path: 'summoner/v4/summoners/by-account/:accountId',
  },

  // LEAGUE-V4
  leagueEntriesByPuuid: {
    id: 'lol.league.entriesByPuuid',
    game: Game.LOL,
    path: 'league/v4/entries/by-puuid/:puuid',
  },
  leagueEntriesBySummoner: {
    id: 'lol.league.entriesBySummoner',
    game: Game.LOL,
    path: 'league/v4/entries/by-summoner/:summonerId',
  },
  leagueEntries: {
    id: 'lol.league.entries',
    game: Game.LOL,
    path: 'league/v4/entries/:queue/:tier/:division',
  },
  leagueExpEntries: {
    id: 'lol.league.expEntries',
    game: Game.LOL,
    path: 'league-exp/v4/entries/:queue/:tier/:division',
  },
  leagueChallenger: {
    id: 'lol.league.challenger',
    game: Game.LOL,
    path: 'league/v4/challengerleagues/by-queue/:queue',
  },
  leagueGrandmaster: {
    id: 'lol.league.grandmaster',
    game: Game.LOL,
    path: 'league/v4/grandmasterleagues/by-queue/:queue',
  },
  leagueMaster: {
    id: 'lol.league.master',
    game: Game.LOL,
    path: 'league/v4/masterleagues/by-queue/:queue',
  },
  leagueById: {
    id: 'lol.league.byId',
    game: Game.LOL,
    path: 'league/v4/leagues/:leagueId',
  },

  // CHAMPION-MASTERY-V4
  masteryByPuuid: {
    id: 'lol.mastery.byPuuid',
    game: Game.LOL,
    path: 'champion-mastery/v4/champion-masteries/by-puuid/:puuid',
  },
  masteryByPuuidChampion: {
    id: 'lol.mastery.byPuuidChampion',
    game: Game.LOL,
    path: 'champion-mastery/v4/champion-masteries/by-puuid/:puuid/by-champion/:championId',
  },
  masteryTop: {
    id: 'lol.mastery.top',
    game: Game.LOL,
    path: 'champion-mastery/v4/champion-masteries/by-puuid/:puuid/top',
  },
  masteryScore: {
    id: 'lol.mastery.score',
    game: Game.LOL,
    path: 'champion-mastery/v4/scores/by-puuid/:puuid',
  },

  // CHAMPION-V3
  championRotation: {
    id: 'lol.champion.rotation',
    game: Game.LOL,
    path: 'platform/v3/champion-rotations',
  },

  // MATCH-V5 (regional routing)
  matchById: {
    id: 'lol.match.byId',
    game: Game.LOL,
    path: 'match/v5/matches/:matchId',
  },
  matchIdsByPuuid: {
    id: 'lol.match.idsByPuuid',
    game: Game.LOL,
    path: 'match/v5/matches/by-puuid/:puuid/ids',
  },
  matchTimeline: {
    id: 'lol.match.timeline',
    game: Game.LOL,
    path: 'match/v5/matches/:matchId/timeline',
  },

  // SPECTATOR-V5
  spectatorActive: {
    id: 'lol.spectator.active',
    game: Game.LOL,
    path: 'spectator/v5/active-games/by-summoner/:puuid',
  },
  spectatorFeatured: {
    id: 'lol.spectator.featured',
    game: Game.LOL,
    path: 'spectator/v5/featured-games',
  },

  // LOL-STATUS-V4
  status: {
    id: 'lol.status.platformData',
    game: Game.LOL,
    path: 'status/v4/platform-data',
  },

  // CLASH-V1
  clashPlayersByPuuid: {
    id: 'lol.clash.playersByPuuid',
    game: Game.LOL,
    path: 'clash/v1/players/by-puuid/:puuid',
  },
  clashTeamById: {
    id: 'lol.clash.teamById',
    game: Game.LOL,
    path: 'clash/v1/teams/:teamId',
  },
  clashTournaments: {
    id: 'lol.clash.tournaments',
    game: Game.LOL,
    path: 'clash/v1/tournaments',
  },
  clashTournamentByTeam: {
    id: 'lol.clash.tournamentByTeam',
    game: Game.LOL,
    path: 'clash/v1/tournaments/by-team/:teamId',
  },
  clashTournamentById: {
    id: 'lol.clash.tournamentById',
    game: Game.LOL,
    path: 'clash/v1/tournaments/:tournamentId',
  },

  // LOL-CHALLENGES-V1
  challengesConfig: {
    id: 'lol.challenges.config',
    game: Game.LOL,
    path: 'challenges/v1/challenges/config',
  },
  challengesPercentiles: {
    id: 'lol.challenges.percentiles',
    game: Game.LOL,
    path: 'challenges/v1/challenges/percentiles',
  },
  challengeConfigById: {
    id: 'lol.challenges.configById',
    game: Game.LOL,
    path: 'challenges/v1/challenges/:challengeId/config',
  },
  challengeLeaderboards: {
    id: 'lol.challenges.leaderboards',
    game: Game.LOL,
    path: 'challenges/v1/challenges/:challengeId/leaderboards/by-level/:level',
  },
  challengePercentilesById: {
    id: 'lol.challenges.percentilesById',
    game: Game.LOL,
    path: 'challenges/v1/challenges/:challengeId/percentiles',
  },
  challengesPlayer: {
    id: 'lol.challenges.player',
    game: Game.LOL,
    path: 'challenges/v1/player-data/:puuid',
  },
} as const satisfies Record<string, Endpoint>
