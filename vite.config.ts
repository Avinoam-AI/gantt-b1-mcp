import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/gantt-b1-mcp/' : '/',
  plugins: [react()],
  server: {
    host: true,        // bind on all interfaces so other devices on the LAN can connect
    allowedHosts: true, // accept tunnel hostnames (e.g. *.trycloudflare.com) for external access
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
