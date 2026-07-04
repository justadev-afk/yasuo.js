import { describe, expect, test } from 'bun:test'
import {
  Region,
  RegionGroup,
  regionFromPlatformId,
  regionToAccountRegionGroup,
  regionToRegionGroup,
} from '../../src/enums/region'

describe('regionToRegionGroup', () => {
  test('maps American shards to AMERICAS', () => {
    for (const region of [Region.NA, Region.BR, Region.LAN, Region.LAS, Region.PBE]) {
      expect(regionToRegionGroup(region)).toBe(RegionGroup.AMERICAS)
    }
  })

  test('maps European shards to EUROPE', () => {
    for (const region of [Region.EUNE, Region.EUW, Region.TR, Region.RU, Region.ME]) {
      expect(regionToRegionGroup(region)).toBe(RegionGroup.EUROPE)
    }
  })

  test('maps Asian shards to ASIA', () => {
    expect(regionToRegionGroup(Region.KR)).toBe(RegionGroup.ASIA)
    expect(regionToRegionGroup(Region.JP)).toBe(RegionGroup.ASIA)
  })

  test('maps SEA shards to SEA', () => {
    for (const region of [Region.OCE, Region.SG, Region.TW, Region.VN]) {
      expect(regionToRegionGroup(region)).toBe(RegionGroup.SEA)
    }
  })

  test('throws on an unknown region', () => {
    expect(() => regionToRegionGroup('ATLANTIS' as Region)).toThrow(RangeError)
  })
})

describe('regionToAccountRegionGroup', () => {
  test('folds SEA into ASIA (ACCOUNT-V1 has no SEA cluster)', () => {
    expect(regionToAccountRegionGroup(Region.OCE)).toBe(RegionGroup.ASIA)
    expect(regionToAccountRegionGroup(Region.VN)).toBe(RegionGroup.ASIA)
  })

  test('leaves the other clusters untouched', () => {
    expect(regionToAccountRegionGroup(Region.NA)).toBe(RegionGroup.AMERICAS)
    expect(regionToAccountRegionGroup(Region.EUW)).toBe(RegionGroup.EUROPE)
    expect(regionToAccountRegionGroup(Region.KR)).toBe(RegionGroup.ASIA)
  })
})

describe('regionFromPlatformId', () => {
  test('resolves a platform id back to its Region, case-insensitively', () => {
    expect(regionFromPlatformId('KR')).toBe(Region.KR)
    expect(regionFromPlatformId('euw1')).toBe(Region.EUW)
    expect(regionFromPlatformId('NA1')).toBe(Region.NA)
  })

  test('returns null for an unrecognised platform id', () => {
    expect(regionFromPlatformId('NOPE')).toBeNull()
  })
})
