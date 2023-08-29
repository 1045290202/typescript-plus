interface ServerCancellationToken {
    isCancellationRequested(): boolean;
    setRequest(requestId: number): void;
    resetRequest(requestId: number): void;
}
declare function createCancellationToken(args: string[]): ServerCancellationToken;
export = createCancellationToken;
//# sourceMappingURL=cancellationToken.d.ts.map