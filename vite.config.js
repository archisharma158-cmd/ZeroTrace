import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const licenseRouteFallback = {
  name: 'zerotrace-license-route',
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === '/license' || request.url?.startsWith('/license?')) request.url = '/index.html'
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === '/license' || request.url?.startsWith('/license?')) request.url = '/index.html'
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [licenseRouteFallback, react()],
})
