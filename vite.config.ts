import path from 'node:path' 
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { splitVendorChunkPlugin } from 'vite'

export default defineConfig({
  plugins: [
    svelte(),
    splitVendorChunkPlugin(),
  ],
  build: {
    rollupOptions: {
      input: {
        'worker': path.resolve(__dirname, 'src/worker.ts'),
      },
      output: {
        manualChunks: {},
        entryFileNames: () => '[name].js'
      },
    }
  }
})
