interface FindKeyPredicate<T> {
    (value: T, key: string, obj: {
        [key: string]: T;
    }): boolean;
}
declare const findKey: <T>(obj: {
    [key: string]: T;
}, predicate?: FindKeyPredicate<T>) => string | undefined;
/**
 * This function only works for string or numbers since Set checks for reference equality,
 * meaning objects wouldn't work.
 */
declare const difference: <T extends string | number>(array: T[], ...values: T[][]) => T[];
declare const noop: VoidFunction;
declare const uniqueId: (prefix?: string) => string;
declare const shuffle: <T>(array: T[]) => T[];
declare type DebouncedFunc<T extends (...args: any[]) => void> = {
    (...args: Parameters<T>): void;
    cancel: () => void;
};
declare const debounce: <T extends (...args: any[]) => void>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}) => DebouncedFunc<T>;
declare type ThrottleFunc<T extends (...args: any[]) => void> = {
    (...args: Parameters<T>): void;
    cancel: () => void;
};
declare const throttle: <T extends (...args: any[]) => void>(func: T, wait: number, { leading, trailing }?: {
    leading?: boolean;
    trailing?: boolean;
}) => ThrottleFunc<T>;
export { findKey, difference, debounce, DebouncedFunc, throttle, noop, uniqueId, shuffle };
