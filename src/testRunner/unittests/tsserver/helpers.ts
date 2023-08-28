import * as Harness from "../../_namespaces/Harness";
import * as ts from "../../_namespaces/ts";
import { ensureErrorFreeBuild } from "../tscWatch/helpers";
import {
    changeToHostTrackingWrittenFiles,
    createServerHost,
    File,
    FileOrFolderOrSymLink,
    libFile,
    TestServerHost,
    TestServerHostTrackingWrittenFiles,
} from "../virtualFileSystemWithWatch";

const outputEventRegex = /Content\-Length: [\d]+\r\n\r\n/;
export function mapOutputToJson(s: string) {
    return ts.convertToObject(
        ts.parseJsonText("json.json", s.replace(outputEventRegex, "")),
        []
    );
}

export const customTypesMap = {
    path: "/typesMap.json" as ts.Path,
    content: `{
            "typesMap": {
                "jquery": {
                    "match": "jquery(-(\\\\.?\\\\d+)+)?(\\\\.intellisense)?(\\\\.min)?\\\\.js$",
                    "types": ["jquery"]
                },
                "quack": {
                    "match": "/duckquack-(\\\\d+)\\\\.min\\\\.js",
                    "types": ["duck-types"]
                }
            },
            "simpleMap": {
                "Bacon": "baconjs",
                "bliss": "blissfuljs",
                "commander": "commander",
                "cordova": "cordova",
                "react": "react",
                "lodash": "lodash"
            }
        }`
};

export interface PostExecAction {
    readonly success: boolean;
    readonly callback: ts.server.typingsInstaller.RequestCompletedAction;
}

export interface Logger extends ts.server.Logger {
    logs: string[];
    host?: TestServerHost;
}

export function nullLogger(): Logger {
    return {
        close: ts.noop,
        hasLevel: ts.returnFalse,
        loggingEnabled: ts.returnFalse,
        perftrc: ts.noop,
        info: ts.noop,
        msg: ts.noop,
        startGroup: ts.noop,
        endGroup: ts.noop,
        getLogFileName: ts.returnUndefined,
        logs: [],
    };
}

export function createHasErrorMessageLogger(): Logger {
    return {
        ...nullLogger(),
        msg: (s, type) => ts.Debug.fail(`Error: ${s}, type: ${type}`),
    };
}

function handleLoggerGroup(logger: Logger, host: TestServerHost | undefined): Logger {
    let inGroup = false;
    let firstInGroup = false;
    let seq = 0;
    logger.startGroup = () => {
        inGroup = true;
        firstInGroup = true;
    };
    logger.endGroup = () => inGroup = false;
    logger.host = host;
    const originalInfo = logger.info;
    logger.info = s => msg(s, ts.server.Msg.Info, s => originalInfo.call(logger, s));
    return logger;

    function msg(s: string, type = ts.server.Msg.Err, write: (s: string) => void) {
        s = `[${nowString()}] ${s}`;
        if (!inGroup || firstInGroup) s = padStringRight(type + " " + seq.toString(), "          ") + s;
        if (ts.Debug.isDebugging) console.log(s);
        write(s);
        if (!inGroup) seq++;
    }

    function padStringRight(str: string, padding: string) {
        return (str + padding).slice(0, padding.length);
    }

    function nowString() {
        // E.g. "12:34:56.789"
        const d = logger.host!.now();
        return `${ts.padLeft(d.getUTCHours().toString(), 2, "0")}:${ts.padLeft(d.getUTCMinutes().toString(), 2, "0")}:${ts.padLeft(d.getUTCSeconds().toString(), 2, "0")}.${ts.padLeft(d.getUTCMilliseconds().toString(), 3, "0")}`;
    }
}

export function createLoggerWritingToConsole(host: TestServerHost): Logger {
    return handleLoggerGroup({
        ...nullLogger(),
        hasLevel: ts.returnTrue,
        loggingEnabled: ts.returnTrue,
        perftrc: s => console.log(s),
        info: s => console.log(s),
        msg: (s, type) => console.log(`${type}:: ${s}`),
    }, host);
}

