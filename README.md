# NetDoctor AI

AI-powered network diagnostic desktop application for ISP support engineers,
network technicians, and customer-support teams. Runs entirely locally — **no
authentication, no backend, no database, no persistence**. Reports live in memory
until exported. All AI analysis and reports are produced in **Bangla**.

## Architecture

Electron's three-context model is the primary module boundary:

```
src/
  shared/      Types, IPC contract, errors, Zod schemas (imported by both sides)
  main/        All business logic — diagnostic services, AI, reports (Node)
    adapters/    System-binary adapters (ping, traceroute) behind interfaces
    core/        Logger, safe exec, stats, resource paths
    services/    Feature services + DiagnosticOrchestrator
    ipc/         Validated, typed IPC handlers
    container.ts Composition root (explicit dependency injection)
  preload/     The only renderer↔main bridge (contextBridge, frozen typed API)
  renderer/    React 19 UI — presentation only (no Node, no business logic)
```

### Key decisions

- **electron-vite** drives three build pipelines (main/preload/renderer) with the
  correct Node vs browser targets and native-dep externalization.
- **Diagnostics via system binaries behind adapters** (`IPingAdapter`,
  `ITracerouteAdapter`). Avoids `node-net-ping`'s raw-socket/root requirement and
  native-build fragility across Windows/macOS/Linux. Swappable without touching
  services.
- **Security**: `contextIsolation: true`, `sandbox: true`, `nodeIntegration:
  false`, strict CSP, and every IPC payload Zod-validated at the main boundary.
- **AI provider abstraction** (`IAiProvider`): OpenAI implemented; Claude / Gemini
  / local prepared. An offline Bangla heuristic guarantees a recommendation with
  no API key and on any provider failure.
- **Reports** render from one `ReportModel` to PDF / DOCX / TXT so formats never
  drift. PDF needs a bundled Bengali font (see `resources/fonts/README.md`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the app with HMR |
| `npm run typecheck` | Type-check main + renderer projects |
| `npm test` | Unit/integration tests (Vitest) |
| `npm run test:coverage` | Coverage (80% threshold) |
| `npm run build` | Type-check + production bundle |
| `npm run package` | Build installers (electron-builder) |

## Optional runtime dependencies

- **Ookla Speedtest CLI** (`speedtest` on PATH) for the speed test. If absent, the
  app degrades gracefully with `available: false`.

## Status

Phase 1 (diagnostics + IPC + UI) and Phase 2 (AI engine + Bangla reports) are
implemented. Phase 3 router connectors are architecture-only (`IRouterConnector`).
