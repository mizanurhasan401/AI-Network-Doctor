import { describe, expect, it } from 'vitest'
import { SystemPingAdapter } from './SystemPingAdapter'

// Access the private parser via a typed cast — we test parsing in isolation from
// the actual `ping` binary so the suite is deterministic and offline.
type WithParse = { parseRtts(output: string): number[] }

const UNIX_OUTPUT = `PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=117 time=12.3 ms
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=11.8 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=13.0 ms`

const WINDOWS_OUTPUT = `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=12ms TTL=117
Reply from 8.8.8.8: bytes=32 time<1ms TTL=117`

describe('SystemPingAdapter parsing', () => {
  const parser = new SystemPingAdapter() as unknown as WithParse

  it('parses Unix ping RTTs', () => {
    expect(parser.parseRtts(UNIX_OUTPUT)).toEqual([12.3, 11.8, 13.0])
  })

  it('parses Windows ping RTTs including time<1ms', () => {
    expect(parser.parseRtts(WINDOWS_OUTPUT)).toEqual([12, 1])
  })

  it('returns empty array when no replies', () => {
    expect(parser.parseRtts('Request timed out.')).toEqual([])
  })
})
