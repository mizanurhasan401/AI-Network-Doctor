import type { RouterInfo, RouterRequest } from '@shared/types/router'
import type { IRouterConnectorFactory } from './IRouterConnector'

/**
 * Orchestrates a single router interaction: resolve the vendor connector,
 * authenticate, do the work, and always disconnect. Credentials live only for
 * the duration of the call — nothing is stored.
 */
export class RouterService {
  constructor(private readonly factory: IRouterConnectorFactory) {}

  async fetchInfo(req: RouterRequest): Promise<RouterInfo> {
    const connector = this.factory.create(req.vendor)
    await connector.connect(req.credentials)
    try {
      const [device, wan] = await Promise.all([
        connector.getDeviceInfo(),
        connector.getWanStatus()
      ])
      return { device, wan }
    } finally {
      await connector.disconnect()
    }
  }

  async reboot(req: RouterRequest): Promise<{ rebooting: boolean }> {
    const connector = this.factory.create(req.vendor)
    await connector.connect(req.credentials)
    try {
      await connector.reboot()
      return { rebooting: true }
    } finally {
      await connector.disconnect()
    }
  }
}
