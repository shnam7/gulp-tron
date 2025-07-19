import process from 'node:process'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {exec, type ExecOptions} from '../src/utils/exec.js'

describe('Exec Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('execCommand', () => {
        it('should throw for empty command', async () => {
            await expect(exec('')).rejects.toThrow('Invalid command')
        })

        it('should throw for whitespace-only command', async () => {
            await expect(exec('   ')).rejects.toThrow('Invalid command')
        })

        it('should execute valid command', async () => {
            await expect(exec('echo test')).resolves.toBeUndefined()
        })

        it('should accept execution options', async () => {
            const options: ExecOptions = {
                cwd: process.cwd(),
                logLevel: 'silent',
            }
            await expect(exec('echo test', options)).resolves.toBeUndefined()
        })

        it('should handle command with arguments', async () => {
            await expect(exec('echo "hello world"')).resolves.toBeUndefined()
        })

        it('should handle command failure', async () => {
            // Use a command that should fail
            await expect(exec('false')).rejects.toThrow()
        })
    })
})
