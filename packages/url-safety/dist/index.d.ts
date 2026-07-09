export declare class UnsafeUrlError extends Error {
    constructor(message: string);
}
export type SafeFetchOptions = {
    method: 'GET' | 'HEAD';
    timeoutMs: number;
    signal: AbortSignal;
    headers?: HeadersInit;
};
export type SafeFetchResponse = {
    status: number;
    url: string;
};
export declare function normalizeHttpUrl(value: string): string;
export declare function assertSafeHttpUrl(value: string): Promise<string>;
export declare function safeFetch(value: string, options: SafeFetchOptions): Promise<SafeFetchResponse>;
