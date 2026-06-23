/// <reference types="vite/client" />
import type { NetDoctorApi } from '@shared/ipc/contract'

declare global {
  interface Window {
    readonly netdoctor: NetDoctorApi
  }
}

export {}
