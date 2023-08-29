import { BufferEncoding, FileTextChanges, HostCancellationToken, LanguageServiceMode } from "./_namespaces/ts";
import { ITypingsInstaller, Logger, NormalizedPath, Project, ProjectService, ProjectServiceEventHandler, ServerHost } from "./_namespaces/ts.server";
import * as protocol from "./protocol";
export interface ServerCancellationToken extends HostCancellationToken {
    setRequest(requestId: number): void;
    resetRequest(requestId: number): void;
}
export declare const nullCancellationToken: ServerCancellationToken;
export interface PendingErrorCheck {
    fileName: NormalizedPath;
    project: Project;
}
/** @deprecated use ts.server.protocol.CommandTypes */
export type CommandNames = protocol.CommandTypes;
/** @deprecated use ts.server.protocol.CommandTypes */
export declare const CommandNames: any;
export declare function formatMessage<T extends protocol.Message>(msg: T, logger: Logger, byteLength: (s: string, encoding: BufferEncoding) => number, newLine: string): string;
export type Event = <T extends object>(body: T, eventName: string) => void;
export interface EventSender {
    event: Event;
}
/** @internal */
export declare function toEvent(eventName: string, body: object): protocol.Event;
export interface SessionOptions {
    host: ServerHost;
    cancellationToken: ServerCancellationToken;
    useSingleInferredProject: boolean;
    useInferredProjectPerProjectRoot: boolean;
    typingsInstaller: ITypingsInstaller;
    byteLength: (buf: string, encoding?: BufferEncoding) => number;
    hrtime: (start?: [number, number]) => [number, number];
    logger: Logger;
    /**
     * If falsy, all events are suppressed.
     */
    canUseEvents: boolean;
    eventHandler?: ProjectServiceEventHandler;
    /** Has no effect if eventHandler is also specified. */
    suppressDiagnosticEvents?: boolean;
    serverMode?: LanguageServiceMode;
    throttleWaitMilliseconds?: number;
    noGetErrOnBackgroundUpdate?: boolean;
    globalPlugins?: readonly string[];
    pluginProbeLocations?: readonly string[];
    allowLocalPluginLoads?: boolean;
    typesMapLocation?: string;
}
export declare class Session<TMessage = string> implements EventSender {
    private readonly gcTimer;
    protected projectService: ProjectService;
    private changeSeq;
    private performanceData;
    private currentRequestId;
    private errorCheck;
    protected host: ServerHost;
    private readonly cancellationToken;
    protected readonly typingsInstaller: ITypingsInstaller;
    protected byteLength: (buf: string, encoding?: BufferEncoding) => number;
    private hrtime;
    protected logger: Logger;
    protected canUseEvents: boolean;
    private suppressDiagnosticEvents?;
    private eventHandler;
    private readonly noGetErrOnBackgroundUpdate?;
    constructor(opts: SessionOptions);
    private sendRequestCompletedEvent;
    private addPerformanceData;
    private performanceEventHandler;
    private defaultEventHandler;
    private projectsUpdatedInBackgroundEvent;
    logError(err: Error, cmd: string): void;
    private logErrorWorker;
    send(msg: protocol.Message): void;
    protected writeMessage(msg: protocol.Message): void;
    event<T extends object>(body: T, eventName: string): void;
    /** @internal */
    doOutput(info: {} | undefined, cmdName: string, reqSeq: number, success: boolean, message?: string): void;
    private semanticCheck;
    private syntacticCheck;
    private suggestionCheck;
    private sendDiagnosticsEvent;
    /** It is the caller's responsibility to verify that `!this.suppressDiagnosticEvents`. */
    private updateErrorCheck;
    private cleanProjects;
    private cleanup;
    private getEncodedSyntacticClassifications;
    private getEncodedSemanticClassifications;
    private getProject;
    private getConfigFileAndProject;
    private getConfigFileDiagnostics;
    private convertToDiagnosticsWithLinePositionFromDiagnosticFile;
    private getCompilerOptionsDiagnostics;
    private convertToDiagnosticsWithLinePosition;
    private getDiagnosticsWorker;
    private getDefinition;
    private mapDefinitionInfoLocations;
    private getDefinitionAndBoundSpan;
    private findSourceDefinition;
    private getEmitOutput;
    private mapJSDocTagInfo;
    private mapDisplayParts;
    private mapSignatureHelpItems;
    private mapDefinitionInfo;
    private static mapToOriginalLocation;
    private toFileSpan;
    private toFileSpanWithContext;
    private getTypeDefinition;
    private mapImplementationLocations;
    private getImplementation;
    private getOccurrences;
    private getSyntacticDiagnosticsSync;
    private getSemanticDiagnosticsSync;
    private getSuggestionDiagnosticsSync;
    private getJsxClosingTag;
    private getDocumentHighlights;
    private provideInlayHints;
    private setCompilerOptionsForInferredProjects;
    private getProjectInfo;
    private getProjectInfoWorker;
    private getRenameInfo;
    private getProjects;
    private getDefaultProject;
    private getRenameLocations;
    private mapRenameInfo;
    private toSpanGroups;
    private getReferences;
    private getFileReferences;
    /**
     * @param fileName is the name of the file to be opened
     * @param fileContent is a version of the file content that is known to be more up to date than the one on disk
     */
    private openClientFile;
    private getPosition;
    private getPositionInFile;
    private getFileAndProject;
    private getFileAndLanguageServiceForSyntacticOperation;
    private getFileAndProjectWorker;
    private getOutliningSpans;
    private getTodoComments;
    private getDocCommentTemplate;
    private getSpanOfEnclosingComment;
    private getIndentation;
    private getBreakpointStatement;
    private getNameOrDottedNameSpan;
    private isValidBraceCompletion;
    private getQuickInfoWorker;
    private getFormattingEditsForRange;
    private getFormattingEditsForRangeFull;
    private getFormattingEditsForDocumentFull;
    private getFormattingEditsAfterKeystrokeFull;
    private getFormattingEditsAfterKeystroke;
    private getCompletions;
    private getCompletionEntryDetails;
    private getCompileOnSaveAffectedFileList;
    private emitFile;
    private getSignatureHelpItems;
    private toPendingErrorCheck;
    private getDiagnostics;
    private change;
    private reload;
    private saveToTmp;
    private closeClientFile;
    private mapLocationNavigationBarItems;
    private getNavigationBarItems;
    private toLocationNavigationTree;
    private getNavigationTree;
    private getNavigateToItems;
    private getFullNavigateToItems;
    private getSupportedCodeFixes;
    private isLocation;
    private extractPositionOrRange;
    private getRange;
    private getApplicableRefactors;
    private getEditsForRefactor;
    private organizeImports;
    private getEditsForFileRename;
    private getCodeFixes;
    private getCombinedCodeFix;
    private applyCodeActionCommand;
    private getStartAndEndPosition;
    private mapCodeAction;
    private mapCodeFixAction;
    private mapTextChangesToCodeEdits;
    private mapTextChangeToCodeEdit;
    private convertTextChangeToCodeEdit;
    private getBraceMatching;
    private getDiagnosticsForProject;
    private configurePlugin;
    private getSmartSelectionRange;
    private toggleLineComment;
    private toggleMultilineComment;
    private commentSelection;
    private uncommentSelection;
    private mapSelectionRange;
    private getScriptInfoFromProjectService;
    private toProtocolCallHierarchyItem;
    private toProtocolCallHierarchyIncomingCall;
    private toProtocolCallHierarchyOutgoingCall;
    private prepareCallHierarchy;
    private provideCallHierarchyIncomingCalls;
    private provideCallHierarchyOutgoingCalls;
    getCanonicalFileName(fileName: string): string;
    exit(): void;
    private notRequired;
    private requiredResponse;
    private handlers;
    addProtocolHandler(command: string, handler: (request: protocol.Request) => HandlerResponse): void;
    private setCurrentRequest;
    private resetCurrentRequest;
    executeWithRequestId<T>(requestId: number, f: () => T): T;
    executeCommand(request: protocol.Request): HandlerResponse;
    onMessage(message: TMessage): void;
    protected parseMessage(message: TMessage): protocol.Request;
    protected toStringMessage(message: TMessage): string;
    private getFormatOptions;
    private getPreferences;
    private getHostFormatOptions;
    private getHostPreferences;
}
export interface HandlerResponse {
    response?: {};
    responseRequired?: boolean;
}
/** @internal */ export declare function getLocationInNewDocument(oldText: string, renameFilename: string, renameLocation: number, edits: readonly FileTextChanges[]): protocol.Location;
//# sourceMappingURL=session.d.ts.map