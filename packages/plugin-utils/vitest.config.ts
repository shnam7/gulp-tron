import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Resolve gulp-tron from workspace source so tests don't need the dist folder
export default defineConfig({
    resolve: {
        alias: {
            'gulp-tron': path.resolve(__dirname, '../gulp-tron/src/index.ts'),
        },
    },
})
