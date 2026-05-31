import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the Court Renter React app
export default defineConfig({
  plugins: [react()],
  server: {
    // Development server runs on port 5173 (default for Vite)
    port: 5173,
    // Enable strict port to avoid falling back to another port if 5173 is busy
    strictPort: true,
  },
  // Resolve aliases if needed (none required now)
  resolve: {
    alias: {},
  },
})
