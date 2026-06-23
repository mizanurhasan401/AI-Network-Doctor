/**
 * Extensible router-connector architecture. Future vendor connectors (Mikrotik,
 * TP-Link, Huawei, ZTE, Tenda) implement this single interface. No vendor logic
 * exists yet and none lives in the UI — the renderer only ever sees this contract
 * and the vendor-neutral DTOs below.
 *
 * SECURITY: connectors receive credentials per-call and MUST NOT persist them.
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
}

export interface IRouterConnector {
  readonly vendor: RouterVendor

  /** Verify reachability + credentials without mutating device state. */
  connect(credentials: RouterCredentials): Promise<void>

  getDeviceInfo(): Promise<RouterDeviceInfo>

  getWanStatus(): Promise<RouterWanStatus>

  /** Release any session/handles. Always safe to call. */
  disconnect(): Promise<void>
}

/** Registry contract for resolving a connector by vendor at runtime. */
export interface IRouterConnectorFactory {
  supports(vendor: RouterVendor): boolean
  create(vendor: RouterVendor): IRouterConnector
}
