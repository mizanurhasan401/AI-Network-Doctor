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

## Speed test

The speed test needs **no installation**. By default it runs over HTTP against
Cloudflare's public speed endpoints (`speed.cloudflare.com`) from the main process —
parallel streams for download/upload, tiny round-trips for latency/jitter, plus a
free geo-IP lookup for the ISP label and the nearest Cloudflare colo. Behind an
`ISpeedTestAdapter` seam, so the backend is swappable.

- **Ookla Speedtest CLI** (`speedtest` on PATH) is an *optional* upgrade: if detected
  it's used automatically for higher accuracy; otherwise the HTTP test is used.

## Build & distribute

Installers are produced by **electron-builder** (config in `electron-builder.yml`)
and land in `release/`. The app icon comes from `build/icon.png` (regenerate with
`node scripts/generate-icon.mjs`); the Bangla PDF font ships from `resources/fonts/`
via `extraResources`.

### Build for your own machine (macOS)

```bash
npm run package:mac      # → release/NetDoctor AI-<version>-arm64.dmg  and  -x64.dmg
```

`package:win` / `package:linux` only work **on that OS** — electron-builder targets
the host platform, so a Mac cannot natively produce a Windows `.exe` or Linux packages.

### Windows build from macOS

- **Intel Mac:** `npm run package:win:docker` cross-builds the NSIS `Setup.exe` in the
  official Wine image (needs Docker Desktop running; the container uses its own
  `node_modules`, leaving your host install untouched).
- **Apple Silicon Mac:** the Docker route builds the app but **cannot produce the
  `.exe` installer** — electron-builder must run NSIS/rcedit under Wine, which crashes
  under QEMU emulation on arm64. Use **CI** (below) for a real installer, or ship the
  **portable zip**: the Docker build still emits `release/win-unpacked/`; zip it
  (`cd release && ditto -c -k --keepParent win-unpacked NetDoctor-portable.zip`) and the
  recipient extracts it and runs `NetDoctor AI.exe` directly (no install).

**Recommended for a polished `.exe`:** push to GitHub and tag a release — the
`windows-latest` CI job builds the signed-metadata NSIS installer natively (no Wine):

```bash
git push origin main
git tag v0.1.0 && git push --tags     # → Setup.exe attached to the GitHub Release
```

### Build for all three platforms (recommended)

Use CI — `.github/workflows/release.yml` builds on native macOS / Windows / Linux
runners. Trigger it one of two ways:

```bash
git tag v0.1.0 && git push --tags     # builds + publishes a GitHub Release
```

…or run the **“Build installers”** workflow manually (Actions → Run workflow) and
download the `.dmg` / `.exe` / `.AppImage` + `.deb` from the run's artifacts.

### Send & install

Builds are **unsigned**, so recipients see a one-time OS security prompt:

| OS | Install | Bypass the unsigned warning |
| --- | --- | --- |
| **macOS** (`.dmg`) | Open the dmg, drag the app to Applications | Right-click the app → **Open** → **Open**, or `xattr -cr "/Applications/NetDoctor AI.app"` |
| **Windows** (`Setup.exe`) | Run the installer | SmartScreen → **More info** → **Run anyway** |
| **Linux** | `chmod +x *.AppImage && ./NetDoctor*.AppImage`, or `sudo dpkg -i NetDoctor*.deb` | — |

Removing these prompts requires code signing (Apple Developer ID + notarization,
Windows Authenticode) — a follow-up that needs paid certificates.

## Status

Phase 1 (diagnostics + IPC + UI) and Phase 2 (AI engine + reports) are implemented,
with an English/Bangla i18n system across the UI, reports, and AI output. Phase 3
router connectors are architecture-only (`IRouterConnector`).
