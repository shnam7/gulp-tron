
declare module 'gulp-rtlcss' {
    import type { ConfigureOptions } from 'rtlcss'

    export type { ConfigureOptions }
    export default function rtlcssG(options: ConfigureOptions): stream.Transform
}

// declare module 'gulp-stylelint' {
//     import type { LintResult, LinterOptions, LinterResult } from 'stylelint'
//     import stream from 'stream'

//     //--- formatters: https://stylelint.io/developer-guide/formatters/
//     export type Formatter = (result: LintResult[], LinterResult) => string

//     export type GulpStylelintFormatter = "string" | "verbose" | "json" | Formatter

//     // reporter
//     export type Reporter = {
//         // stylelint results formatter (required):
//         // - pass a function for imported, custom or exposed formatters
//         // - pass a string ("string", "verbose", "json") for formatters bundled with stylelint
//         formatter: GulpStylelintFormatter,

//         save?: string, // save the formatted result to a file (optional):

//         console?: true // log the formatted result to console (optional):
//     }

//     export type GulpStylelintOptions = LinterOptions & {
//         reporters?: Reporter[]
//     }

//     export default function gulpStylelint(options: GulpStylelintOptions): stream.Transform
// }

// declare module '@ronilaukkarinen/gulp-stylelint' {
//     /// <reference types="node" />

//     import * as stylelint from "stylelint"

//     interface GulpStylelint {
//         (options?: gulpStylelint.Options): NodeJS.ReadWriteStream
//         formatters: Record<string, stylelint.Formatter>
//     }

//     declare namespace gulpStylelint {
//         interface Reporter {
//             console?: true
//             formatter: string | stylelint.Formatter
//             save?: string
//         }

//         interface Options extends Omit<stylelint.LinterOptions, "files" | "formatter"> {
//             /**
//              * When set to true, the process will end with non-zero error code if any error-level warnings were raised.
//              *
//              * @default true
//              */
//             failAfterError?: boolean

//             /**
//              * Base directory for lint results written to filesystem.
//              */
//             reportOutputDir?: string

//             /**
//              * List of reporter configuration objects.
//              *
//              * @default []
//              */
//             reporters?: Reporter[]

//             /**
//              * When set to true, the error handler will print an error stack trace.
//              *
//              * @default true
//              */
//             debug?: true
//         }
//     }

//     declare const gulpStylelint: GulpStylelint

//     export = gulpStylelint
// }
