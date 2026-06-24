import { afterEach, describe, expect, it, vi } from 'vitest'

// The connector pulls in the pino logger, which imports electron's `app` — stub
// it so the parser can be unit-tested without the Electron runtime.
vi.mock('../../../core/logger', () => ({
  childLogger: () => ({ warn() {}, info() {}, error() {}, debug() {} })
}))

import { TpLinkConnector } from './TpLinkConnector'

// A trimmed StatusRpm.htm in the legacy TP-Link shape.
const STATUS_HTML = `
var lanPara = new Array("C4 6E 1F 00 11 22", "192.168.1.1", "255.255.255.0", 0);
var wanPara = new Array(1, "C4:6E:1F:00:11:33", "103.5.5.5", 0, "255.255.255.255",
  "103.5.5.1", 0, "8.8.8.8 , 1.1.1.1", "PPPoE", 3600);
var statusPara = new Array(1, 1,
  "3.16.9 Build 150316 Rel.62177n",
  "WR841N v9 00000000");
`

describe('TpLinkConnector parsing', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('parses model + firmware from the status page', async () => {
    const c = new TpLinkConnector()
    ;(c as unknown as { statusHtml: string }).statusHtml = STATUS_HTML

    const info = await c.getDeviceInfo()
    expect(info.vendor).toBe('tplink')
    expect(info.firmware).toBe('3.16.9 Build 150316 Rel.62177n')
    expect(info.model).toBe('WR841N v9')
  })

  it('parses WAN ip + connection type, skipping 0.0.0.0', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, text: async () => '' }) as Response))
    const c = new TpLinkConnector()
    ;(c as unknown as { statusHtml: string }).statusHtml = STATUS_HTML

    const wan = await c.getWanStatus()
    expect(wan.connected).toBe(true)
    expect(wan.wanIp).toBe('103.5.5.5')
    expect(wan.connectionType).toBe('PPPoE')
  })

  it('treats a page without status variables as a failed login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ text: async () => '<html><form>login</form></html>' }) as Response)
    )
    const c = new TpLinkConnector()
    await expect(
      c.connect({ host: '192.168.1.1', username: 'admin', password: 'x' })
    ).rejects.toThrow()
  })
})
