/**
 * ref: https://github.com/pbardov/es6-mutex
 */

import { Semaphore } from './semaphore.js'

export class Mutex {
    protected _sem = new Semaphore(1)

    constructor() {}

    lock(): Promise<void> {
        return this._sem.acquire()
    }

    tryLock(): boolean {
        return this._sem.tryAcquire()
    }

    unlock(): void {
        this._sem.release()
    }
}
