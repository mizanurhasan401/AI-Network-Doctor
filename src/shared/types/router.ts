/**
 * Vendor-neutral router DTOs. Shared so the renderer can type its requests and
 * the read-only info it shows, while concrete vendor connectors live in main.
 *
 * SECURITY: credentials are passed per-call and never persisted, stored, or
 * logged — they exist only for the lifetime of a single fetch/reboot.
 */

export type RouterVendor = 'mikrotik' | 'tplink' | 'huawei' | 'zte' | 'tenda'

export interface RouterCredentials {
  readonly host: string
  readonly username: string
  /** Held only for the lifetime of the call; never stored or logged. */
  readonly password: string
  readonly port?: number
}

export interface RouterDeviceInfo {
  readonly vendor: RouterVendor
  readonly model: string | null
  readonly firmware: string | null
  readonly uptimeSeconds: number | null
}

export interface RouterWanStatus {
  readonly connected: boolean
  readonly wanIp: string | null
  readonly uptimeSeconds: number | null
  /** WAN connection type as the router reports it (e.g. "PPPoE", "Dynamic IP"). */
  readonly connectionType: string | null
  /** PPPoE/connection username, if the router exposes it (passwords never read). */
  readonly username: string | null
}

/** Aggregate read-only snapshot returned to the renderer. */
export interface RouterInfo {
  readonly device: RouterDeviceInfo
  readonly wan: RouterWanStatus
}

/** A renderer → main request: which vendor + the per-call credentials. */
export interface RouterRequest {
  readonly vendor: RouterVendor
  readonly credentials: RouterCredentials
}
