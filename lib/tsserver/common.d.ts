import { LanguageServiceMode } from "./_namespaces/ts";
import { Logger, LogLevel, ServerCancellationToken, SessionOptions } from "./_namespaces/ts.server";
/** @internal */
export declare function getLogLevel(level: string | undefined): LogLevel | undefined;
/** @internal */
export interface StartSessionOptions {
    globalPlugins: SessionOptions["globalPlugins"];
    pluginProbeLocations: SessionOptions["pluginProbeLocations"];
    allowLocalPluginLoads: SessionOptions["allowLocalPluginLoads"];
    useSingleInferredProject: SessionOptions["useSingleInferredProject"];
    useInferredProjectPerProjectRoot: SessionOptions["useInferredProjectPerProjectRoot"];
    suppressDiagnosticEvents: SessionOptions["suppressDiagnosticEvents"];
    noGetErrOnBackgroundUpdate: SessionOptions["noGetErrOnBackgroundUpdate"];
    serverMode: SessionOptions["serverMode"];
}
/** @internal */
export interface StartInput {
    args: readonly string[];
    logger: Logger;
    cancellationToken: ServerCancellationToken;
    serverMode: LanguageServiceMode | undefined;
    unknownServerMode?: string;
    startSession: (option: StartSessionOptions, logger: Logger, cancellationToken: ServerCancellationToken) => void;
}
//# sourceMappingURL=common.d.ts.map