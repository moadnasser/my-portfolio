import { spawn, spawnSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PHP_PORT = 5197

/**
 * Vite cannot run PHP, so in dev the contact endpoint is served by PHP's built-in server and
 * /api is proxied to it. Skipped (with a note) when PHP is not installed.
 */
function phpApi(): Plugin {
  return {
    name: 'php-api',
    apply: 'serve',
    configureServer(server) {
      if (spawnSync('php', ['-v']).status !== 0) {
        server.config.logger.warn('php not found: /api/contact.php will not work in dev')
        return
      }
      const php = spawn('php', ['-S', `127.0.0.1:${PHP_PORT}`, '-t', 'public'], { stdio: 'ignore' })
      const stop = () => php.kill()
      server.httpServer?.once('close', stop)
      process.once('exit', stop)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), phpApi()],
  server: { proxy: { '/api': `http://127.0.0.1:${PHP_PORT}` } },
  // The three.js scene is lazy-loaded into its own chunk; it is large by nature.
  build: { chunkSizeWarningLimit: 1000 },
})
