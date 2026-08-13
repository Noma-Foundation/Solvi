import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,

        rolldownOptions: {
            input: {
                main: resolve(import.meta.dirname, "index.html"),
                setting: resolve(import.meta.dirname, "setting.html")
            }
        }
    },
})