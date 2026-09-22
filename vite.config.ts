import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_BASE (see .env) points the app at your FastAPI backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { chunkSizeWarningLimit: 1200 },
})
