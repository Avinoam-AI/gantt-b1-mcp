import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLEFILE=true inlines the whole app (JS + CSS) into one dist/index.html that
// opens on double-click — a self-contained, shareable "executable" build.
const singleFile = process.env.SINGLEFILE === 'true'

export default defineConfig({
  base: singleFile ? './' : process.env.GITHUB_ACTIONS ? '/gantt-b1-mcp/' : '/',
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  server: {
    host: true,        // bind on all interfaces so other devices on the LAN can connect
    allowedHosts: true, // accept tunnel hostnames (e.g. *.trycloudflare.com) for external access
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
