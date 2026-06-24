import { useMutation } from '@tanstack/react-query'
import type { RouterInfo, RouterRequest } from '@shared/types/router'
import type { RouterRebootResult } from '@shared/ipc/contract'
import { api, unwrap } from '../../api/client'

/** Logs into the router and returns its read-only info (device + WAN). */
export function useRouterInfo() {
  return useMutation<RouterInfo, Error, RouterRequest>({
    mutationFn: (req) => unwrap(api().routerFetchInfo(req))
  })
}

/** Reboots the router. The caller must confirm with the user first. */
export function useRouterReboot() {
  return useMutation<RouterRebootResult, Error, RouterRequest>({
    mutationFn: (req) => unwrap(api().routerReboot(req))
  })
}
