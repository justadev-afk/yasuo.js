import type { Yasuo } from '../client/yasuo'
import type { Fetched, RequestExecutor } from '../core/request/request-executor'
import type { ResponseMeta } from '../dto/common.dto'
import { Collection } from '../entities/collection'
import type { Entity } from '../entities/entity'
import type { EntityContext } from '../entities/entity-context'
import { type Region, type RegionGroup, regionToRegionGroup } from '../enums/region'

/** Constructor signature every {@link Entity} subclass satisfies. */
export type EntityConstructor<TData extends object, E extends Entity<TData>> = new (
  data: TData,
  meta: ResponseMeta,
  context: EntityContext,
) => E

/**
 * Base class for every API namespace. Holds the shared {@link RequestExecutor}
 * and a back-reference to the client (so entities can traverse lazy relations),
 * plus helpers that wrap raw responses into entities and collections.
 */
export abstract class BaseNamespace {
  constructor(
    protected readonly executor: RequestExecutor,
    protected readonly client: Yasuo,
  ) {}

  /** Build an {@link EntityContext} for a platform-region-scoped resource. */
  protected regionContext(region: Region): EntityContext {
    return { client: this.client, region, regionGroup: regionToRegionGroup(region) }
  }

  /** Build an {@link EntityContext} for a region-group-scoped resource. */
  protected groupContext(regionGroup: RegionGroup): EntityContext {
    return { client: this.client, regionGroup }
  }

  /** Wrap a single fetched payload into an entity. */
  protected toEntity<TData extends object, E extends Entity<TData>>(
    Ctor: EntityConstructor<TData, E>,
    fetched: Fetched<TData>,
    context: EntityContext,
  ): E {
    return new Ctor(fetched.data, fetched.meta, context)
  }

  /** Wrap a fetched array payload into a {@link Collection} of entities. */
  protected toCollection<TData extends object, E extends Entity<TData>>(
    Ctor: EntityConstructor<TData, E>,
    fetched: Fetched<TData[]>,
    context: EntityContext,
  ): Collection<E> {
    const items = fetched.data.map((item) => new Ctor(item, fetched.meta, context))
    return Collection.create(items, fetched.meta)
  }

  /** Wrap a fetched array of scalars into a {@link Collection}. */
  protected toScalarCollection<T>(fetched: Fetched<T[]>): Collection<T> {
    return Collection.create(fetched.data, fetched.meta)
  }
}
