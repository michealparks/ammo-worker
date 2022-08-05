import path from 'node:path' 
import { defineConfig } from 'vite'

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
})
