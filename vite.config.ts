import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El sitio se publica en https://fc-soluciones-ai.github.io/sistema-romana/
  base: '/sistema-romana/',
})
