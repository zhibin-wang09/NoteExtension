import { defineConfig } from 'vite'
import { crx, type ManifestV3Export } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import man from './manifest.json'
import tailwindcss from '@tailwindcss/vite'

const manifest = man as ManifestV3Export

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    crx({ manifest }),    
    react(),    
    tailwindcss(),
  ],
})
