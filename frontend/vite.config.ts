import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const RESET  = '\x1b[0m'
const CYAN   = '\x1b[36m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED    = '\x1b[31m'
const BLUE   = '\x1b[34m'
const DIM    = '\x1b[2m'
const BOLD   = '\x1b[1m'

function ts() {
  return new Date().toLocaleTimeString('uz-UZ', { hour12: false })
}

function statusColor(code: number) {
  if (code >= 500) return RED
  if (code >= 400) return YELLOW
  if (code >= 200) return GREEN
  return DIM
}

function methodColor(method: string) {
  const m = method.toUpperCase()
  if (m === 'GET')    return GREEN
  if (m === 'POST')   return BLUE
  if (m === 'PUT')    return YELLOW
  if (m === 'DELETE') return RED
  return DIM
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          const timings = new Map<object, number>()

          proxy.on('proxyReq', (proxyReq, req) => {
            timings.set(req, Date.now())
            const method = (req.method ?? 'GET').padEnd(7)
            const path   = req.url ?? ''
            const mc     = methodColor(req.method ?? '')
            process.stdout.write(
              `${CYAN}[Frontend]${RESET} ${DIM}${ts()}${RESET}     ${GREEN}${BOLD}LOG${RESET} ${YELLOW}[HTTP]${RESET} ${mc}${BOLD}${method}${RESET} ${path}\n`
            )
          })

          proxy.on('proxyRes', (proxyRes, req) => {
            const ms     = Date.now() - (timings.get(req) ?? Date.now())
            timings.delete(req)
            const code   = proxyRes.statusCode ?? 0
            const sc     = statusColor(code)
            const method = (req.method ?? 'GET').padEnd(7)
            const path   = req.url ?? ''
            const mc     = methodColor(req.method ?? '')
            process.stdout.write(
              `${CYAN}[Frontend]${RESET} ${DIM}${ts()}${RESET}     ${GREEN}${BOLD}LOG${RESET} ${YELLOW}[HTTP]${RESET} ${mc}${BOLD}${method}${RESET} ${path} ${DIM}→${RESET} ${sc}${BOLD}${code}${RESET} ${DIM}+${ms}ms${RESET}\n`
            )
          })

          proxy.on('error', (err, req) => {
            timings.delete(req)
            const method = (req.method ?? 'GET').padEnd(7)
            const path   = (req as any).url ?? ''
            process.stdout.write(
              `${CYAN}[Frontend]${RESET} ${DIM}${ts()}${RESET}   ${RED}${BOLD}ERROR${RESET} ${YELLOW}[HTTP]${RESET} ${method} ${path} ${RED}ECONNREFUSED${RESET}\n`
            )
          })
        },
      },
    },
  },
})
