import {defineConfig} from 'tsdown'

export default defineConfig({
    entry: 'src/index.ts',
    format: ['esm', 'cjs'], // Only ESM format
    dts: true,
    external: [
        // Mark these CommonJS dependencies as external
        'gulp-data',
        'gulp-imagemin',
        'js-yaml',
        'fast-glob',
        '@wicle/is',
        'gulp-tron',
    ],
    platform: 'node',
    target: 'node18',
})