export function createLoggerWithInMemoryLogs(host: TestServerHost): Logger {
    const logger = createHasErrorMessageLogger();
    return handleLoggerGroup({
        ...logger,
        hasLevel: ts.returnTrue,
        loggingEnabled: ts.returnTrue,
        info: s => logger.logs.push(
            s.replace(/Elapsed::?\s*\d+(?:\.\d+)?ms/g, "Elapsed:: *ms")
                .replace(/\"updateGraphDurationMs\"\:\d+(?:\.\d+)?/g, `"updateGraphDurationMs":*`)
                .replace(/\"createAutoImportProviderProgramDurationMs\"\:\d+(?:\.\d+)?/g, `"createAutoImportProviderProgramDurationMs":*`)
                .replace(`"version":"${ts.version}"`, `"version":"FakeVersion"`)
                .replace(/getCompletionData: Get current token: \d+(?:\.\d+)?/g, `getCompletionData: Get current token: *`)
                .replace(/getCompletionData: Is inside comment: \d+(?:\.\d+)?/g, `getCompletionData: Is inside comment: *`)
                .replace(/getCompletionData: Get previous token: \d+(?:\.\d+)?/g, `getCompletionData: Get previous token: *`)
                .replace(/getCompletionsAtPosition: isCompletionListBlocker: \d+(?:\.\d+)?/g, `getCompletionsAtPosition: isCompletionListBlocker: *`)
                .replace(/getCompletionData: Semantic work: \d+(?:\.\d+)?/g, `getCompletionData: Semantic work: *`)
                .replace(/getCompletionsAtPosition: getCompletionEntriesFromSymbols: \d+(?:\.\d+)?/g, `getCompletionsAtPosition: getCompletionEntriesFromSymbols: *`)
                .replace(/forEachExternalModuleToImportFrom autoImportProvider: \d+(?:\.\d+)?/g, `forEachExternalModuleToImportFrom autoImportProvider: *`)
                .replace(/getExportInfoMap: done in \d+(?:\.\d+)?/g, `getExportInfoMap: done in *`)
                .replace(/collectAutoImports: \d+(?:\.\d+)?/g, `collectAutoImports: *`)
                .replace(/dependencies in \d+(?:\.\d+)?/g, `dependencies in *`)
                .replace(/\"exportMapKey\"\:\s*\"[_$a-zA-Z][_$_$a-zA-Z0-9]*\|\d+\|/g, match => match.replace(/\|\d+\|/, `|*|`))
        )
    }, host);
}

export function baselineTsserverLogs(scenario: string, subScenario: string, sessionOrService: { logger: Logger; }) {
    ts.Debug.assert(sessionOrService.logger.logs.length); // Ensure caller used in memory logger
    Harness.Baseline.runBaseline(`tsserver/${scenario}/${subScenario.split(" ").join("-")}.js`, sessionOrService.logger.logs.join("\r\n"));
}

export function appendAllScriptInfos(service: ts.server.ProjectService, logs: string[]) {
    logs.push("");
    logs.push(`ScriptInfos:`);
    service.filenameToScriptInfo.forEach(info => logs.push(`path: ${info.path} fileName: ${info.fileName}`));
    logs.push("");
}

export function appendProjectFileText(project: ts.server.Project, logs: string[]) {
    logs.push("");
    logs.push(`Project: ${project.getProjectName()}`);
    project.getCurrentProgram()?.getSourceFiles().forEach(f => {
        logs.push(JSON.stringify({ fileName: f.fileName, version: f.version }));
        logs.push(f.text);
        logs.push("");
    });
    logs.push("");
}

export class TestTypingsInstaller extends ts.server.typingsInstaller.TypingsInstaller implements ts.server.ITypingsInstaller {
    protected projectService!: ts.server.ProjectService;
    constructor(
        readonly globalTypingsCacheLocation: string,
        throttleLimit: number,
        installTypingHost: ts.server.ServerHost,
        readonly typesRegistry = new Map<string, ts.MapLike<string>>(),
        log?: ts.server.typingsInstaller.Log) {
        super(installTypingHost, globalTypingsCacheLocation, "/safeList.json" as ts.Path, customTypesMap.path, throttleLimit, log);
    }

    protected postExecActions: PostExecAction[] = [];

    isKnownTypesPackageName = ts.notImplemented;
    installPackage = ts.notImplemented;
    inspectValue = ts.notImplemented;

    executePendingCommands() {
        const actionsToRun = this.postExecActions;
        this.postExecActions = [];
        for (const action of actionsToRun) {
            action.callback(action.success);
        }
    }

    checkPendingCommands(expectedCount: number) {
        assert.equal(this.postExecActions.length, expectedCount, `Expected ${expectedCount} post install actions`);
    }

    onProjectClosed = ts.noop;

    attach(projectService: ts.server.ProjectService) {
        this.projectService = projectService;
    }

    getInstallTypingHost() {
        return this.installTypingHost;
    }

    installWorker(_requestId: number, _args: string[], _cwd: string, cb: ts.server.typingsInstaller.RequestCompletedAction): void {
        this.addPostExecAction("success", cb);
    }

    sendResponse(response: ts.server.SetTypings | ts.server.InvalidateCachedTypings) {
        this.projectService.updateTypingsForProject(response);
    }

    enqueueInstallTypingsRequest(project: ts.server.Project, typeAcquisition: ts.TypeAcquisition, unresolvedImports: ts.SortedReadonlyArray<string>) {
        const request = ts.server.createInstallTypingsRequest(project, typeAcquisition, unresolvedImports, this.globalTypingsCacheLocation);
        this.install(request);
    }

    addPostExecAction(stdout: string | string[], cb: ts.server.typingsInstaller.RequestCompletedAction) {
        const out = ts.isString(stdout) ? stdout : createNpmPackageJsonString(stdout);
        const action: PostExecAction = {
            success: !!out,
            callback: cb
        };
        this.postExecActions.push(action);
    }
}

function createNpmPackageJsonString(installedTypings: string[]): string {
    const dependencies: ts.MapLike<any> = {};
    for (const typing of installedTypings) {
        dependencies[typing] = "1.0.0";
    }
    return JSON.stringify({ dependencies });
}

export function createTypesRegistry(...list: string[]): Map<string, ts.MapLike<string>> {
    const versionMap = {
        "latest": "1.3.0",
        "ts2.0": "1.0.0",
        "ts2.1": "1.0.0",
        "ts2.2": "1.2.0",
        "ts2.3": "1.3.0",
        "ts2.4": "1.3.0",
        "ts2.5": "1.3.0",
        "ts2.6": "1.3.0",
        "ts2.7": "1.3.0"
    };
    const map = new Map<string, ts.MapLike<string>>();
    for (const l of list) {
        map.set(l, versionMap);
    }
    return map;
}

export function toExternalFile(fileName: string): ts.server.protocol.ExternalFile {
    return { fileName };
}

export function toExternalFiles(fileNames: string[]) {
    return ts.map(fileNames, toExternalFile);
}

export function fileStats(nonZeroStats: Partial<ts.server.FileStats>): ts.server.FileStats {
    return { ts: 0, tsSize: 0, tsx: 0, tsxSize: 0, dts: 0, dtsSize: 0, js: 0, jsSize: 0, jsx: 0, jsxSize: 0, deferred: 0, deferredSize: 0, ...nonZeroStats };
}

export class TestServerEventManager {
    private events: ts.server.ProjectServiceEvent[] = [];
    readonly session: TestSession;
    readonly service: ts.server.ProjectService;
    readonly host: TestServerHost;
    constructor(files: File[], suppressDiagnosticEvents?: boolean) {
        this.host = createServerHost(files);
        this.session = createSession(this.host, {
            canUseEvents: true,
            eventHandler: event => this.events.push(event),
            suppressDiagnosticEvents,
        });
        this.service = this.session.getProjectService();
    }

    getEvents(): readonly ts.server.ProjectServiceEvent[] {
        const events = this.events;
        this.events = [];
        return events;
    }

    getEvent<T extends ts.server.ProjectServiceEvent>(eventName: T["eventName"]): T["data"] {
        let eventData: T["data"] | undefined;
        ts.filterMutate(this.events, e => {
            if (e.eventName === eventName) {
                if (eventData !== undefined) {
                    assert(false, "more than one event found");
                }
                eventData = e.data;
                return false;
            }
            return true;
        });
        return ts.Debug.checkDefined(eventData);
    }

    hasZeroEvent<T extends ts.server.ProjectServiceEvent>(eventName: T["eventName"]) {
        this.events.forEach(event => assert.notEqual(event.eventName, eventName));
    }

    assertProjectInfoTelemetryEvent(partial: Partial<ts.server.ProjectInfoTelemetryEventData>, configFile = "/tsconfig.json"): void {
        assert.deepEqual<ts.server.ProjectInfoTelemetryEventData>(this.getEvent<ts.server.ProjectInfoTelemetryEvent>(ts.server.ProjectInfoTelemetryEvent), {
            projectId: ts.sys.createSHA256Hash!(configFile),
            fileStats: fileStats({ ts: 1 }),
            compilerOptions: {},
            extends: false,
            files: false,
            include: false,
            exclude: false,
            compileOnSave: false,
            typeAcquisition: {
                enable: false,
                exclude: false,
                include: false,
            },
            configFileName: "tsconfig.json",
            projectType: "configured",
            languageServiceEnabled: true,
            version: ts.version,
            ...partial,
        });
    }

    assertOpenFileTelemetryEvent(info: ts.server.OpenFileInfo): void {
        assert.deepEqual<ts.server.OpenFileInfoTelemetryEventData>(this.getEvent<ts.server.OpenFileInfoTelemetryEvent>(ts.server.OpenFileInfoTelemetryEvent), { info });
    }
    assertNoOpenFilesTelemetryEvent(): void {
        this.hasZeroEvent<ts.server.OpenFileInfoTelemetryEvent>(ts.server.OpenFileInfoTelemetryEvent);
    }
}

export type TestSessionAndServiceHost = TestServerHostTrackingWrittenFiles & {
    baselineHost(title: string): void;
};
function patchHostTimeouts(
    inputHost: TestServerHostTrackingWrittenFiles,
    session: TestSession | TestProjectService
) {
    const host = inputHost as TestSessionAndServiceHost;
    const originalCheckTimeoutQueueLength = host.checkTimeoutQueueLength;
    const originalRunQueuedTimeoutCallbacks = host.runQueuedTimeoutCallbacks;
    const originalRunQueuedImmediateCallbacks = host.runQueuedImmediateCallbacks;
    let hostDiff: ReturnType<TestServerHost["snap"]> | undefined;

    host.checkTimeoutQueueLengthAndRun = checkTimeoutQueueLengthAndRun;
    host.checkTimeoutQueueLength = checkTimeoutQueueLength;
    host.runQueuedTimeoutCallbacks = runQueuedTimeoutCallbacks;
    host.runQueuedImmediateCallbacks = runQueuedImmediateCallbacks;
    host.baselineHost = baselineHost;
    return host;

    function checkTimeoutQueueLengthAndRun(expected: number) {
        host.baselineHost(`Before checking timeout queue length (${expected}) and running`);
        originalCheckTimeoutQueueLength.call(host, expected);
        originalRunQueuedTimeoutCallbacks.call(host);
        host.baselineHost(`After checking timeout queue length (${expected}) and running`);
    }

    function checkTimeoutQueueLength(expected: number) {
        host.baselineHost(`Checking timeout queue length: ${expected}`);
        originalCheckTimeoutQueueLength.call(host, expected);
    }

    function runQueuedTimeoutCallbacks(timeoutId?: number) {
        host.baselineHost(`Before running timeout callback${timeoutId === undefined ? "s" : timeoutId}`);
        originalRunQueuedTimeoutCallbacks.call(host, timeoutId);
        host.baselineHost(`After running timeout callback${timeoutId === undefined ? "s" : timeoutId}`);
    }

    function runQueuedImmediateCallbacks(checkCount?: number) {
        host.baselineHost(`Before running immediate callbacks${checkCount === undefined ? "" : ` and checking length (${checkCount})`}`);
        originalRunQueuedImmediateCallbacks.call(host, checkCount);
        host.baselineHost(`Before running immediate callbacks${checkCount === undefined ? "" : ` and checking length (${checkCount})`}`);
    }

    function baselineHost(title: string) {
        if (!session.logger.hasLevel(ts.server.LogLevel.verbose)) return;
        session.logger.logs.push(title);
        host.diff(session.logger.logs, hostDiff);
        host.serializeWatches(session.logger.logs);
        hostDiff = host.snap();
        host.writtenFiles.clear();
    }
}

export interface TestSessionOptions extends ts.server.SessionOptions {
    logger: Logger;
}

export type TestSessionRequest<T extends ts.server.protocol.Request> = Pick<T, "command" | "arguments">;
export class TestSession extends ts.server.Session {
    private seq = 0;
    public events: ts.server.protocol.Event[] = [];
    public testhost: TestSessionAndServiceHost;
    public override logger: Logger;

    constructor(opts: TestSessionOptions) {
        super(opts);
        this.logger = opts.logger;
        this.testhost = patchHostTimeouts(
            changeToHostTrackingWrittenFiles(this.host as TestServerHost),
            this
        );
    }

    getProjectService() {
        return this.projectService;
    }

    public getSeq() {
        return this.seq;
    }

    public getNextSeq() {
        return this.seq + 1;
    }

    public override executeCommand(request: ts.server.protocol.Request) {
        return this.baseline("response", super.executeCommand(this.baseline("request", request)));
    }

    public executeCommandSeq<T extends ts.server.protocol.Request>(inputRequest: TestSessionRequest<T>) {
        this.seq++;
        const request: T = inputRequest as T;
        request.seq = this.seq;
        request.type = "request";
        return this.executeCommand(request);
    }

    public override event<T extends object>(body: T, eventName: string) {
        this.events.push(ts.server.toEvent(eventName, body));
        super.event(body, eventName);
    }

    public clearMessages() {
        ts.clear(this.events);
        this.testhost.clearOutput();
    }

    private baseline<T extends ts.server.protocol.Request | ts.server.HandlerResponse>(type: "request" | "response", requestOrResult: T): T {
        if (!this.logger.hasLevel(ts.server.LogLevel.verbose)) return requestOrResult;
        if (type === "request") this.logger.info(`request:${ts.server.indent(JSON.stringify(requestOrResult, undefined, 2))}`);
        this.testhost.baselineHost(type === "request" ? "Before request" : "After request");
        if (type === "response") this.logger.info(`response:${ts.server.indent(JSON.stringify(requestOrResult, undefined, 2))}`);
        return requestOrResult;
    }
}

export function createSession(host: ts.server.ServerHost, opts: Partial<TestSessionOptions> = {}) {
    if (opts.typingsInstaller === undefined) {
        opts.typingsInstaller = new TestTypingsInstaller("/a/data/", /*throttleLimit*/ 5, host);
    }

    if (opts.eventHandler !== undefined) {
        opts.canUseEvents = true;
    }

    const sessionOptions: TestSessionOptions = {
        host,
        cancellationToken: ts.server.nullCancellationToken,
        useSingleInferredProject: false,
        useInferredProjectPerProjectRoot: false,
        typingsInstaller: undefined!, // TODO: GH#18217
        byteLength: Buffer.byteLength,
        hrtime: process.hrtime,
        logger: opts.logger || createHasErrorMessageLogger(),
        canUseEvents: false
    };

    return new TestSession({ ...sessionOptions, ...opts });
}

export function createSessionWithEventTracking<T extends ts.server.ProjectServiceEvent>(host: ts.server.ServerHost, eventNames: T["eventName"] | T["eventName"][], opts: Partial<TestSessionOptions> = {}) {
    const events: T[] = [];
    const session = createSession(host, {
        eventHandler: e => {
            if (ts.isArray(eventNames) ? eventNames.some(eventName => e.eventName === eventName) : eventNames === e.eventName) {
                events.push(e as T);
            }
        },
        ...opts
    });

    return { session, events };
}

export function createSessionWithDefaultEventHandler<T extends ts.server.protocol.AnyEvent>(host: TestServerHost, eventNames: T["event"] | T["event"][], opts: Partial<TestSessionOptions> = {}) {
    const session = createSession(host, { canUseEvents: true, ...opts });

    return {
        session,
        getEvents,
        clearEvents
    };

    function getEvents() {
        return ts.mapDefined(host.getOutput(), s => {
            const e = mapOutputToJson(s);
            return (ts.isArray(eventNames) ? eventNames.some(eventName => e.event === eventName) : e.event === eventNames) ? e as T : undefined;
        });
    }

    function clearEvents() {
        session.clearMessages();
    }
}

export interface TestProjectServiceOptions extends ts.server.ProjectServiceOptions {
    logger: Logger;
}

export class TestProjectService extends ts.server.ProjectService {
    public testhost: TestSessionAndServiceHost;
    constructor(host: TestServerHost, public override logger: Logger, cancellationToken: ts.HostCancellationToken, useSingleInferredProject: boolean,
        typingsInstaller: ts.server.ITypingsInstaller, opts: Partial<TestProjectServiceOptions> = {}) {
        super({
            host,
            logger,
            session: undefined,
            cancellationToken,
            useSingleInferredProject,
            useInferredProjectPerProjectRoot: false,
            typingsInstaller,
            typesMapLocation: customTypesMap.path,
            ...opts
        });
        this.testhost = patchHostTimeouts(
            changeToHostTrackingWrittenFiles(this.host as TestServerHost),
            this
        );
        this.testhost.baselineHost("Creating project service");
    }

    checkNumberOfProjects(count: { inferredProjects?: number, configuredProjects?: number, externalProjects?: number }) {
        checkNumberOfProjects(this, count);
    }
}

export function createProjectService(host: TestServerHost, options?: Partial<TestProjectServiceOptions>) {
    const cancellationToken = options?.cancellationToken || ts.server.nullCancellationToken;
    const logger = options?.logger || createHasErrorMessageLogger();
    const useSingleInferredProject = options?.useSingleInferredProject !== undefined ? options.useSingleInferredProject : false;
    return new TestProjectService(host, logger, cancellationToken, useSingleInferredProject, options?.typingsInstaller || ts.server.nullTypingsInstaller, options);
}

export function checkNumberOfConfiguredProjects(projectService: ts.server.ProjectService, expected: number) {
    assert.equal(projectService.configuredProjects.size, expected, `expected ${expected} configured project(s)`);
}

export function checkNumberOfExternalProjects(projectService: ts.server.ProjectService, expected: number) {
    assert.equal(projectService.externalProjects.length, expected, `expected ${expected} external project(s)`);
}

export function checkNumberOfInferredProjects(projectService: ts.server.ProjectService, expected: number) {
    assert.equal(projectService.inferredProjects.length, expected, `expected ${expected} inferred project(s)`);
}

export function checkNumberOfProjects(projectService: ts.server.ProjectService, count: { inferredProjects?: number, configuredProjects?: number, externalProjects?: number }) {
    checkNumberOfConfiguredProjects(projectService, count.configuredProjects || 0);
    checkNumberOfExternalProjects(projectService, count.externalProjects || 0);
    checkNumberOfInferredProjects(projectService, count.inferredProjects || 0);
}

export function configuredProjectAt(projectService: ts.server.ProjectService, index: number) {
    const values = projectService.configuredProjects.values();
    while (index > 0) {
        const iterResult = values.next();
        if (iterResult.done) return ts.Debug.fail("Expected a result.");
        index--;
    }
    const iterResult = values.next();
    if (iterResult.done) return ts.Debug.fail("Expected a result.");
    return iterResult.value;
}

function checkArray(caption: string, actual: readonly string[], expected: readonly string[]) {
    const actualSet = new Set(actual);
    let notInActual: string[] | undefined;
    let duplicates: string[] | undefined;
    const seen = new Set<string>();
    expected.forEach(expectedKey => {
        if (seen.has(expectedKey)) (duplicates ??= []).push(expectedKey);
        else {
            seen.add(expectedKey);
            if (!actualSet.has(expectedKey)) (notInActual ??= []).push(expectedKey);
        }
    });
    let inActualNotExpected: string[] | undefined;
    actual.forEach(key => {
        if (!seen.has(key)) (inActualNotExpected ??= []).push(key);
        else seen.add(key);
    });
    if (notInActual || duplicates || inActualNotExpected) {
        assert.fail(`${caption}\n\nNotInActual: ${notInActual}\nDuplicates: ${duplicates}\nInActualButNotInExpected: ${inActualNotExpected}`);
    }
}

export function checkProjectActualFiles(project: ts.server.Project, expectedFiles: readonly string[]) {
    checkArray(`${ts.server.ProjectKind[project.projectKind]} project: ${project.getProjectName()}:: actual files`, project.getFileNames(), expectedFiles);
}

export function checkProjectRootFiles(project: ts.server.Project, expectedFiles: readonly string[]) {
    checkArray(`${ts.server.ProjectKind[project.projectKind]} project: ${project.getProjectName()}::, rootFileNames`, project.getRootFiles(), expectedFiles);
}

export function protocolLocationFromSubstring(str: string, substring: string, options?: SpanFromSubstringOptions): ts.server.protocol.Location {
    const start = nthIndexOf(str, substring, options ? options.index : 0);
    ts.Debug.assert(start !== -1);
    return protocolToLocation(str)(start);
}

export function protocolToLocation(text: string): (pos: number) => ts.server.protocol.Location {
    const lineStarts = ts.computeLineStarts(text);
    return pos => {
        const x = ts.computeLineAndCharacterOfPosition(lineStarts, pos);
        return { line: x.line + 1, offset: x.character + 1 };
    };
}

export function protocolTextSpanFromSubstring(str: string, substring: string, options?: SpanFromSubstringOptions): ts.server.protocol.TextSpan {
    const span = textSpanFromSubstring(str, substring, options);
    const toLocation = protocolToLocation(str);
    return { start: toLocation(span.start), end: toLocation(ts.textSpanEnd(span)) };
}

export interface DocumentSpanFromSubstring {
    file: File;
    text: string;
    options?: SpanFromSubstringOptions;
    contextText?: string;
    contextOptions?: SpanFromSubstringOptions;
}

export interface ProtocolTextSpanWithContextFromString {
    fileText: string;
    text: string;
    options?: SpanFromSubstringOptions;
    contextText?: string;
    contextOptions?: SpanFromSubstringOptions;
}
export function protocolTextSpanWithContextFromSubstring({ fileText, text, options, contextText, contextOptions }: ProtocolTextSpanWithContextFromString): ts.server.protocol.TextSpanWithContext {
    const span = textSpanFromSubstring(fileText, text, options);
    const toLocation = protocolToLocation(fileText);
    const contextSpan = contextText !== undefined ? textSpanFromSubstring(fileText, contextText, contextOptions) : undefined;
    return {
        start: toLocation(span.start),
        end: toLocation(ts.textSpanEnd(span)),
        ...contextSpan && {
            contextStart: toLocation(contextSpan.start),
            contextEnd: toLocation(ts.textSpanEnd(contextSpan))
        }
    };
}

export interface ProtocolRenameSpanFromSubstring extends ProtocolTextSpanWithContextFromString {
    prefixSuffixText?: {
        readonly prefixText?: string;
        readonly suffixText?: string;
    };
}

export function textSpanFromSubstring(str: string, substring: string, options?: SpanFromSubstringOptions): ts.TextSpan {
    const start = nthIndexOf(str, substring, options ? options.index : 0);
    ts.Debug.assert(start !== -1);
    return ts.createTextSpan(start, substring.length);
}

export function protocolFileLocationFromSubstring(file: File, substring: string, options?: SpanFromSubstringOptions): ts.server.protocol.FileLocationRequestArgs {
    return { file: file.path, ...protocolLocationFromSubstring(file.content, substring, options) };
}

export interface SpanFromSubstringOptions {
    readonly index: number;
}

function nthIndexOf(str: string, substr: string, n: number): number {
    let index = -1;
    for (; n >= 0; n--) {
        index = str.indexOf(substr, index + 1);
        if (index === -1) return -1;
    }
    return index;
}

/**
 * Test server cancellation token used to mock host token cancellation requests.
 * The cancelAfterRequest constructor param specifies how many isCancellationRequested() calls
 * should be made before canceling the token. The id of the request to cancel should be set with
 * setRequestToCancel();
 */
export class TestServerCancellationToken implements ts.server.ServerCancellationToken {
    private currentId: number | undefined = -1;
    private requestToCancel = -1;
    private isCancellationRequestedCount = 0;

    constructor(private cancelAfterRequest = 0) {
    }

    setRequest(requestId: number) {
        this.currentId = requestId;
    }

    setRequestToCancel(requestId: number) {
        this.resetToken();
        this.requestToCancel = requestId;
    }

    resetRequest(requestId: number) {
        assert.equal(requestId, this.currentId, "unexpected request id in cancellation");
        this.currentId = undefined;
    }

    isCancellationRequested() {
        this.isCancellationRequestedCount++;
        // If the request id is the request to cancel and isCancellationRequestedCount
        // has been met then cancel the request. Ex: cancel the request if it is a
        // nav bar request & isCancellationRequested() has already been called three times.
        return this.requestToCancel === this.currentId && this.isCancellationRequestedCount >= this.cancelAfterRequest;
    }

    resetToken() {
        this.currentId = -1;
        this.isCancellationRequestedCount = 0;
        this.requestToCancel = -1;
    }
}

export function openFilesForSession(files: readonly (string | File | { readonly file: File | string, readonly projectRootPath: string, content?: string })[], session: TestSession): void {
    for (const file of files) {
        session.executeCommandSeq<ts.server.protocol.OpenRequest>({
            command: ts.server.protocol.CommandTypes.Open,
            arguments: ts.isString(file) ?
                { file } :
                "projectRootPath" in file ? // eslint-disable-line local/no-in-operator
                    {
                        file: typeof file.file === "string" ? file.file : file.file.path,
                        projectRootPath: file.projectRootPath
                    } :
                    { file: file.path }
        });
    }
}

export function closeFilesForSession(files: readonly File[], session: TestSession): void {
    for (const file of files) {
        session.executeCommandSeq<ts.server.protocol.CloseRequest>({
            command: ts.server.protocol.CommandTypes.Close,
            arguments: { file: file.path }
        });
    }
}

export interface VerifyGetErrRequestBase {
    session: TestSession;
    host: TestServerHost;
    existingTimeouts?: number;
}
export interface VerifyGetErrRequest extends VerifyGetErrRequestBase {
    files: readonly (string | File)[];
    skip?: CheckAllErrors["skip"];
}
export function verifyGetErrRequest(request: VerifyGetErrRequest) {
    const { session, files } = request;
    session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
        command: ts.server.protocol.CommandTypes.Geterr,
        arguments: { delay: 0, files: files.map(filePath) }
    });
    checkAllErrors(request);
}

interface SkipErrors { semantic?: true; suggestion?: true }
export interface CheckAllErrors extends VerifyGetErrRequestBase {
    files: readonly any[];
    skip?: readonly (SkipErrors | undefined)[];
}
function checkAllErrors({ session, host, existingTimeouts, files, skip }: CheckAllErrors) {
    ts.Debug.assert(session.logger.logs.length);
    for (let i = 0; i < files.length; i++) {
        if (existingTimeouts !== undefined) {
            host.checkTimeoutQueueLength(existingTimeouts + 1);
            host.runQueuedTimeoutCallbacks(host.getNextTimeoutId() - 1);
        }
        else {
            host.checkTimeoutQueueLengthAndRun(1);
        }
        if (!skip?.[i]?.semantic) host.runQueuedImmediateCallbacks(1);
        if (!skip?.[i]?.suggestion) host.runQueuedImmediateCallbacks(1);
    }
}

function filePath(file: string | File) {
    return ts.isString(file) ? file : file.path;
}

function verifyErrorsUsingGeterr({scenario, subScenario, allFiles, openFiles, getErrRequest }: VerifyGetErrScenario) {
    it("verifies the errors in open file", () => {
        const host = createServerHost([...allFiles(), libFile]);
        const session = createSession(host, { canUseEvents: true, logger: createLoggerWithInMemoryLogs(host) });
        openFilesForSession(openFiles(), session);

        verifyGetErrRequest({ session, host, files: getErrRequest() });
        baselineTsserverLogs(scenario, `${subScenario} getErr`, session);
    });
}

function verifyErrorsUsingGeterrForProject({ scenario, subScenario, allFiles, openFiles, getErrForProjectRequest }: VerifyGetErrScenario) {
    it("verifies the errors in projects", () => {
        const host = createServerHost([...allFiles(), libFile]);
        const session = createSession(host, { canUseEvents: true, logger: createLoggerWithInMemoryLogs(host) });
        openFilesForSession(openFiles(), session);

        for (const expected of getErrForProjectRequest()) {
            session.executeCommandSeq<ts.server.protocol.GeterrForProjectRequest>({
                command: ts.server.protocol.CommandTypes.GeterrForProject,
                arguments: { delay: 0, file: filePath(expected.project) }
            });
            checkAllErrors({ session, host, files: expected.files });
        }
        baselineTsserverLogs(scenario, `${subScenario} geterrForProject`, session);
    });
}

function verifyErrorsUsingSyncMethods({ scenario, subScenario, allFiles, openFiles, syncDiagnostics }: VerifyGetErrScenario) {
    it("verifies the errors using sync commands", () => {
        const host = createServerHost([...allFiles(), libFile]);
        const session = createSession(host, { logger: createLoggerWithInMemoryLogs(host) });
        openFilesForSession(openFiles(), session);
        for (const { file, project } of syncDiagnostics()) {
            const reqArgs = { file: filePath(file), projectFileName: project && filePath(project) };
            session.executeCommandSeq<ts.server.protocol.SyntacticDiagnosticsSyncRequest>({
                command: ts.server.protocol.CommandTypes.SyntacticDiagnosticsSync,
                arguments: reqArgs
            });
            session.executeCommandSeq<ts.server.protocol.SemanticDiagnosticsSyncRequest>({
                command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                arguments: reqArgs
            });
            session.executeCommandSeq<ts.server.protocol.SuggestionDiagnosticsSyncRequest>({
                command: ts.server.protocol.CommandTypes.SuggestionDiagnosticsSync,
                arguments: reqArgs
            });
        }
        baselineTsserverLogs(scenario, `${subScenario} gerErr with sync commands`, session);
    });
}

export interface GetErrForProjectDiagnostics {
    project: string | File;
    files: readonly (string | File)[];
    skip?: CheckAllErrors["skip"];
}
export interface SyncDiagnostics {
    file: string | File;
    project?: string | File;
}
export interface VerifyGetErrScenario {
    scenario: string;
    subScenario: string;
    allFiles: () => readonly File[];
    openFiles: () => readonly File[];
    getErrRequest: () => VerifyGetErrRequest["files"];
    getErrForProjectRequest: () => readonly GetErrForProjectDiagnostics[];
    syncDiagnostics: () => readonly SyncDiagnostics[];
}
export function verifyGetErrScenario(scenario: VerifyGetErrScenario) {
    verifyErrorsUsingGeterr(scenario);
    verifyErrorsUsingGeterrForProject(scenario);
    verifyErrorsUsingSyncMethods(scenario);
}

export function verifyDynamic(service: ts.server.ProjectService, path: string) {
    const info = ts.Debug.checkDefined(service.filenameToScriptInfo.get(path), `Expected ${path} in :: ${JSON.stringify(ts.arrayFrom(service.filenameToScriptInfo.entries(), ([key, f]) => ({ key, fileName: f.fileName, path: f.path })))}`);
    assert.isTrue(info.isDynamic);
}

export function createHostWithSolutionBuild(files: readonly FileOrFolderOrSymLink[], rootNames: readonly string[]) {
    const host = createServerHost(files);
    // ts build should succeed
    ensureErrorFreeBuild(host, rootNames);
    return host;
}
