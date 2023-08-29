import { MapLike } from "./_namespaces/ts";
import { TypingInstallerRequestUnion, TypingInstallerResponseUnion } from "./_namespaces/ts.server";
import { Log, RequestCompletedAction, TypingsInstaller } from "./_namespaces/ts.server.typingsInstaller";
export declare class NodeTypingsInstaller extends TypingsInstaller {
    private readonly nodeExecSync;
    private readonly npmPath;
    readonly typesRegistry: Map<string, MapLike<string>>;
    private delayedInitializationError;
    constructor(globalTypingsCacheLocation: string, typingSafeListLocation: string, typesMapLocation: string, npmLocation: string | undefined, validateDefaultNpmLocation: boolean, throttleLimit: number, log: Log);
    handleRequest(req: TypingInstallerRequestUnion): void;
    protected sendResponse(response: TypingInstallerResponseUnion): void;
    protected installWorker(requestId: number, packageNames: string[], cwd: string, onRequestCompleted: RequestCompletedAction): void;
    /** Returns 'true' in case of error. */
    private execSyncAndLog;
}
//# sourceMappingURL=nodeTypingsInstaller.d.ts.map