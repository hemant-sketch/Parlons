import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',       // output folder
    assetsDir: '',        // keep assets at root (optional)
  },
  publicDir: resolve(__dirname, 'public'), // make sure Vite knows where public files are
})