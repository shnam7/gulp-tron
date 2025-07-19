import process from 'node:process'
import child_process, {type SpawnOptions} from 'node:child_process'
import type {LogOptions} from '../types.js'

/** Type for execution options combining spawn options with logging */
export type ExecOptions = SpawnOptions & LogOptions

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

    const [cmd, ...args] = trimmedCommand.split(/\s+/)
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
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        childProcess.on('exit', (exitCode: number | undefined) => {
            if (exitCode && exitCode !== 0)
                reject(new Error(`Command "${command}" exited with code: ${exitCode}`))
            else resolve()
        })

        childProcess.on('error', (error: Error) => {
            reject(new Error(`Failed to execute "${command}": ${error.message}`))
        })
    })
}

/**
 * Execute command and return process execution promise
 * @param command Command string to execute
 * @param options Execution options
 * @returns Process execution result with child process and promise
 */
export async function exec(command: string, options: ExecOptions = {}): Promise<void> {
    const logger = options.logger ?? console.log

    const parsed = parseCommand(command)
    if (!parsed.isValid) throw new Error(`Invalid command: '${command}'`)

    const childProcess = createChildProcess(parsed.cmd, parsed.args, options)
    try {
        await processToPromise(childProcess, command)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger(errorMessage)
        throw error // Re-throw the error so callers can handle it
    }
}

export default exec
