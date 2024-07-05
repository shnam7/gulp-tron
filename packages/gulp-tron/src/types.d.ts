declare module 'streamqueue' {
    import {type ReadStream} from 'node:fs'
    import {type Transform} from 'node:stream'

    export type StreamQueueOptions = {objectMode: boolean}

    export default function streamqueue(
        options: StreamQueueOptions,
        ...streams: Transform[]
    ): Transform
}
