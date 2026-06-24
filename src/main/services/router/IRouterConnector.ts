/**
 * Extensible router-connector architecture. Vendor connectors (TP-Link today;
 * MikroTik/Huawei/ZTE/Tenda later) implement this single interface. The renderer
 * only ever sees the vendor-neutral DTOs in `@shared/types/router` — never a
 * concrete connector.
 *
 * SECURITY: connectors receive credentials per-call and MUST NOT persist them.
 */

import type {
  RouterCredentials,
  RouterDeviceInfo,
  RouterVendor,
  RouterWanStatus
} from '@shared/types/router'

export type {
  RouterCredentials,
  RouterDeviceInfo,
  RouterVendor,
  RouterWanStatus
} from '@shared/types/router'

export interface IRouterConnector {
  readonly vendor: RouterVendor

  /** Verify reachability + credentials without mutating device state. */
  connect(credentials: RouterCredentials): Promise<void>

  getDeviceInfo(): Promise<RouterDeviceInfo>

  getWanStatus(): Promise<RouterWanStatus>

  /** Reboot the router. Caller is responsible for confirming with the user. */
  reboot(): Promise<void>

  /** Release any session/handles. Always safe to call. */
  disconnect(): Promise<void>
}

/** Registry contract for resolving a connector by vendor at runtime. */
export interface IRouterConnectorFactory {
  supports(vendor: RouterVendor): boolean
  create(vendor: RouterVendor): IRouterConnector
}
