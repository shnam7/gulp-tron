/**
 * ref: https://github.com/pbardov/es6-mutex
 */
import { Semaphore } from './semaphore.js';
export class Mutex {
    _sem = new Semaphore(1);
    constructor() { }
    lock() {
        return this._sem.acquire();
    }
    tryLock() {
        return this._sem.tryAcquire();
    }
    unlock() {
        this._sem.release();
    }
}
