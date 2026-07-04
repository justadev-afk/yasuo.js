import { describe, expect, test } from 'bun:test'
import { SlidingWindow } from '../../src/core/rate-limit/sliding-window'

describe('SlidingWindow', () => {
  test('permits requests up to the limit, then reports a wait', () => {
    const window = new SlidingWindow(3, 1000)
    window.record(0)
    window.record(0)
    window.record(0)
    expect(window.size(0)).toBe(3)
    // Full: must wait until the oldest (t=0) ages out at t=1000.
    expect(window.timeUntilAvailable(0)).toBe(1000)
  })

  test('reports a partial wait as the window slides', () => {
    const window = new SlidingWindow(1, 1000)
    window.record(0)
    expect(window.timeUntilAvailable(400)).toBe(600)
  })

  test('evicts aged-out timestamps', () => {
    const window = new SlidingWindow(2, 1000)
    window.record(0)
    window.record(0)
    // At t=1000 the cutoff is 0, so both t=0 entries are pruned.
    expect(window.size(1000)).toBe(0)
    expect(window.timeUntilAvailable(1000)).toBe(0)
  })

  test('syncCount tops up the log to match Riot server usage', () => {
    const window = new SlidingWindow(10, 1000)
    window.record(0)
    window.syncCount(5, 0)
    expect(window.size(0)).toBe(5)
  })

  test('syncCount never lowers the local count below what is observed', () => {
    const window = new SlidingWindow(10, 1000)
    window.record(0)
    window.record(0)
    window.record(0)
    window.syncCount(1, 0)
    expect(window.size(0)).toBe(3)
  })

  test('reconfigure updates limit and interval', () => {
    const window = new SlidingWindow(1, 1000)
    window.reconfigure(5, 2000)
    expect(window.limit).toBe(5)
    expect(window.intervalMs).toBe(2000)
  })
})
