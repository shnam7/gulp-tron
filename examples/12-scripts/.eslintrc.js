// // DO not delete this file - This file is require when lint option is enabled in JavaScript builders
// // ref: https://eslint.org/docs/user-guide/configuring
// module.exports = {
//     "root": true,
//     "rules": {
//     }
// }

export default config = {
    extends: 'standard',
    rules: {
        indent: ['error', 4],
        semi: ['error', 'always'],
        'no-trailing-spaces': 0,
        'keyword-spacing': 0,
        'no-unused-vars': 1,
        'no-multiple-empty-lines': 0,
        'space-before-function-paren': 0,
        'eol-last': 0,
    },
}
