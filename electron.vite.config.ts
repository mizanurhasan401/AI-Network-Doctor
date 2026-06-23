import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * electron-vite drives three independent build pipelines. This is why we use it
 * instead of raw Vite: main/preload target Node, the renderer targets the browser,
 * and native/Node deps must be externalized from the bundles that run under Node.
 */
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        input: { index: resolve('src/main/index.ts') }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': resolve('src/shared') }
    },
    build: {
      rollupOptions: {
        input: { index: resolve('src/preload/index.ts') },
        // Sandboxed preload scripts must be CommonJS — force cjs + .js extension.
        output: { format: 'cjs', entryFileNames: '[name].js' }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: { index: resolve('src/renderer/index.html') }
      }
    }
  }
})
