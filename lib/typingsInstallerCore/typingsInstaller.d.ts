import { MapLike, Path } from "./_namespaces/ts";
import { BeginInstallTypes, CloseProject, DiscoverTypings, EndInstallTypes, InstallTypingHost, InvalidateCachedTypings, SetTypings } from "./_namespaces/ts.server";
export interface Log {
    isEnabled(): boolean;
    writeLine(text: string): void;
}
/** @internal */
export declare function installNpmPackages(npmPath: string, tsVersion: string, packageNames: string[], install: (command: string) => boolean): boolean;
/** @internal */
export declare function getNpmCommandForInstallation(npmPath: string, tsVersion: string, packageNames: string[], remaining: number): {
    command: string;
    remaining: number;
};
export type RequestCompletedAction = (success: boolean) => void;
interface PendingRequest {
    requestId: number;
    packageNames: string[];
    cwd: string;
    onRequestCompleted: RequestCompletedAction;
}
export declare abstract class TypingsInstaller {
    protected readonly installTypingHost: InstallTypingHost;
    private readonly globalCachePath;
    private readonly safeListPath;
    private readonly typesMapLocation;
    private readonly throttleLimit;
    protected readonly log: Log;
    private readonly packageNameToTypingLocation;
    private readonly missingTypingsSet;
    private readonly knownCachesSet;
    private readonly projectWatchers;
    private safeList;
    readonly pendingRunRequests: PendingRequest[];
    private readonly toCanonicalFileName;
    private readonly globalCachePackageJsonPath;
    private installRunCount;
    private inFlightRequestCount;
    abstract readonly typesRegistry: Map<string, MapLike<string>>;
    /** @internal */
    private readonly watchFactory;
    constructor(installTypingHost: InstallTypingHost, globalCachePath: string, safeListPath: Path, typesMapLocation: Path, throttleLimit: number, log?: Log);
    closeProject(req: CloseProject): void;
    private closeWatchers;
    install(req: DiscoverTypings): void;
    private initializeSafeList;
    private processCacheLocation;
    private filterTypings;
    protected ensurePackageDirectoryExists(directory: string): void;
    private installTypings;
    private ensureDirectoryExists;
    private watchFiles;
    private createSetTypings;
    private installTypingsAsync;
    private executeWithThrottling;
    protected abstract installWorker(requestId: number, packageNames: string[], cwd: string, onRequestCompleted: RequestCompletedAction): void;
    protected abstract sendResponse(response: SetTypings | InvalidateCachedTypings | BeginInstallTypes | EndInstallTypes): void;
    protected readonly latestDistTag = "latest";
}
/** @internal */
export declare function typingsName(packageName: string): string;
export {};
//# sourceMappingURL=typingsInstaller.d.ts.map