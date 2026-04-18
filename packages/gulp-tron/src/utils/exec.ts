import process from 'node:process'
import child_process, {type SpawnOptions} from 'node:child_process'
import type {LogOptions} from '../types.js'

/** Type for execution options combining spawn options with logging */
export type ExecOptions = SpawnOptions & LogOptions
export type ExecResult = {
    exitCode?: number
    message?: string
}

/** Type for command parsing result */
type ParsedCommand = {
    readonly cmd: string
    readonly args: string[]
    readonly isValid: boolean
}

/**
 * Parse command string into command and arguments
 * @param command Command string to parse
 * @returns Parsed command with validation
 */
function parseCommand(command: string): ParsedCommand {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) return {cmd: command, args: [], isValid: false}

    const [cmd, ...args] = trimmedCommand.split(/\s+/v)
    return {cmd: cmd ?? '', args, isValid: Boolean(cmd?.trim())}
}

/**
 * Create child process with proper configuration
 * @param cmd Command to execute
 * @param args Command arguments
 * @param options Execution options
 * @returns Child process instance
 */
function createChildProcess(
    cmd: string,
    args: string[],
    options: ExecOptions = {},
): child_process.ChildProcess {
    const opts: ExecOptions = {shell: true, stdio: 'pipe', ...options}
    const childProcess = child_process.spawn(cmd, args, opts)

    // Pipe output to main process
    childProcess.stdout?.pipe(process.stdout)
    childProcess.stderr?.pipe(process.stderr)

    return childProcess
}

/**
 * Create promise that resolves when child process completes successfully
 * @param childProcess Child process to monitor
 * @param command Original command string for error messages
 * @returns Promise that resolves on success or rejects on error
 */
async function processToPromise(
    childProcess: child_process.ChildProcess,
    command: string,
): Promise<ExecResult> {
    return new Promise<ExecResult>((resolve, reject) => {
        childProcess.on('exit', (exitCode: number | undefined) => {
            const message =
                exitCode === 0 ? '' : `Command "${command}" exited with code: ${exitCode}`
            resolve({exitCode, message})

            // if (exitCode && exitCode !== 0)
            //     reject(new Error(`Command "${command}" exited with code: ${exitCode}`))
            // else resolve({})
        })

        childProcess.on('error', (error: Error) => {
            // reject(new Error(`Failed to execute "${command}": ${error.message}`))
            const message = `Failed to execute "${command}": ${error.message}`
            resolve({message})
        })
    })
}

/**
 * Execute command and return process execution promise
 * @param command Command string to execute
 * @param options Execution options
 * @returns Process execution result with child process and promise
 */
export async function exec(command: string, options: ExecOptions = {}): Promise<ExecResult> {
    const logger = options.logger ?? console.log

    const parsed = parseCommand(command)
    if (!parsed.isValid) return {message: `Invalid command: '${command}'`}

    const childProcess = createChildProcess(parsed.cmd, parsed.args, options)

    const ret = await processToPromise(childProcess, command)
    if (options.logLevel !== 'silent') logger(ret.message)

    return ret
}

export default exec
