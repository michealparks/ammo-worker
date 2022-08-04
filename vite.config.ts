import path from 'node:path' 
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte(),
  ],
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
  envPrefix: 'THREE_',
})
