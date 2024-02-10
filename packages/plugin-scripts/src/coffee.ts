/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import coffeeG from 'gulp-coffee'

export type CoffeeOptions = Parameters<typeof coffeeG>[0]

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const coffeeP = (options: CoffeeOptions): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(coffeeG(options))
}

export default coffeeP
