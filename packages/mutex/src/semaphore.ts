// ref: https://github.com/pbardov/es6-mutex

export class Semaphore {
    protected _waitQ: (() => void)[] = []
    protected _value: number = 0 // # of currently allowed accesses

    constructor(value: number = 0) {
        this._value = value
    }

    /**
     * Aquire semaphore resource.
     *
     * @returns Promise waiting for sempahore resorece allocation.
     */
    async acquire(): Promise<void> {
        if (this._value > 0) {
            --this._value
            return Promise.resolve()
        }

        return new Promise<void>(resolve => {
            this._waitQ.push(() => {
                --this._value
                resolve()
            })
        })
    }

    /**
     * Try aquiring semaphore resource. returns immediately if the access not available.
     *
     * @returns true if the access aquired, or false
     */
    tryAcquire(): boolean {
        if (this._value <= 0) return false
        --this._value
        return true
    }

    /**
     * Release semaphore resource
     */
    release(): void {
        ++this._value
        if (this._waitQ.length > 0) {
            const resolver = this._waitQ.shift()
            if (resolver) resolver()
        }
    }

    /**
     * @returns semapohore value, resouce count currently available (aquirable counts)
     */
    get value(): number {
        return this._value
    }

    /**
     * POSIX semaphore interface for sem_wait()
     *
     * @returns Promise returning semaphore signal. Alias for aquire()
     */
    async wait(): Promise<void> {
        return this.acquire()
    }

    /**
     * POSIX semaphore interface for sem_trywait(). Alias for tryWait()
     *
     * @returns true on success, or false
     */
    tryWait(): boolean {
        return this.tryAcquire()
    }

    /**
     * POSIX semaphore interface for sem_post(). Alias fore release()
     */
    post(): void {
        return this.release()
    }
}
