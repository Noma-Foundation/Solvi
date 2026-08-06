import { defineConfig } from 'vite'

// Relative base so assets load correctly from file:// in the desktop app.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
