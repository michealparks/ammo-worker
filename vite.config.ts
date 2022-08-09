import path from 'node:path' 
import { defineConfig } from 'vite'
import ssl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
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
  server: {
    https: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  }
})
