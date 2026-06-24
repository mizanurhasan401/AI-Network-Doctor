import { DependencyMissingError } from '@shared/errors/errors'
import type { RouterVendor } from '@shared/types/router'
import type { IRouterConnector, IRouterConnectorFactory } from './IRouterConnector'
import { TpLinkConnector } from './connectors/TpLinkConnector'

/**
 * Resolves a connector by vendor. Only TP-Link is implemented today; the other
 * vendors are declared in the type but throw a clear "not yet supported" error
 * so the UI can surface it without guessing.
 */
export class RouterConnectorFactory implements IRouterConnectorFactory {
  private readonly builders: Partial<Record<RouterVendor, () => IRouterConnector>> = {
    tplink: () => new TpLinkConnector()
  }

  supports(vendor: RouterVendor): boolean {
    return vendor in this.builders
  }

  create(vendor: RouterVendor): IRouterConnector {
    const build = this.builders[vendor]
    if (!build) {
      throw new DependencyMissingError(
        `${vendor} রাউটার এখনো সমর্থিত নয় — আপাতত শুধু TP-Link উপলব্ধ।`,
        { detail: `No connector registered for vendor "${vendor}"` }
      )
    }
    return build()
  }
}
