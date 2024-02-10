declare module 'gulp-rtlcss' {
    import type { ConfigureOptions } from 'rtlcss'

    export type { ConfigureOptions }
    export default function rtlcssG(options: ConfigureOptions): stream.Transform
}
