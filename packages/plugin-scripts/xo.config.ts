import {type FlatXoConfig} from 'xo'

const xoConfig: FlatXoConfig = [
    {
        prettier: 'compat',
        rules: {
            'capitalized-comments': 0,
            'unicorn/prevent-abbreviations': 0,
            'function-paren-newline': 0,
            'implicit-arrow-linebreak': 0,
            '@typescript-eslint/no-empty-function': 0,
            'arrow-body-style': ['error', 'as-needed'],
        },
    },
]

export default xoConfig
