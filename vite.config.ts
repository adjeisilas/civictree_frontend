import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * A production bundle has the API URL compiled into it, so a missing or
 * development value ships a site that calls nothing — or calls the builder's own
 * laptop. That has happened, so the build refuses rather than producing it.
 */
function assertDeployableApiUrl(mode: string) {
  const { VITE_API_BASE_URL: apiUrl } = loadEnv(mode, process.cwd(), '')

  if (!apiUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not set, so this build would have no API to call.\n' +
      'Set it on the build machine or in the deploy platform (see .env.example),\n' +
      'e.g. VITE_API_BASE_URL=https://api.civictreegh.com/api'
    )
  }

  if (/localhost|127\.0\.0\.1|\[::1]/.test(apiUrl)) {
    throw new Error(
      `VITE_API_BASE_URL points at a local address (${apiUrl}), which no visitor can reach.\n` +
      'Set it to the public API URL before building for production.'
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Only a real production build is gated; `vite dev` and `vite build --mode development` are not
  if (command === 'build' && mode === 'production') assertDeployableApiUrl(mode)

  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        'utils': '/src/utils',
        'types': '/src/types',
        'components': '/src/components',
        'pages': '/src/pages',
      },
    },
    server: {
      proxy: {
        '/api/chatbot': {
          target: 'https://voucher-chatbot.onrender.com',
          changeOrigin: true,
        },
        '/health': {
          target: 'https://voucher-chatbot.onrender.com',
          changeOrigin: true,
        },
      },
    },
  }
})
