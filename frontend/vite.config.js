import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const GATEWAY_URL = env.VITE_GATEWAY_URL || env.VITE_API_URL || 'http://localhost:8080'
  const KEYCLOAK_URL = env.VITE_KEYCLOAK_TARGET || env.VITE_KEYCLOAK_URL || 'http://localhost:8443'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Route all /api/* calls to the Spring Cloud Gateway
        '/api': {
          target: GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        // Route Swagger / OpenAPI docs through the gateway
        '/v3/api-docs': {
          target: GATEWAY_URL,
          changeOrigin: true,
          secure: false,
        },
        // Route Keycloak auth requests
        '/realms': {
          target: KEYCLOAK_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
