export const foo = 'bar'
export function isdefined(value) {
    return value !== undefined
}

export function bold(options) {
    // options.fn(this) = Handelbars content between {{#bold}} HERE {{/bold}}
    console.log('---', options)
    // const bolder = '<strong>' + options.fn(this) + '</strong>'
        // return bolder
    return options
}

export default foo
