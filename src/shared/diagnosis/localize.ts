/**
 * Problem localization: decides whether a connectivity fault is on the user's
 * side (PC ↔ router: Wi-Fi/cable/router) or beyond the router (ISP/upstream).
 *
 * The trick network engineers use: compare loss to the GATEWAY vs loss to the
 * INTERNET. If the router itself is already lossy, the fault is local; if the
 * router is clean but the internet hop loses packets, the fault is upstream.
 * This is exactly what a "plug in an Ethernet cable" test reveals — only the app
 * can infer it from the two measurements it already takes.
 */

export type ProblemLocation = 'ok' | 'local' | 'isp'

/** Loss at or above this (percent) is treated as a real fault, not noise. */
const LOSS_THRESHOLD = 5

export interface LocalizeInput {
  /** Whether the gateway (router) answered at all. */
  readonly gatewayReachable: boolean
  /** Packet loss % on the ping to the gateway (null if gateway unknown). */
  readonly gatewayLossPercent: number | null
  /** Packet loss % on the ping to the public internet. */
  readonly internetLossPercent: number
  /** Active link medium — lets us name Wi-Fi as the likely local culprit. */
  readonly linkType: 'wired' | 'wireless' | 'other' | null
}

export interface Localization {
  readonly location: ProblemLocation
  readonly gatewayLossPercent: number | null
  readonly internetLossPercent: number
  /** True when the local fault is most plausibly the Wi-Fi link. */
  readonly likelyWifi: boolean
}

export function localizeProblem(input: LocalizeInput): Localization {
  const { gatewayReachable, gatewayLossPercent, internetLossPercent, linkType } = input
  const gwLoss = gatewayLossPercent ?? 0

  let location: ProblemLocation
  if (!gatewayReachable) {
    // Can't even reach the router → the fault is squarely on the local side.
    location = 'local'
  } else if (gwLoss >= LOSS_THRESHOLD) {
    // The router is already lossy → the PC↔router segment is the problem.
    location = 'local'
  } else if (internetLossPercent >= LOSS_THRESHOLD) {
    // Router is clean but the internet hop loses packets → beyond the router.
    location = 'isp'
  } else {
    location = 'ok'
  }

  return {
    location,
    gatewayLossPercent,
    internetLossPercent,
    likelyWifi: location === 'local' && linkType === 'wireless'
  }
}
