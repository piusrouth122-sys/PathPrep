import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // This line forces Vite to serve your 3D models and lighting!
  assetsInclude: ['**/*.enc', '**/*.hdr'],
})