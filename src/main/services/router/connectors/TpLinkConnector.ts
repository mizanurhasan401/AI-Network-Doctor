import { NetworkError } from '@shared/errors/errors'
import type {
  IRouterConnector,
  RouterCredentials,
  RouterDeviceInfo,
  RouterWanStatus
} from '../IRouterConnector'
import { childLogger } from '../../../core/logger'

const log = childLogger('TpLinkConnector')

/**
 * TP-Link connector targeting the **legacy web UI** (TL-WR/Archer C-series and
 * similar with the classic `/userRpm/*.htm` pages). It authenticates with the
 * HTTP Basic scheme TP-Link's older firmware uses, then scrapes the status page.
 *
 * SCOPE: read-only info + reboot. The PPPoE *password* is never read (the router
 * masks it). Parsing is best-effort across firmware revisions — fields that a
 * given firmware doesn't expose come back as null rather than failing the call.
 *
 * NOTE: TP-Link's newer Archer firmware uses an RSA-encrypted JSON login and a
 * different page layout; those are out of scope for this PoC and will surface a
 * clear "unsupported firmware" error from `connect()`.
 */
export class TpLinkConnector implements IRouterConnector {
  readonly vendor = 'tplink' as const

  private baseUrl = ''
  private authCookie = ''
  private authHeader = ''
  private statusHtml = ''

  async connect(credentials: RouterCredentials): Promise<void> {
    const port = credentials.port ?? 80
    this.baseUrl = `http://${credentials.host}${port === 80 ? '' : `:${port}`}`
    const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
    this.authHeader = `Basic ${token}`
    // Legacy TP-Link carries the Basic token in a cookie (space → %20).
    this.authCookie = `Authorization=Basic%20${token}`

    const html = await this.fetchPage('/userRpm/StatusRpm.htm')
    if (this.looksLikeLogin(html)) {
      throw new NetworkError('রাউটার লগইন ব্যর্থ — ইউজারনেম/পাসওয়ার্ড বা ফার্মওয়্যার মিলছে না।', {
        detail: 'TP-Link legacy auth rejected or unsupported firmware (no StatusRpm variables found).'
      })
    }
    this.statusHtml = html
  }

  async getDeviceInfo(): Promise<RouterDeviceInfo> {
    const html = this.statusHtml
    // Firmware looks like: "0.9.1 4.16 v0001.0 Build 150427 Rel.36679n"
    const firmware = this.firstMatch(html, /"([^"]*Build\s*\d{6,8}\s*Rel\.[^"]+)"/i)
    // Hardware/model looks like: "WR841N v9 00000000" or "Archer C20 v1 ..."
    const model =
      this.firstMatch(html, /"((?:Archer|TL-)?[A-Za-z]{1,6}\d{2,4}[A-Za-z]*\s*v\d+)[^"]*"/) ??
      this.firstMatch(html, /"(Archer[^"]+)"/)

    return {
      vendor: this.vendor,
      model: model?.trim() ?? null,
      firmware: firmware?.trim() ?? null,
      uptimeSeconds: null
    }
  }

  async getWanStatus(): Promise<RouterWanStatus> {
    const html = this.statusHtml
    const wanBlock = this.firstMatch(html, /var\s+wanPara\s*=\s*new Array\(([\s\S]*?)\)/i) ?? html
    const wanIp = this.firstMatch(wanBlock, /"(\d{1,3}(?:\.\d{1,3}){3})"/, (ip) => ip !== '0.0.0.0')
    const connectionType = this.firstMatch(
      html,
      /"(PPPoE|Dynamic IP|Static IP|PPTP|L2TP|BigPond)"/i
    )

    // PPPoE username lives on the WAN config page, not the status page.
    const username = await this.tryPppoeUsername()

    return {
      connected: wanIp !== null,
      wanIp,
      uptimeSeconds: null,
      connectionType: connectionType ?? null,
      username
    }
  }

  async reboot(): Promise<void> {
    // Legacy reboot endpoint; ignore the body, the router drops the connection.
    await this.fetchPage('/userRpm/SysRebootRpm.htm?Reboot=Reboot', true).catch((err) => {
      log.warn({ err }, 'reboot request returned an error (router may already be rebooting)')
    })
  }

  async disconnect(): Promise<void> {
    this.statusHtml = ''
    this.authCookie = ''
    this.authHeader = ''
  }

  // --- helpers -------------------------------------------------------------

  private async tryPppoeUsername(): Promise<string | null> {
    for (const path of ['/userRpm/PPPoECfgRpm.htm', '/userRpm/WanPPPoECfgRpm.htm']) {
      try {
        const html = await this.fetchPage(path)
        const user = this.firstMatch(html, /"([^"]+)"\s*,\s*"[^"]*"\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+/)
        const named = this.firstMatch(html, /pppoeName\s*=\s*"([^"]+)"/i) ?? user
        if (named) return named.trim()
      } catch {
        // page not present on this firmware — try the next
      }
    }
    return null
  }

  private async fetchPage(path: string, allowError = false): Promise<string> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Cookie: this.authCookie,
          Authorization: this.authHeader,
          Referer: `${this.baseUrl}/`
        },
        signal: controller.signal
      })
      clearTimeout(timer)
      return await res.text()
    } catch (err) {
      if (allowError) throw err
      throw new NetworkError('রাউটারে সংযোগ ব্যর্থ — IP ঠিক আছে কিনা ও একই নেটওয়ার্কে আছেন কিনা দেখুন।', {
        cause: err,
        detail: `Failed to reach ${this.baseUrl}${path}`
      })
    }
  }

  /** A page is a login/auth screen if it lacks the status variables we expect. */
  private looksLikeLogin(html: string): boolean {
    const hasStatusVars = /var\s+(wanPara|lanPara|statusPara)\s*=/i.test(html)
    return !hasStatusVars
  }

  private firstMatch(
    source: string,
    re: RegExp,
    accept: (value: string) => boolean = () => true
  ): string | null {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`)
    let m: RegExpExecArray | null
    while ((m = global.exec(source)) !== null) {
      if (m[1] && accept(m[1])) return m[1]
    }
    return null
  }
}
