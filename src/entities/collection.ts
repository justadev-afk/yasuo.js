import type { RateLimits, ResponseMeta } from '../dto/common.dto'

/**
 * An array of entities (or scalars) returned by a list endpoint, augmented
 * with the shared {@link ResponseMeta} of the response that produced it.
 *
 * Behaves like a normal array (`length`, indexing, `for..of`, `map`, …). Note
 * that array methods which return a new array (`map`, `filter`, `slice`) return
 * a plain `Array`, not a `Collection`, so the derived result has no `.meta`.
 *
 * @typeParam T - The element type.
 */
export class Collection<T> extends Array<T> {
  /** Metadata of the response that produced the collection. */
  readonly meta: ResponseMeta

  private constructor(meta: ResponseMeta, items: readonly T[]) {
    super(items.length)
    for (let index = 0; index < items.length; index += 1) {
      this[index] = items[index] as T
    }
    this.meta = meta
  }

  /**
   * Build a {@link Collection} from items and their shared response metadata.
   *
   * @param items - The elements.
   * @param meta - Metadata shared by every element.
   */
  static create<T>(items: readonly T[], meta: ResponseMeta): Collection<T> {
    return new Collection<T>(meta, items)
  }

  /** Shortcut to the rate-limit budget parsed from the response. */
  get rateLimits(): RateLimits {
    return this.meta.rateLimits
  }

  // Ensure derived array operations (`map`, `filter`, …) produce plain arrays
  // rather than attempting to construct a metadata-less Collection.
  static override get [Symbol.species](): ArrayConstructor {
    return Array
  }
}
