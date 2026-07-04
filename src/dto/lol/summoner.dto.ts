/**
 * A League of Legends summoner profile, as returned by SUMMONER-V4.
 *
 * @remarks
 * Riot has removed `accountId` and `name` from this payload, and `id`
 * (the encrypted summoner id) is deprecated and often absent — prefer
 * {@link SummonerDTO.puuid} everywhere.
 */
export interface SummonerDTO {
  /** Encrypted PUUID. Exact length of 78 characters. */
  readonly puuid: string
  /** ID of the summoner icon associated with the summoner. */
  readonly profileIconId: number
  /** Summoner level. */
  readonly summonerLevel: number
  /** Date the summoner was last modified, as epoch milliseconds. */
  readonly revisionDate: number
  /**
   * Encrypted summoner ID (max 63 chars).
   * @deprecated Removed from most responses — use {@link SummonerDTO.puuid}.
   */
  readonly id?: string
}
