/**
 *  gulp-tron plugin-scripts:coffee
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import coffeeG, {type CoffeeOptions} from 'gulp-coffee'

/**
 * CoffeeScript Plugin - wrapper for gulp-coffee
 *
 * @param options - CoffeeScript options
 * @returns PluginFunction
 */
export const coffeeP =
    (options: CoffeeOptions = {}): PluginFunction =>
    (bs: BuildStream): void => {
        bs.pipe(coffeeG(options))
    }

export default coffeeP
export {type CoffeeOptions} from 'gulp-coffee'
