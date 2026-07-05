import type { Collection } from '../entities/collection'
import type { ExecuteOptions, QueryRunner } from './execute-options'

/**
 * A deferred request for a **collection** of resources.
 *
 * Building the query performs no I/O — call {@link execute} to run it. It
 * resolves to a {@link Collection} **directly** (an array carrying its own
 * `.error` and `.http`); it does not throw for an API-level failure unless you
 * pass `{ throw: true }`. Pass `{ raw: true }` to get the raw Riot payload; it is
 * typed `unknown` by default, or supply a type argument when you know the shape:
 * `execute<string[]>({ raw: true })`.
 *
 * @typeParam T - The item type of the resolved collection.
 * @example
 * ```ts
 * const entries = await yasuo.lol.league.byPuuid(puuid, Region.KR).execute()
 * if (entries.error) return
 * for (const entry of entries) console.log(entry.leaguePoints)
 * ```
 */
export class CollectionQuery<T> {
  /**
   * @param runner - Runs the request and resolves the mapped collection.
   */
  constructor(private readonly runner: QueryRunner<Collection<T>>) {}

  /**
   * Run the request and resolve the raw Riot payload. Typed `unknown` by
   * default; pass a type argument when you know the shape
   * (`execute<string[]>({ raw: true })`) — an unchecked assertion, so it is your
   * responsibility that it matches.
   */
  execute<R = unknown>(options: ExecuteOptions & { raw: true }): Promise<R>
  /** Run the request and resolve the {@link Collection} directly. */
  execute(options?: ExecuteOptions): Promise<Collection<T>>
  execute(options: ExecuteOptions = {}): Promise<Collection<T> | unknown> {
    return this.runner(options)
  }
}
