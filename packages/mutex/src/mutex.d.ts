/**
 * ref: https://github.com/pbardov/es6-mutex
 */
import { Semaphore } from './semaphore.js';
export declare class Mutex {
    protected _sem: Semaphore;
    constructor();
    lock(): Promise<void>;
    tryLock(): boolean;
    unlock(): void;
}
//# sourceMappingURL=mutex.d.ts.map