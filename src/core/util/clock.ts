/**
 * A monotonic-ish clock returning milliseconds. Injectable so tests can drive
 * time deterministically instead of relying on the wall clock.
 */
export type Clock = () => number

/** Default clock backed by the system wall clock. */
export const systemClock: Clock = () => Date.now()
