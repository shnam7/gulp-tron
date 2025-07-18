/**
 *  gulp-tron plugin-javascript
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import coffeeG, {type CoffeeOptions} from 'gulp-coffee'

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const coffeeP =
    (options: CoffeeOptions = {}): PluginFunction =>
    (bs: BuildStream): void => {
        bs.pipe(coffeeG(options))
    }

export default coffeeP
export {type CoffeeOptions} from 'gulp-coffee'
