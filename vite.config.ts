import path from 'node:path' 
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      formats: ['es'],
      entry: path.resolve(__dirname, 'src/main.ts'),
      fileName: (format) => `ammo-worker.${format}.js`,
    }
  }
})
