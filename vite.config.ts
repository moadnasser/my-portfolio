import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The three.js scene is lazy-loaded into its own chunk; it is large by nature.
  build: { chunkSizeWarningLimit: 1000 },
})
