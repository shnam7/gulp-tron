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
            '@typescript-eslint/no-empty-function': 'off',

            // Allow single line functions/methods
            'brace-style': ['error', '1tbs', {allowSingleLine: true}],
            'object-curly-newline': ['error', {consistent: true}],
            'newline-before-return': 'off',
            'padding-line-between-statements': 'off',

            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
]

export default xoConfig
