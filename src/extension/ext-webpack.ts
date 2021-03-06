/**
 *  gulp-tron extension - webpack
 *
 *  Options:
 *    configFile: override for buildOptions.webpackConfig
 *
 *  buildOptions:
 *    webpackConfig: webpack config file name.
 *    printConfig: Print tsConfig options.
 *
 *  moduleOptions:
 *    webpack: Options to gulp-webpack.
 */

import * as upath from 'upath';
import { RTB } from "../core/rtb";
import { Options,info, is, msg } from '../utils/utils';
import { requireSafe } from "../utils/npm";

/**
 * Configuration priorities:
 * - load webpack.config.js if buildOptions.webpackConfig is set
 * - override the config file with moduleOptions.webpack
 * - override it with rtb.conf.src (src can be an array to specify multiple entries)
 * - override it with rtb.conf.outFile and rtb.conf.dest
 */
RTB.registerExtension('webpack', (options: Options = {}) => (rtb: RTB) => {
    const { buildOptions: opts, moduleOptions: mopts } = rtb.conf;
    // resolve: workaround function to handle platform dependency of backslashes
    const resolve = (process.platform === 'win32') ? upath.win32.resolve : upath.resolve;
    const merge = requireSafe('lodash.merge');

    const configFile = resolve(options.configFile || opts.webpackConfig
        || upath.join(process.cwd(), "webpack.config.js"));
    info(`[ext-webpack] webpackConfig=${configFile}`);

    // load configFile first, and then override with moduleOptions.webpack
    let wpOpts = merge(configFile ? require(configFile) : {}, mopts.webpack);

    // override webpack entry file with conf.src
    if (rtb.conf.src) {
        if (is.Array(rtb.conf.src)) {
            let src: string[] = [];  // get absolute paths in array
            rtb.conf.src.forEach((name) => src.push(resolve(name)));
            merge(wpOpts, { entry: src });
        }
        else
            merge(wpOpts, { entry: resolve(rtb.conf.src) });
    }

    // override webpack output settings with conf.dest and conf.outFile
    if (rtb.conf.dest) merge(wpOpts, { output: { path: rtb.conf.dest } });
    if (rtb.conf.outFile) merge(wpOpts, { output: { filename: rtb.conf.outFile } });
    if (!wpOpts.output || !wpOpts.output.filename) merge(wpOpts, { output: { filename: '[name].bundle.js' } });

    // sanitize options
    if (wpOpts.output.path) wpOpts.output.path = resolve(wpOpts.output.path);

    if (opts.printConfig) msg(`Webpack Config =`, wpOpts);
    const compiler = requireSafe('webpack')(wpOpts);
    return new Promise((resolve, reject) => {
        compiler.hooks.done.tap("done", resolve);
        compiler.hooks.failed.tap("failed", reject);
        compiler.run((err: Error, stats: any) => msg(stats.toString({ colors: true })) );
    })
});
