export declare class Semaphore {
    protected _waitQ: (() => void)[];
    protected _value: number;
    constructor(value?: number);
    /**
     * Aquire semaphore resource.
     *
     * @returns Promise waiting for sempahore resorece allocation.
     */
    acquire(): Promise<void>;
    /**
     * Try aquiring semaphore resource. returns immediately if the access not available.
     *
     * @returns true if the access aquired, or false
     */
    tryAcquire(): boolean;
    /**
     * Release semaphore resource
     */
    release(): void;
    /**
     * @returns semapohore value, resouce count currently available (aquirable counts)
     */
    get value(): number;
    /**
     * POSIX semaphore interface for sem_wait()
     *
     * @returns Promise returning semaphore signal. Alias for aquire()
     */
    wait(): Promise<void>;
    /**
     * POSIX semaphore interface for sem_trywait(). Alias for tryWait()
     *
     * @returns true on success, or false
     */
    tryWait(): boolean;
    /**
     * POSIX semaphore interface for sem_post(). Alias fore release()
     */
    post(): void;
}
//# sourceMappingURL=semaphore.d.ts.map