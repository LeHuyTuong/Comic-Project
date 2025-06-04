import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const basePath = process.env.VITE_BASE_PATH || './'

export default defineConfig({
  plugins: [react()],
  base: basePath,
})
