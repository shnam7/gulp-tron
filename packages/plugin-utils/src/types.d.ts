declare module 'gulp-data' {
    import type {LogOptions, GulpStream} from '@gulp-tron/core'

    export type DataObject<T extends Record<string, unknown> = Record<string, unknown>> = T &
        LogOptions

    export type DataFunction = (file: any, callback: TransformCallback) => DataObject

    export default function dataG(options: DataObject | DataFunction): GulpStream
}
