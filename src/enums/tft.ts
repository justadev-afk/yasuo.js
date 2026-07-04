/**
 * Queues accepted by the TFT rated-ladder endpoint
 * (`TFT-LEAGUE-V1 /rated-ladders/{queue}/top`).
 *
 * The rated ladder only exists for the Hyper Roll queue.
 *
 * @see {@link https://developer.riotgames.com/apis#tft-league-v1}
 */
export enum TftRatedLadderQueue {
  /** Hyper Roll (`RANKED_TFT_TURBO`). */
  HYPER_ROLL = 'RANKED_TFT_TURBO',
}
