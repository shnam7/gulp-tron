import { GBuilder, TaskOptions } from './builder.js'

export class CopyBuilder extends GBuilder {
    protected _build(builder: GBuilder, conf: TaskOptions): void | Promise<any> {
        if (conf.verbose) console.log(`CopyBuilder:${builder.name}:[${conf.src}] ==> [${conf.dest}]`)
        if (conf.src && conf.dest) this.src(conf.src).dest(conf.dest)
    }
}
