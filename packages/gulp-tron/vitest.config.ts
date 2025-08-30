import {defineConfig, coverageConfigDefaults} from 'vitest/config'

const vitestConfig = defineConfig({
    test: {
        coverage: {
            exclude: [...coverageConfigDefaults.exclude, '__*/**'],
        },
    },
})

export default vitestConfig
