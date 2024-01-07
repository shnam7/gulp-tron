/**
 * Producer-Consumer handshaking
 *
 * @param { max_produce } # of produce actions
 * @param { handshake } # of produce actions
 * @returns Promise for producer/consumer test result (succes or failure)
 */
export declare const producer_consumer: ({ max_produce, handshake }?: {
    max_produce?: number | undefined;
    handshake?: boolean | undefined;
}) => Promise<boolean>;
//# sourceMappingURL=semaphore.test.d.ts.map