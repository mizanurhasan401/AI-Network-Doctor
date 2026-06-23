import os from 'node:os'
import dns from 'node:dns'
import si from 'systeminformation'
import type { SystemInfo } from '@shared/types/diagnostics'
import { PUBLIC_IP_URL } from '@shared/constants'
import { childLogger } from '../../core/logger'

const log = childLogger('NetworkScanner')

/**
 * Collects host + network identity. Pure data collection — no scoring, no IPC.
 * Public-IP lookup is best-effort and never blocks the rest of the scan.
 */
export class NetworkScannerService {
  async scan(): Promise<SystemInfo> {
    const [osInfo, cpu, mem, gateway, defaultIface, publicIp] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.mem(),
      this.safeGateway(),
      si.networkInterfaceDefault(),
      this.fetchPublicIp()
    ])

    const ifaces = await si.networkInterfaces()
    const list = Array.isArray(ifaces) ? ifaces : [ifaces]
    const primary = list.find((i) => i.iface === defaultIface) ?? list.find((i) => i.ip4 && !i.internal)

    return {
      hostname: os.hostname(),
      localIp: primary?.ip4 ?? this.firstLocalIp(),
      gatewayIp: gateway,
      dnsServers: this.dnsServers(),
      publicIp,
      macAddress: primary?.mac ?? null,
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch
      },
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speedGHz: cpu.speed
      },
      ram: {
        totalBytes: mem.total,
        freeBytes: mem.available
      }
    }
  }

  private dnsServers(): string[] {
    try {
      return dns.getServers()
    } catch {
      return []
    }
  }

  private async safeGateway(): Promise<string | null> {
    try {
      const gw = await si.networkGatewayDefault()
      return gw || null
    } catch (err) {
      log.warn({ err }, 'gateway detection failed')
      return null
    }
  }

  private firstLocalIp(): string {
    for (const addrs of Object.values(os.networkInterfaces())) {
      for (const a of addrs ?? []) {
        if (a.family === 'IPv4' && !a.internal) return a.address
      }
    }
    return '127.0.0.1'
  }

  private async fetchPublicIp(): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(PUBLIC_IP_URL, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) return null
      const text = (await res.text()).trim()
      return /^[0-9a-fA-F:.]+$/.test(text) ? text : null
    } catch (err) {
      log.warn({ err }, 'public IP lookup failed (offline?)')
      return null
    }
  }
}
