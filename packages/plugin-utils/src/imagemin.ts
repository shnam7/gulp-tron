import type {BuildStream, PluginFunction} from 'gulp-tron'
import type {Plugin} from 'imagemin'
import imageminG from 'gulp-imagemin'

export type ImageminOptions = imageminG.Options

/**
 * Imagemin plugin - wrapper for gulp-imagemin
 *
 * @param pluginsOrOptions Optional plugins array or imagemin options.
 * @param options imagemin options
 * @returns PluginFunction
 */
export function imageminP(pluginsOrOptions?: readonly Plugin[] | ImageminOptions): PluginFunction
export function imageminP(plugins?: readonly Plugin[], options?: ImageminOptions): PluginFunction
export function imageminP(
    pluginsOrOptions?: readonly Plugin[] | ImageminOptions,
    options?: ImageminOptions,
): PluginFunction {
    return (bs: BuildStream) => {
        if (Array.isArray(pluginsOrOptions)) {
            bs.pipe(imageminG(pluginsOrOptions, options))
        } else {
            // pluginsOrOptions is ImageminOptions | undefined
            bs.pipe(imageminG(pluginsOrOptions as ImageminOptions | undefined))
        }
    }
}

export default imageminP
