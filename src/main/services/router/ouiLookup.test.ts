import { describe, expect, it } from 'vitest'
import { lookupVendorOffline, normalizeMac } from './ouiLookup'

describe('ouiLookup', () => {
  it('normalizes MACs in colon, dash and bare forms', () => {
    expect(normalizeMac('c4:6e:1f:00:11:22')).toBe('C46E1F001122')
    expect(normalizeMac('C4-6E-1F-00-11-22')).toBe('C46E1F001122')
    // macOS arp emits single-digit octets — these must pad to 2 digits each.
    expect(normalizeMac('0:1:2:3:4:5')).toBe('000102030405')
    expect(normalizeMac('not-a-mac')).toBeNull()
  })

  it('resolves a known vendor from the offline table', () => {
    expect(lookupVendorOffline('C4:6E:1F:00:11:22')).toBe('TP-Link')
    expect(lookupVendorOffline('C8:3A:35:aa:bb:cc')).toBe('Tenda')
  })

  it('returns null for an unknown OUI', () => {
    expect(lookupVendorOffline('02:00:00:00:00:00')).toBeNull()
  })
})
