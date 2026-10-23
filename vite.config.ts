import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Service worker do MSW: servido so pelo dev server, nunca entra no dist. */
function mswSoNoDev(): Plugin {
  return {
    name: 'neectify:msw-dev-only',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/mockServiceWorker.js', (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript')
        res.setHeader('Service-Worker-Allowed', '/')
        res.end(readFileSync(resolve(__dirname, 'dev/mockServiceWorker.js')))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    if (!env.VITE_API_URL?.trim()) {
      throw new Error('VITE_API_URL e obrigatoria no build de producao (ex.: https://api.neectify.com).')
    }
    if (env.VITE_API_MOCK) {
      throw new Error('VITE_API_MOCK nao pode estar definida no build de producao.')
    }
  }
  return { plugins: [react(), tailwindcss(), mswSoNoDev()] }
})
