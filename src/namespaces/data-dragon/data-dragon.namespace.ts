import type {
  DDragonChampionDetailDTO,
  DDragonChampionListDTO,
  DDragonChampionSummaryDTO,
  DDragonGameModeDTO,
  DDragonGameTypeDTO,
  DDragonMapDTO,
  DDragonQueueDTO,
  DDragonRealmDTO,
  DDragonRunesReforgedDTO,
  DDragonSeasonDTO,
} from '../../dto/data-dragon/data-dragon.dto'
import { DataDragonHost } from '../../enums/data-dragon'

/** Default Data Dragon locale. */
const DEFAULT_LANGUAGE = 'en_US'

/**
 * Data Dragon: Riot's static game data and assets (champions, runes, items,
 * versions…). Served from a public CDN with **no API key and no rate limits**,
 * so these methods return the raw payloads directly (not entities).
 *
 * Reached via `yasuo.dataDragon`.
 */
export class DataDragonNamespace {
  private versionsCache?: Promise<string[]>
  private readonly championListCache = new Map<string, Promise<DDragonChampionListDTO>>()

  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  private async request<T>(host: DataDragonHost, path: string): Promise<T> {
    const url = `${host}/${path}`
    const response = await this.fetchImpl(url)
    if (!response.ok) {
      throw new Error(
        `Data Dragon request failed (${response.status} ${response.statusText}): ${url}`,
      )
    }
    return (await response.json()) as T
  }

  /** All available Data Dragon versions, newest first. Memoised. */
  versions(): Promise<string[]> {
    this.versionsCache ??= this.request<string[]>(DataDragonHost.DDRAGON, 'api/versions.json')
    return this.versionsCache
  }

  /** The latest Data Dragon version. */
  private async latestVersion(): Promise<string> {
    const versions = await this.versions()
    const latest = versions[0]
    if (!latest) {
      throw new Error('Data Dragon returned no versions')
    }
    return latest
  }

  /** All available locales. */
  languages(): Promise<string[]> {
    return this.request<string[]>(DataDragonHost.DDRAGON, 'cdn/languages.json')
  }

  /**
   * Get the realm descriptor for a server (e.g. `na`, `euw`, `kr`).
   *
   * @param server - The realm/server code.
   */
  realm(server: string): Promise<DDragonRealmDTO> {
    return this.request<DDragonRealmDTO>(DataDragonHost.DDRAGON, `realms/${server}.json`)
  }

  /**
   * Get the full champion list.
   *
   * @param language - Locale. Defaults to `en_US`.
   */
  async champions(language: string = DEFAULT_LANGUAGE): Promise<DDragonChampionListDTO> {
    const version = await this.latestVersion()
    return this.cachedChampionList(version, language)
  }

  private cachedChampionList(version: string, language: string): Promise<DDragonChampionListDTO> {
    const key = `${version}:${language}`
    let cached = this.championListCache.get(key)
    if (!cached) {
      cached = this.request<DDragonChampionListDTO>(
        DataDragonHost.DDRAGON,
        `cdn/${version}/data/${language}/champion.json`,
      )
      this.championListCache.set(key, cached)
    }
    return cached
  }

  /**
   * Get detailed data for a champion by its Data Dragon id (e.g. `Aatrox`).
   *
   * @param name - The champion's Data Dragon id.
   * @param language - Locale. Defaults to `en_US`.
   */
  async champion(
    name: string,
    language: string = DEFAULT_LANGUAGE,
  ): Promise<DDragonChampionDetailDTO> {
    const version = await this.latestVersion()
    const payload = await this.request<{ data: Record<string, DDragonChampionDetailDTO> }>(
      DataDragonHost.DDRAGON,
      `cdn/${version}/data/${language}/champion/${name}.json`,
    )
    const detail = payload.data[name]
    if (!detail) {
      throw new Error(`Champion "${name}" not found in Data Dragon`)
    }
    return detail
  }

  /**
   * Look up a champion summary by numeric champion id.
   *
   * @param championId - The champion id (e.g. `266` for Aatrox).
   * @param language - Locale. Defaults to `en_US`.
   * @returns The summary, or `null` if the id is not in the latest patch.
   */
  async championById(
    championId: number,
    language: string = DEFAULT_LANGUAGE,
  ): Promise<DDragonChampionSummaryDTO | null> {
    const list = await this.champions(language)
    const key = String(championId)
    return Object.values(list.data).find((champion) => champion.key === key) ?? null
  }

  /**
   * Get the reforged rune paths.
   *
   * @param language - Locale. Defaults to `en_US`.
   */
  async runesReforged(language: string = DEFAULT_LANGUAGE): Promise<DDragonRunesReforgedDTO[]> {
    const version = await this.latestVersion()
    return this.request<DDragonRunesReforgedDTO[]>(
      DataDragonHost.DDRAGON,
      `cdn/${version}/data/${language}/runesReforged.json`,
    )
  }

  /** Get the static queues reference list. */
  queues(): Promise<DDragonQueueDTO[]> {
    return this.request<DDragonQueueDTO[]>(DataDragonHost.STATIC, 'docs/lol/queues.json')
  }

  /** Get the static maps reference list. */
  maps(): Promise<DDragonMapDTO[]> {
    return this.request<DDragonMapDTO[]>(DataDragonHost.STATIC, 'docs/lol/maps.json')
  }

  /** Get the static game-modes reference list. */
  gameModes(): Promise<DDragonGameModeDTO[]> {
    return this.request<DDragonGameModeDTO[]>(DataDragonHost.STATIC, 'docs/lol/gameModes.json')
  }

  /** Get the static game-types reference list. */
  gameTypes(): Promise<DDragonGameTypeDTO[]> {
    return this.request<DDragonGameTypeDTO[]>(DataDragonHost.STATIC, 'docs/lol/gameTypes.json')
  }

  /** Get the static seasons reference list. */
  seasons(): Promise<DDragonSeasonDTO[]> {
    return this.request<DDragonSeasonDTO[]>(DataDragonHost.STATIC, 'docs/lol/seasons.json')
  }
}
