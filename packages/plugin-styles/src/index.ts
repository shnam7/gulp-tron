export * from './sass.js'
export * from './less.js'
export * from './pcss.js'
export * from './stylelint.js'
export * from './autoprefixer.js'
export * from './cleanCss.js'
export * from './rtlcss.js'
export type { SassOptions } from './sass.js'
export type { LessOptions } from './less.js'
export type { PostCssOptions } from './pcss.js'
export type { StylelintOptions, StylelintReporterOptions } from './stylelint.js'
export type { AutoPrefixerOptions } from './autoprefixer.js'
export type { CleanCssOptions } from './cleanCss.js'
export type { RtlCssConfigureOptions } from './rtlcss.js'

// function applyMixins(derivedCtor: any, constructors: any[]) {
//     constructors.forEach((baseCtor) => {
//         Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//             Object.defineProperty(
//                 derivedCtor.prototype,
//                 name,
//                 Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
//                 Object.create(null)
//             )
//         })
//     })
// }

// class BSStyles extends BuildStream {
//     constructor(bs: BuildStream) {
//         super(bs.name, bs.opts)
//         // this.merge(bs)
//     }

//     sass(...args: Parameters<typeof sass>) {
//         return this.pipe(sass(...args))
//     }

//     autoPrefixer(...args: Parameters<typeof autoPrefixer>) {
//         return this.pipe(autoPrefixer(...args))
//     }

//     // stylelint(...args: Parameters<typeof stylint>) {
//     //     return this.pipe(lint(...args))
//     // }
// }

// const bsStyles = <T extends BuildStream>(bs: T) => {

//     console.log(`---1.0`, BuildStream, bs.constructor.name)
//     Object.defineProperty(BuildStream, 'sass', sass)
//     const newBs = new BuildStream('aa')

//     applyMixins(BuildStream, [BSStyles])
//     // console.log(`---1.0`, BuildStream.prototype, bs.constructor.prototype, bs.constructor.name)
//     console.log(`---1.1`, BuildStream, BuildStream.constructor.prototype)

//     return bs
// }

// const bsStyles2 = <T extends BuildStream>(bs: T) => {
//     Object.defineProperty(bs.constructor.prototype, 'autoPrefixer', autoPrefixer)
//     return bs
// }

// // export const bsScripts = (bs: BuildStream): BSScripts => new BSScripts(bs)
// export const bsScripts = (bs: BuildStream): BuildStream => {
//     return bs
// }
// export { eslint, babel, minify }

// let bs = new BuildStream('aa', {})
// bs = bsStyles(bs)
// bs = bsStyles2(bs)

// console.log(`---1`, bs.constructor.prototype)

// export default bsStyles
