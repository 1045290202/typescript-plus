export declare const versionMajorMinor = "5.0";
/** The version of the TypeScript compiler release */
export declare const version: string;
/**
 * Type of objects whose values are all of the same type.
 * The `in` and `for-in` operators can *not* be safely used,
 * since `Object.prototype` may be modified by outside code.
 */
export interface MapLike<T> {
    [index: string]: T;
}
export interface SortedReadonlyArray<T> extends ReadonlyArray<T> {
    " __sortedArrayBrand": any;
}
export interface SortedArray<T> extends Array<T> {
    " __sortedArrayBrand": any;
}
/**
 * Common read methods for ES6 Map/Set.
 *
 * @internal
 */
export interface ReadonlyCollection<K> {
    readonly size: number;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
}
/**
 * Common write methods for ES6 Map/Set.
 *
 * @internal
 */
export interface Collection<K> extends ReadonlyCollection<K> {
    delete(key: K): boolean;
    clear(): void;
}
/**
 * Array that is only intended to be pushed to, never read.
 *
 * @internal
 */
export interface Push<T> {
    push(...values: T[]): void;
    readonly length: number;
}
/** @internal */
export type EqualityComparer<T> = (a: T, b: T) => boolean;
/** @internal */
export type Comparer<T> = (a: T, b: T) => Comparison;
/** @internal */
export declare const enum Comparison {
    LessThan = -1,
    EqualTo = 0,
    GreaterThan = 1
}
//# sourceMappingURL=corePublic.d.ts.map