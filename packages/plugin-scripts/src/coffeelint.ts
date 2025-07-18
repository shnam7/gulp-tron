/**
 *  gulp-tron plugin-javascript
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import coffeelintG from 'gulp-coffeelint'

export type CoffeeLintOptions<T extends Record<string, unknown> = Record<string, unknown>> = T

/**
 * CoffeesLint plugin - wrapper for gulp-coffeelint
 *
 * @param optFile Absolute path of a json file containing options for coffeelint.
 * @param opt Options you wish to send to coffeelint. If optFile is given, this will be ignored.
 * @param literate Are we dealing with Literate CoffeeScript?
 * @param rules Add custom rules to coffeelint.
 * @returns PluginFunction
 */
export const coffeelintP =
    (
        optFile?: string,
        opt?: CoffeeLintOptions,
        literate?: boolean,
        rules?: Array<() => void>,
    ): PluginFunction =>
    (bs: BuildStream) => {
        bs.pipe(coffeelintG(optFile, opt, literate, rules))
    }

export default coffeelintP
