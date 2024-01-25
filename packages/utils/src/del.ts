import { deleteSync, Options } from 'del'

/**
 * Delete files with glob patterns
 *
 * @param patterns glob patterns
 * @param opt Options
 * @returns array of deleted files
 */
export type DelOptions = Options & { logLevel?: 'verbose' | 'normal' | 'silent', logger?: (...args: any[]) => void }

export const del = (patterns: string | string[], opt: DelOptions = {}): string[] => {
    const logger = opt.logger || console.log

    if (opt.logLevel === 'verbose') logger('Deleting:', patterns)
    return deleteSync(patterns, opt)
}
