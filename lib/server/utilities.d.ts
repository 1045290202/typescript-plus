import { Comparer, SortedArray } from "./_namespaces/ts";
import { Logger, NormalizedPath, ServerHost } from "./_namespaces/ts.server";
/** @internal */
export declare class ThrottledOperations {
    private readonly host;
    private readonly pendingTimeouts;
    private readonly logger?;
    constructor(host: ServerHost, logger: Logger);
    /**
     * Wait `number` milliseconds and then invoke `cb`.  If, while waiting, schedule
     * is called again with the same `operationId`, cancel this operation in favor
     * of the new one.  (Note that the amount of time the canceled operation had been
     * waiting does not affect the amount of time that the new operation waits.)
     */
    schedule(operationId: string, delay: number, cb: () => void): void;
    cancel(operationId: string): boolean;
    private static run;
}
/** @internal */
export declare class GcTimer {
    private readonly host;
    private readonly delay;
    private readonly logger;
    private timerId;
    constructor(host: ServerHost, delay: number, logger: Logger);
    scheduleCollect(): void;
    private static run;
}
/** @internal */
export declare function getBaseConfigFileName(configFilePath: NormalizedPath): "tsconfig.json" | "jsconfig.json" | undefined;
/** @internal */
export declare function removeSorted<T>(array: SortedArray<T>, remove: T, compare: Comparer<T>): void;
/** @internal */
export declare function indent(str: string): string;
/**
 * Put stringified JSON on the next line, indented.
 *
 * @internal
 */
export declare function stringifyIndented(json: {}): string;
//# sourceMappingURL=utilities.d.ts.map