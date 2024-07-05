declare module 'gulp-rtlcss' {
    import {type Transform} from 'node:stream'
    import {type ConfigureOptions} from 'gulp-rtlcss'

    export default function rtlcssG(options: ConfigureOptions): Transform
    export {type ConfigureOptions as RtlCssOptions} from 'rtlcss'
}
