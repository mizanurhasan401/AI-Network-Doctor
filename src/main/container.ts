import { SystemPingAdapter } from './adapters/ping/SystemPingAdapter'
import { SystemTracerouteAdapter } from './adapters/traceroute/SystemTracerouteAdapter'
import { HttpSpeedTestAdapter } from './adapters/speedtest/HttpSpeedTestAdapter'
import { OoklaSpeedTestAdapter } from './adapters/speedtest/OoklaSpeedTestAdapter'
import { NetworkScannerService } from './services/network/NetworkScannerService'
import { ConnectivityService } from './services/connectivity/ConnectivityService'
import { DnsService } from './services/dns/DnsService'
import { PacketLossService } from './services/packetloss/PacketLossService'
import { TracerouteService } from './services/traceroute/TracerouteService'
import { SpeedTestService } from './services/speedtest/SpeedTestService'
import { HealthEngine } from './services/health/HealthEngine'
import { IssueDetector } from './services/health/IssueDetector'
import { DiagnosticOrchestrator } from './services/DiagnosticOrchestrator'
import { AiService } from './services/ai/AiService'
import { ReportService } from './services/report/ReportService'

/**
 * Composition root. All concrete dependencies are constructed here exactly once
 * and wired by hand (explicit DI — no magic container). Services receive their
 * collaborators via constructor injection, so any of them can be swapped/mocked
 * in tests without reaching into module internals.
 */
export interface AppContainer {
  readonly scanner: NetworkScannerService
  readonly connectivity: ConnectivityService
  readonly dns: DnsService
  readonly packetLoss: PacketLossService
  readonly traceroute: TracerouteService
  readonly speedTest: SpeedTestService
  readonly health: HealthEngine
  readonly issues: IssueDetector
  readonly orchestrator: DiagnosticOrchestrator
  readonly ai: AiService
  readonly reports: ReportService
}

export function createContainer(): AppContainer {
  const pingAdapter = new SystemPingAdapter()
  const tracerouteAdapter = new SystemTracerouteAdapter()

  const scanner = new NetworkScannerService()
  const connectivity = new ConnectivityService(pingAdapter)
  const dns = new DnsService()
  const packetLoss = new PacketLossService(pingAdapter)
  const traceroute = new TracerouteService(tracerouteAdapter)
  const speedTest = new SpeedTestService(new HttpSpeedTestAdapter(), new OoklaSpeedTestAdapter())
  const health = new HealthEngine()
  const issues = new IssueDetector()

  const orchestrator = new DiagnosticOrchestrator({
    scanner,
    connectivity,
    dns,
    packetLoss,
    traceroute,
    speedTest,
    health,
    issues
  })

  return {
    scanner,
    connectivity,
    dns,
    packetLoss,
    traceroute,
    speedTest,
    health,
    issues,
    orchestrator,
    ai: new AiService(),
    reports: new ReportService()
  }
}
