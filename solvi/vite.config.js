import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    base: './',
    build: {
        // Neutralino serves everything from resources/ (documentRoot in
        // neutralino.config.json), so the app bundle has to land there.
        // emptyOutDir stays false: resources/js/neutralino.js (client lib,
        // restored by `neu update`) and resources/icons/ must survive rebuilds.
        outDir: 'resources',
        emptyOutDir: false,

        rolldownOptions: {
            input: {
                main: resolve(import.meta.dirname, "index.html"),
                setting: resolve(import.meta.dirname, "setting.html")
            }
        }
    },
})