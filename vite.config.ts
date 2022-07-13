import path from 'node:path' 
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte(),
  ],
  // build: {
  //   lib: {
  //     formats: ['es'],
  //     entry: path.resolve(__dirname, 'src/main.ts'),
  //     fileName: (format) => `ammo-worker.${format}.js`,
  //   }
  // }
})
