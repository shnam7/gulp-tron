import {type FlatXoConfig} from 'xo'

const xoConfig: FlatXoConfig = [
    {
        prettier: true,
        space: 4,
        rules: {
            'capitalized-comments': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'function-paren-newline': 'off',
            'implicit-arrow-linebreak': 'off',
            'arrow-body-style': ['error', 'as-needed'],

            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
]

export default xoConfig
