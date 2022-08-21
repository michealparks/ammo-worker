import path from 'node:path' 
import { defineConfig } from 'vite'
import ssl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
    https: true,
    fs: {
      strict: true,
      allow: ['.'],
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      input: {
        'worker': path.resolve(__dirname, 'src/worker.ts'),
      },
      output: {
        entryFileNames: () => '[name].js'
      },
    }
  },
  envPrefix: ['THREE', 'AMMO'],
  plugins: [
    ssl(),
  ],
})
