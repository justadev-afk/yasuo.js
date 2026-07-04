import type { RateLimits, ResponseMeta } from '../dto/common.dto'
import type { EntityContext } from './entity-context'

/**
 * Base class for every rich entity returned by the client.
 *
 * An entity is the raw Riot payload (its fields are copied onto the instance)
 * augmented with {@link Entity.meta} rate-limit metadata and lazy-relation
 * methods. It is the modern evolution of Twisted's `{ response, rateLimits }`
 * envelope: the data and its metadata travel together, and related resources
 * are one method call away.
 *
 * @typeParam TData - The raw payload shape whose fields are exposed on the entity.
 */
export abstract class Entity<TData extends object> {
  /** Metadata of the response that produced this entity. */
  readonly meta: ResponseMeta
  /** Context used by lazy relations to make follow-up requests. */
  protected readonly context: EntityContext

  constructor(data: TData, meta: ResponseMeta, context: EntityContext) {
    Object.assign(this, data)
    this.meta = meta
    this.context = context
  }

  /** Shortcut to the rate-limit budget parsed from this entity's response. */
  get rateLimits(): RateLimits {
    return this.meta.rateLimits
  }
}
