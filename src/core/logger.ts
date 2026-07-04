/**
 * Severity levels, ordered from most to least verbose. A logger only emits
 * messages at or above its configured level.
 */
export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
  /** Emit nothing. */
  SILENT = 100,
}

/**
 * Minimal logging surface used by the client. Supply your own implementation
 * via the config to integrate with `pino`, `winston`, etc.
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

/** A logger that discards everything. */
export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
}

/**
 * Parse a log-level name (case-insensitive) into a {@link LogLevel}.
 *
 * @param value - `debug` | `info` | `warn` | `error` | `silent` | `none` | `off`.
 * @returns The matching level, or `undefined` if unrecognised.
 */
export function parseLogLevel(value: string | undefined): LogLevel | undefined {
  switch (value?.trim().toLowerCase()) {
    case 'debug':
    case 'trace':
    case 'verbose':
      return LogLevel.DEBUG
    case 'info':
    case 'log':
      return LogLevel.INFO
    case 'warn':
    case 'warning':
      return LogLevel.WARN
    case 'error':
      return LogLevel.ERROR
    case 'silent':
    case 'none':
    case 'off':
      return LogLevel.SILENT
    default:
      return undefined
  }
}

/**
 * Resolve the effective log level from (in priority order) an explicit level,
 * the `YASUO_LOG_LEVEL`/`LOG_LEVEL` environment variables, or a fallback.
 *
 * @param explicit - Level passed in the client config, if any.
 * @param fallback - Level to use when nothing else is set. Default `SILENT`.
 */
export function resolveLogLevel(
  explicit?: LogLevel,
  fallback: LogLevel = LogLevel.SILENT,
): LogLevel {
  if (explicit !== undefined) {
    return explicit
  }
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env
  return parseLogLevel(env?.YASUO_LOG_LEVEL ?? env?.LOG_LEVEL) ?? fallback
}

/**
 * Create a console-backed {@link Logger} that filters by level and prefixes
 * every line with `[yasuo]`.
 *
 * @param level - Minimum level to emit.
 */
export function createConsoleLogger(level: LogLevel): Logger {
  const enabled = (target: LogLevel): boolean => level <= target
  return {
    debug: (message, ...args) => {
      if (enabled(LogLevel.DEBUG)) {
        console.debug(`[yasuo] ${message}`, ...args)
      }
    },
    info: (message, ...args) => {
      if (enabled(LogLevel.INFO)) {
        console.info(`[yasuo] ${message}`, ...args)
      }
    },
    warn: (message, ...args) => {
      if (enabled(LogLevel.WARN)) {
        console.warn(`[yasuo] ${message}`, ...args)
      }
    },
    error: (message, ...args) => {
      if (enabled(LogLevel.ERROR)) {
        console.error(`[yasuo] ${message}`, ...args)
      }
    },
  }
}
