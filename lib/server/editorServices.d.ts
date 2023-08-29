import { CachedDirectoryStructureHost, CompilerOptions, ConfigFileProgramReloadLevel, Diagnostic, DirectoryStructureHost, DocumentPosition, DocumentPositionMapper, DocumentRegistry, DocumentRegistryBucketKeyWithMode, FileExtensionInfo, FileWatcher, FormatCodeSettings, HostCancellationToken, IncompleteCompletionsCache, LanguageServiceMode, MultiMap, PackageJsonAutoImportPreference, ParsedCommandLine, Path, PerformanceEvent, PluginImport, ProjectPackageJsonInfo, ReadonlyCollection, ScriptKind, SourceFile, SourceFileLike, TextChange, TsConfigSourceFile, TypeAcquisition, UserPreferences, WatchFactory, WatchOptions, WatchType, WildcardDirectoryWatcher } from "./_namespaces/ts";
import { AutoImportProviderProject, BeginInstallTypes, ConfiguredProject, EndInstallTypes, ExternalProject, InferredProject, InvalidateCachedTypings, ITypingsInstaller, Logger, NormalizedPath, PackageInstalledResponse, PackageJsonCache, Project, ProjectFilesWithTSDiagnostics, ScriptInfo, ServerHost, Session, SetTypings, ThrottledOperations, TypingsCache } from "./_namespaces/ts.server";
import * as protocol from "./protocol";
export declare const maxProgramSizeForNonTsFiles: number;
/** @internal */
export declare const maxFileSize: number;
export declare const ProjectsUpdatedInBackgroundEvent = "projectsUpdatedInBackground";
export declare const ProjectLoadingStartEvent = "projectLoadingStart";
export declare const ProjectLoadingFinishEvent = "projectLoadingFinish";
export declare const LargeFileReferencedEvent = "largeFileReferenced";
export declare const ConfigFileDiagEvent = "configFileDiag";
export declare const ProjectLanguageServiceStateEvent = "projectLanguageServiceState";
export declare const ProjectInfoTelemetryEvent = "projectInfo";
export declare const OpenFileInfoTelemetryEvent = "openFileInfo";
export interface ProjectsUpdatedInBackgroundEvent {
    eventName: typeof ProjectsUpdatedInBackgroundEvent;
    data: {
        openFiles: string[];
    };
}
export interface ProjectLoadingStartEvent {
    eventName: typeof ProjectLoadingStartEvent;
    data: {
        project: Project;
        reason: string;
    };
}
export interface ProjectLoadingFinishEvent {
    eventName: typeof ProjectLoadingFinishEvent;
    data: {
        project: Project;
    };
}
export interface LargeFileReferencedEvent {
    eventName: typeof LargeFileReferencedEvent;
    data: {
        file: string;
        fileSize: number;
        maxFileSize: number;
    };
}
export interface ConfigFileDiagEvent {
    eventName: typeof ConfigFileDiagEvent;
    data: {
        triggerFile: string;
        configFileName: string;
        diagnostics: readonly Diagnostic[];
    };
}
export interface ProjectLanguageServiceStateEvent {
    eventName: typeof ProjectLanguageServiceStateEvent;
    data: {
        project: Project;
        languageServiceEnabled: boolean;
    };
}
/** This will be converted to the payload of a protocol.TelemetryEvent in session.defaultEventHandler. */
export interface ProjectInfoTelemetryEvent {
    readonly eventName: typeof ProjectInfoTelemetryEvent;
    readonly data: ProjectInfoTelemetryEventData;
}
export interface ProjectInfoTelemetryEventData {
    /** Cryptographically secure hash of project file location. */
    readonly projectId: string;
    /** Count of file extensions seen in the project. */
    readonly fileStats: FileStats;
    /**
     * Any compiler options that might contain paths will be taken out.
     * Enum compiler options will be converted to strings.
     */
    readonly compilerOptions: CompilerOptions;
    readonly extends: boolean | undefined;
    readonly files: boolean | undefined;
    readonly include: boolean | undefined;
    readonly exclude: boolean | undefined;
    readonly compileOnSave: boolean;
    readonly typeAcquisition: ProjectInfoTypeAcquisitionData;
    readonly configFileName: "tsconfig.json" | "jsconfig.json" | "other";
    readonly projectType: "external" | "configured";
    readonly languageServiceEnabled: boolean;
    /** TypeScript version used by the server. */
    readonly version: string;
}
/**
 * Info that we may send about a file that was just opened.
 * Info about a file will only be sent once per session, even if the file changes in ways that might affect the info.
 * Currently this is only sent for '.js' files.
 */
export interface OpenFileInfoTelemetryEvent {
    readonly eventName: typeof OpenFileInfoTelemetryEvent;
    readonly data: OpenFileInfoTelemetryEventData;
}
export interface OpenFileInfoTelemetryEventData {
    readonly info: OpenFileInfo;
}
export interface ProjectInfoTypeAcquisitionData {
    readonly enable: boolean | undefined;
    readonly include: boolean;
    readonly exclude: boolean;
}
export interface FileStats {
    readonly js: number;
    readonly jsSize?: number;
    readonly jsx: number;
    readonly jsxSize?: number;
    readonly ts: number;
    readonly tsSize?: number;
    readonly tsx: number;
    readonly tsxSize?: number;
    readonly dts: number;
    readonly dtsSize?: number;
    readonly deferred: number;
    readonly deferredSize?: number;
}
export interface OpenFileInfo {
    readonly checkJs: boolean;
}
export type ProjectServiceEvent = LargeFileReferencedEvent | ProjectsUpdatedInBackgroundEvent | ProjectLoadingStartEvent | ProjectLoadingFinishEvent | ConfigFileDiagEvent | ProjectLanguageServiceStateEvent | ProjectInfoTelemetryEvent | OpenFileInfoTelemetryEvent;
export type ProjectServiceEventHandler = (event: ProjectServiceEvent) => void;
/** @internal */
export type PerformanceEventHandler = (event: PerformanceEvent) => void;
export interface SafeList {
    [name: string]: {
        match: RegExp;
        exclude?: (string | number)[][];
        types?: string[];
    };
}
export interface TypesMapFile {
    typesMap: SafeList;
    simpleMap: {
        [libName: string]: string;
    };
}
export declare function convertFormatOptions(protocolOptions: protocol.FormatCodeSettings): FormatCodeSettings;
export declare function convertCompilerOptions(protocolOptions: protocol.ExternalProjectCompilerOptions): CompilerOptions & protocol.CompileOnSaveMixin;
export declare function convertWatchOptions(protocolOptions: protocol.ExternalProjectCompilerOptions, currentDirectory?: string): WatchOptionsAndErrors | undefined;
export declare function convertTypeAcquisition(protocolOptions: protocol.InferredProjectCompilerOptions): TypeAcquisition | undefined;
export declare function tryConvertScriptKindName(scriptKindName: protocol.ScriptKindName | ScriptKind): ScriptKind;
export declare function convertScriptKindName(scriptKindName: protocol.ScriptKindName): ScriptKind.Unknown | ScriptKind.JS | ScriptKind.JSX | ScriptKind.TS | ScriptKind.TSX;
/** @internal */
export declare function convertUserPreferences(preferences: protocol.UserPreferences): UserPreferences;
export interface HostConfiguration {
    formatCodeOptions: FormatCodeSettings;
    preferences: protocol.UserPreferences;
    hostInfo: string;
    extraFileExtensions?: FileExtensionInfo[];
    watchOptions?: WatchOptions;
}
export interface OpenConfiguredProjectResult {
    configFileName?: NormalizedPath;
    configFileErrors?: readonly Diagnostic[];
}
/** @internal */
export interface ConfigFileExistenceInfo {
    /**
     * Cached value of existence of config file
     * It is true if there is configured project open for this file.
     * It can be either true or false if this is the config file that is being watched by inferred project
     *   to decide when to update the structure so that it knows about updating the project for its files
     *   (config file may include the inferred project files after the change and hence may be wont need to be in inferred project)
     */
    exists: boolean;
    /**
     * openFilesImpactedByConfigFiles is a map of open files that would be impacted by this config file
     *   because these are the paths being looked up for their default configured project location
     * The value in the map is true if the open file is root of the inferred project
     * It is false when the open file that would still be impacted by existence of
     *   this config file but it is not the root of inferred project
     */
    openFilesImpactedByConfigFile?: Map<Path, boolean>;
    /**
     * The file watcher watching the config file because there is open script info that is root of
     * inferred project and will be impacted by change in the status of the config file
     * or
     * Configured project for this config file is open
     * or
     * Configured project references this config file
     */
    watcher?: FileWatcher;
    /**
     * Cached parsed command line and other related information like watched directories etc
     */
    config?: ParsedConfig;
}
export interface ProjectServiceOptions {
    host: ServerHost;
    logger: Logger;
    cancellationToken: HostCancellationToken;
    useSingleInferredProject: boolean;
    useInferredProjectPerProjectRoot: boolean;
    typingsInstaller: ITypingsInstaller;
    eventHandler?: ProjectServiceEventHandler;
    suppressDiagnosticEvents?: boolean;
    throttleWaitMilliseconds?: number;
    globalPlugins?: readonly string[];
    pluginProbeLocations?: readonly string[];
    allowLocalPluginLoads?: boolean;
    typesMapLocation?: string;
    serverMode?: LanguageServiceMode;
    session: Session<unknown> | undefined;
}
/**
 * Kind of operation to perform to get project reference project
 *
 * @internal
 */
export declare enum ProjectReferenceProjectLoadKind {
    /** Find existing project for project reference */
    Find = 0,
    /** Find existing project or create one for the project reference */
    FindCreate = 1,
    /** Find existing project or create and load it for the project reference */
    FindCreateLoad = 2
}
/** @internal */
export declare function forEachResolvedProjectReferenceProject<T>(project: ConfiguredProject, fileName: string | undefined, cb: (child: ConfiguredProject) => T | undefined, projectReferenceProjectLoadKind: ProjectReferenceProjectLoadKind.Find | ProjectReferenceProjectLoadKind.FindCreate): T | undefined;
/** @internal */
export declare function forEachResolvedProjectReferenceProject<T>(project: ConfiguredProject, fileName: string | undefined, cb: (child: ConfiguredProject) => T | undefined, projectReferenceProjectLoadKind: ProjectReferenceProjectLoadKind, reason: string): T | undefined;
/**
 * true if script info is part of project and is not in project because it is referenced from project reference source
 *
 * @internal
 */
export declare function projectContainsInfoDirectly(project: Project, info: ScriptInfo): boolean;
/** @internal */
export declare function updateProjectIfDirty(project: Project): boolean;
/** @internal */
export interface OpenFileArguments {
    fileName: string;
    content?: string;
    scriptKind?: protocol.ScriptKindName | ScriptKind;
    hasMixedContent?: boolean;
    projectRootPath?: string;
}
/** @internal */
export interface ChangeFileArguments {
    fileName: string;
    changes: Iterable<TextChange>;
}
export interface WatchOptionsAndErrors {
    watchOptions: WatchOptions;
    errors: Diagnostic[] | undefined;
}
/** @internal */
export interface ParsedConfig {
    cachedDirectoryStructureHost: CachedDirectoryStructureHost;
    /**
     * The map contains
     *   - true if project is watching config file as well as wild cards
     *   - false if just config file is watched
     */
    projects: Map<NormalizedPath, boolean>;
    parsedCommandLine?: ParsedCommandLine;
    watchedDirectories?: Map<string, WildcardDirectoryWatcher>;
    /**
     * true if watchedDirectories need to be updated as per parsedCommandLine's updated watched directories
     */
    watchedDirectoriesStale?: boolean;
    reloadLevel?: ConfigFileProgramReloadLevel.Partial | ConfigFileProgramReloadLevel.Full;
}
export declare class ProjectService {
    /** @internal */
    readonly typingsCache: TypingsCache;
    /** @internal */
    readonly documentRegistry: DocumentRegistry;
    /**
     * Container of all known scripts
     *
     * @internal
     */
    readonly filenameToScriptInfo: Map<string, ScriptInfo>;
    private readonly nodeModulesWatchers;
    /**
     * Contains all the deleted script info's version information so that
     * it does not reset when creating script info again
     * (and could have potentially collided with version where contents mismatch)
     */
    private readonly filenameToScriptInfoVersion;
    private readonly allJsFilesForOpenFileTelemetry;
    /**
     * Map to the real path of the infos
     *
     * @internal
     */
    readonly realpathToScriptInfos: MultiMap<Path, ScriptInfo> | undefined;
    /**
     * maps external project file name to list of config files that were the part of this project
     */
    private readonly externalProjectToConfiguredProjectMap;
    /**
     * external projects (configuration and list of root files is not controlled by tsserver)
     */
    readonly externalProjects: ExternalProject[];
    /**
     * projects built from openFileRoots
     */
    readonly inferredProjects: InferredProject[];
    /**
     * projects specified by a tsconfig.json file
     */
    readonly configuredProjects: Map<string, ConfiguredProject>;
    /** @internal */
    readonly newInferredProjectName: () => string;
    /** @internal */
    readonly newAutoImportProviderProjectName: () => string;
    /** @internal */
    readonly newAuxiliaryProjectName: () => string;
    /**
     * Open files: with value being project root path, and key being Path of the file that is open
     */
    readonly openFiles: Map<string, NormalizedPath | undefined>;
    /** @internal */
    readonly configFileForOpenFiles: Map<Path, NormalizedPath | false>;
    /**
     * Map of open files that are opened without complete path but have projectRoot as current directory
     */
    private readonly openFilesWithNonRootedDiskPath;
    private compilerOptionsForInferredProjects;
    private compilerOptionsForInferredProjectsPerProjectRoot;
    private watchOptionsForInferredProjects;
    private watchOptionsForInferredProjectsPerProjectRoot;
    private typeAcquisitionForInferredProjects;
    private typeAcquisitionForInferredProjectsPerProjectRoot;
    /**
     * Project size for configured or external projects
     */
    private readonly projectToSizeMap;
    /**
     * This is a map of config file paths existence that doesnt need query to disk
     * - The entry can be present because there is inferred project that needs to watch addition of config file to directory
     *   In this case the exists could be true/false based on config file is present or not
     * - Or it is present if we have configured project open with config file at that location
     *   In this case the exists property is always true
     *
     *
     * @internal
     */
    readonly configFileExistenceInfoCache: Map<NormalizedPath, ConfigFileExistenceInfo>;
    /** @internal */ readonly throttledOperations: ThrottledOperations;
    private readonly hostConfiguration;
    private safelist;
    private readonly legacySafelist;
    private pendingProjectUpdates;
    /** @internal */
    pendingEnsureProjectForOpenFiles: boolean;
    readonly currentDirectory: NormalizedPath;
    readonly toCanonicalFileName: (f: string) => string;
    readonly host: ServerHost;
    readonly logger: Logger;
    readonly cancellationToken: HostCancellationToken;
    readonly useSingleInferredProject: boolean;
    readonly useInferredProjectPerProjectRoot: boolean;
    readonly typingsInstaller: ITypingsInstaller;
    private readonly globalCacheLocationDirectoryPath;
    readonly throttleWaitMilliseconds?: number;
    private readonly eventHandler?;
    private readonly suppressDiagnosticEvents?;
    readonly globalPlugins: readonly string[];
    readonly pluginProbeLocations: readonly string[];
    readonly allowLocalPluginLoads: boolean;
    private currentPluginConfigOverrides;
    readonly typesMapLocation: string | undefined;
    readonly serverMode: LanguageServiceMode;
    /** Tracks projects that we have already sent telemetry for. */
    private readonly seenProjects;
    /** @internal */
    readonly watchFactory: WatchFactory<WatchType, Project | NormalizedPath>;
    /** @internal */
    private readonly sharedExtendedConfigFileWatchers;
    /** @internal */
    private readonly extendedConfigCache;
    /** @internal */
    readonly packageJsonCache: PackageJsonCache;
    /** @internal */
    private packageJsonFilesMap;
    /** @internal */
    private incompleteCompletionsCache;
    /** @internal */
    readonly session: Session<unknown> | undefined;
    private performanceEventHandler?;
    private pendingPluginEnablements?;
    private currentPluginEnablementPromise?;
    constructor(opts: ProjectServiceOptions);
    toPath(fileName: string): Path;
    /** @internal */
    getExecutingFilePath(): string;
    /** @internal */
    getNormalizedAbsolutePath(fileName: string): string;
    /** @internal */
    setDocument(key: DocumentRegistryBucketKeyWithMode, path: Path, sourceFile: SourceFile): void;
    /** @internal */
    getDocument(key: DocumentRegistryBucketKeyWithMode, path: Path): SourceFile | undefined;
    /** @internal */
    ensureInferredProjectsUpToDate_TestOnly(): void;
    /** @internal */
    getCompilerOptionsForInferredProjects(): CompilerOptions | undefined;
    /** @internal */
    onUpdateLanguageServiceStateForProject(project: Project, languageServiceEnabled: boolean): void;
    private loadTypesMap;
    updateTypingsForProject(response: SetTypings | InvalidateCachedTypings | PackageInstalledResponse): void;
    /** @internal */
    updateTypingsForProject(response: SetTypings | InvalidateCachedTypings | PackageInstalledResponse | BeginInstallTypes | EndInstallTypes): void;
    /** @internal */
    delayEnsureProjectForOpenFiles(): void;
    private delayUpdateProjectGraph;
    /** @internal */
    hasPendingProjectUpdate(project: Project): boolean;
    /** @internal */
    sendProjectsUpdatedInBackgroundEvent(): void;
    /** @internal */
    sendLargeFileReferencedEvent(file: string, fileSize: number): void;
    /** @internal */
    sendProjectLoadingStartEvent(project: ConfiguredProject, reason: string): void;
    /** @internal */
    sendProjectLoadingFinishEvent(project: ConfiguredProject): void;
    /** @internal */
    sendPerformanceEvent(kind: PerformanceEvent["kind"], durationMs: number): void;
    /** @internal */
    delayUpdateProjectGraphAndEnsureProjectStructureForOpenFiles(project: Project): void;
    private delayUpdateProjectGraphs;
    setCompilerOptionsForInferredProjects(projectCompilerOptions: protocol.InferredProjectCompilerOptions, projectRootPath?: string): void;
    findProject(projectName: string): Project | undefined;
    /** @internal */
    private forEachProject;
    /** @internal */
    forEachEnabledProject(cb: (project: Project) => void): void;
    getDefaultProjectForFile(fileName: NormalizedPath, ensureProject: boolean): Project | undefined;
    /** @internal */
    tryGetDefaultProjectForFile(fileNameOrScriptInfo: NormalizedPath | ScriptInfo): Project | undefined;
    /** @internal */
    ensureDefaultProjectForFile(fileNameOrScriptInfo: NormalizedPath | ScriptInfo): Project;
    private doEnsureDefaultProjectForFile;
    getScriptInfoEnsuringProjectsUptoDate(uncheckedFileName: string): ScriptInfo | undefined;
    /**
     * Ensures the project structures are upto date
     * This means,
     * - we go through all the projects and update them if they are dirty
     * - if updates reflect some change in structure or there was pending request to ensure projects for open files
     *   ensure that each open script info has project
     */
    private ensureProjectStructuresUptoDate;
    getFormatCodeOptions(file: NormalizedPath): FormatCodeSettings;
    getPreferences(file: NormalizedPath): protocol.UserPreferences;
    getHostFormatCodeOptions(): FormatCodeSettings;
    getHostPreferences(): protocol.UserPreferences;
    private onSourceFileChanged;
    private handleSourceMapProjects;
    private delayUpdateSourceInfoProjects;
    private delayUpdateProjectsOfScriptInfoPath;
    private handleDeletedFile;
    /**
     * This is to watch whenever files are added or removed to the wildcard directories
     *
     * @internal
     */
    private watchWildcardDirectory;
    /** @internal */
    private delayUpdateProjectsFromParsedConfigOnConfigFileChange;
    /** @internal */
    private onConfigFileChanged;
    private removeProject;
    /** @internal */
    assignOrphanScriptInfoToInferredProject(info: ScriptInfo, projectRootPath: NormalizedPath | undefined): InferredProject;
    private assignOrphanScriptInfosToInferredProject;
    /**
     * Remove this file from the set of open, non-configured files.
     * @param info The file that has been closed or newly configured
     */
    private closeOpenFile;
    private deleteScriptInfo;
    private configFileExists;
    /** @internal */
    private createConfigFileWatcherForParsedConfig;
    /**
     * Returns true if the configFileExistenceInfo is needed/impacted by open files that are root of inferred project
     */
    private configFileExistenceImpactsRootOfInferredProject;
    /** @internal */
    releaseParsedConfig(canonicalConfigFilePath: NormalizedPath, forProject: ConfiguredProject): void;
    /**
     * Close the config file watcher in the cached ConfigFileExistenceInfo
     *   if there arent any open files that are root of inferred project and there is no parsed config held by any project
     *
     * @internal
     */
    private closeConfigFileWatcherOnReleaseOfOpenFile;
    /**
     * This is called on file close, so that we stop watching the config file for this script info
     */
    private stopWatchingConfigFilesForClosedScriptInfo;
    /**
     * This is called by inferred project whenever script info is added as a root
     *
     * @internal
     */
    startWatchingConfigFilesForInferredProjectRoot(info: ScriptInfo): void;
    /**
     * This is called by inferred project whenever root script info is removed from it
     *
     * @internal
     */
    stopWatchingConfigFilesForInferredProjectRoot(info: ScriptInfo): void;
    /**
     * This function tries to search for a tsconfig.json for the given file.
     * This is different from the method the compiler uses because
     * the compiler can assume it will always start searching in the
     * current directory (the directory in which tsc was invoked).
     * The server must start searching from the directory containing
     * the newly opened file.
     */
    private forEachConfigFileLocation;
    /** @internal */
    findDefaultConfiguredProject(info: ScriptInfo): ConfiguredProject | undefined;
    /**
     * This function tries to search for a tsconfig.json for the given file.
     * This is different from the method the compiler uses because
     * the compiler can assume it will always start searching in the
     * current directory (the directory in which tsc was invoked).
     * The server must start searching from the directory containing
     * the newly opened file.
     * If script info is passed in, it is asserted to be open script info
     * otherwise just file name
     */
    private getConfigFileNameForFile;
    private printProjects;
    /** @internal */
    findConfiguredProjectByProjectName(configFileName: NormalizedPath): ConfiguredProject | undefined;
    private getConfiguredProjectByCanonicalConfigFilePath;
    private findExternalProjectByProjectName;
    /** Get a filename if the language service exceeds the maximum allowed program size; otherwise returns undefined. */
    private getFilenameForExceededTotalSizeLimitForNonTsFiles;
    private createExternalProject;
    /** @internal */
    sendProjectTelemetry(project: ExternalProject | ConfiguredProject): void;
    private addFilesToNonInferredProject;
    /** @internal */
    createConfiguredProject(configFileName: NormalizedPath): ConfiguredProject;
    /** @internal */
    private createConfiguredProjectWithDelayLoad;
    /** @internal */
    createAndLoadConfiguredProject(configFileName: NormalizedPath, reason: string): ConfiguredProject;
    /** @internal */
    private createLoadAndUpdateConfiguredProject;
    /**
     * Read the config file of the project, and update the project root file names.
     *
     * @internal
     */
    private loadConfiguredProject;
    /** @internal */
    ensureParsedConfigUptoDate(configFilename: NormalizedPath, canonicalConfigFilePath: NormalizedPath, configFileExistenceInfo: ConfigFileExistenceInfo, forProject: ConfiguredProject): ConfigFileExistenceInfo;
    /** @internal */
    watchWildcards(configFileName: NormalizedPath, { exists, config }: ConfigFileExistenceInfo, forProject: ConfiguredProject): void;
    /** @internal */
    stopWatchingWildCards(canonicalConfigFilePath: NormalizedPath, forProject: ConfiguredProject): void;
    private updateNonInferredProjectFiles;
    private updateRootAndOptionsOfNonInferredProject;
    /**
     * Reload the file names from config file specs and update the project graph
     *
     * @internal
     */
    reloadFileNamesOfConfiguredProject(project: ConfiguredProject): boolean;
    /** @internal */
    private reloadFileNamesOfParsedConfig;
    /** @internal */
    setFileNamesOfAutoImportProviderProject(project: AutoImportProviderProject, fileNames: string[]): void;
    /**
     * Read the config file of the project again by clearing the cache and update the project graph
     *
     * @internal
     */
    reloadConfiguredProject(project: ConfiguredProject, reason: string, isInitialLoad: boolean, clearSemanticCache: boolean): void;
    /** @internal */
    private clearSemanticCache;
    private sendConfigFileDiagEvent;
    private getOrCreateInferredProjectForProjectRootPathIfEnabled;
    private getOrCreateSingleInferredProjectIfEnabled;
    private getOrCreateSingleInferredWithoutProjectRoot;
    private createInferredProject;
    /** @internal */
    getOrCreateScriptInfoNotOpenedByClient(uncheckedFileName: string, currentDirectory: string, hostToQueryFileExistsOn: DirectoryStructureHost): ScriptInfo | undefined;
    getScriptInfo(uncheckedFileName: string): ScriptInfo | undefined;
    /** @internal */
    getScriptInfoOrConfig(uncheckedFileName: string): ScriptInfoOrConfig | undefined;
    /** @internal */
    logErrorForScriptInfoNotFound(fileName: string): void;
    /**
     * Returns the projects that contain script info through SymLink
     * Note that this does not return projects in info.containingProjects
     *
     * @internal
     */
    getSymlinkedProjects(info: ScriptInfo): MultiMap<Path, Project> | undefined;
    private watchClosedScriptInfo;
    private createNodeModulesWatcher;
    /** @internal */
    watchPackageJsonsInNodeModules(dir: Path, project: Project): FileWatcher;
    private watchClosedScriptInfoInNodeModules;
    private getModifiedTime;
    private refreshScriptInfo;
    private refreshScriptInfosInDirectory;
    private stopWatchingScriptInfo;
    private getOrCreateScriptInfoNotOpenedByClientForNormalizedPath;
    private getOrCreateScriptInfoOpenedByClientForNormalizedPath;
    getOrCreateScriptInfoForNormalizedPath(fileName: NormalizedPath, openedByClient: boolean, fileContent?: string, scriptKind?: ScriptKind, hasMixedContent?: boolean, hostToQueryFileExistsOn?: {
        fileExists(path: string): boolean;
    }): ScriptInfo | undefined;
    private getOrCreateScriptInfoWorker;
    /**
     * This gets the script info for the normalized path. If the path is not rooted disk path then the open script info with project root context is preferred
     */
    getScriptInfoForNormalizedPath(fileName: NormalizedPath): ScriptInfo | undefined;
    getScriptInfoForPath(fileName: Path): ScriptInfo | undefined;
    /** @internal */
    getDocumentPositionMapper(project: Project, generatedFileName: string, sourceFileName?: string): DocumentPositionMapper | undefined;
    private addSourceInfoToSourceMap;
    private addMissingSourceMapFile;
    /** @internal */
    getSourceFileLike(fileName: string, projectNameOrProject: string | Project, declarationInfo?: ScriptInfo): SourceFileLike | undefined;
    /** @internal */
    setPerformanceEventHandler(performanceEventHandler: PerformanceEventHandler): void;
    setHostConfiguration(args: protocol.ConfigureRequestArguments): void;
    /** @internal */
    getWatchOptions(project: Project): WatchOptions | undefined;
    /** @internal */
    private getWatchOptionsFromProjectWatchOptions;
    closeLog(): void;
    /**
     * This function rebuilds the project for every file opened by the client
     * This does not reload contents of open files from disk. But we could do that if needed
     */
    reloadProjects(): void;
    /**
     * This function goes through all the openFiles and tries to file the config file for them.
     * If the config file is found and it refers to existing project, it reloads it either immediately
     * or schedules it for reload depending on delayReload option
     * If there is no existing project it just opens the configured project for the config file
     * reloadForInfo provides a way to filter out files to reload configured project for
     */
    private reloadConfiguredProjectForFiles;
    /**
     * Remove the root of inferred project if script info is part of another project
     */
    private removeRootOfInferredProjectIfNowPartOfOtherProject;
    /**
     * This function is to update the project structure for every inferred project.
     * It is called on the premise that all the configured projects are
     * up to date.
     * This will go through open files and assign them to inferred project if open file is not part of any other project
     * After that all the inferred project graphs are updated
     */
    private ensureProjectForOpenFiles;
    /**
     * Open file whose contents is managed by the client
     * @param filename is absolute pathname
     * @param fileContent is a known version of the file content that is more up to date than the one on disk
     */
    openClientFile(fileName: string, fileContent?: string, scriptKind?: ScriptKind, projectRootPath?: string): OpenConfiguredProjectResult;
    /** @internal */
    getOriginalLocationEnsuringConfiguredProject(project: Project, location: DocumentPosition): DocumentPosition | undefined;
    /** @internal */
    fileExists(fileName: NormalizedPath): boolean;
    private findExternalProjectContainingOpenScriptInfo;
    private getOrCreateOpenScriptInfo;
    private assignProjectToOpenedScriptInfo;
    private createAncestorProjects;
    /** @internal */
    loadAncestorProjectTree(forProjects?: ReadonlyCollection<string>): void;
    private ensureProjectChildren;
    private cleanupAfterOpeningFile;
    openClientFileWithNormalizedPath(fileName: NormalizedPath, fileContent?: string, scriptKind?: ScriptKind, hasMixedContent?: boolean, projectRootPath?: NormalizedPath): OpenConfiguredProjectResult;
    private removeOrphanConfiguredProjects;
    private removeOrphanScriptInfos;
    private telemetryOnOpenFile;
    /**
     * Close file whose contents is managed by the client
     * @param filename is absolute pathname
     */
    closeClientFile(uncheckedFileName: string): void;
    /** @internal */
    closeClientFile(uncheckedFileName: string, skipAssignOrphanScriptInfosToInferredProject: true): boolean;
    private collectChanges;
    /** @internal */
    synchronizeProjectList(knownProjects: protocol.ProjectVersionInfo[], includeProjectReferenceRedirectInfo?: boolean): ProjectFilesWithTSDiagnostics[];
    /** @internal */
    applyChangesInOpenFiles(openFiles: Iterable<OpenFileArguments> | undefined, changedFiles?: Iterable<ChangeFileArguments>, closedFiles?: string[]): void;
    /** @internal */
    applyChangesToFile(scriptInfo: ScriptInfo, changes: Iterable<TextChange>): void;
    private closeConfiguredProjectReferencedFromExternalProject;
    closeExternalProject(uncheckedFileName: string): void;
    openExternalProjects(projects: protocol.ExternalProject[]): void;
    /** Makes a filename safe to insert in a RegExp */
    private static readonly filenameEscapeRegexp;
    private static escapeFilenameForRegex;
    resetSafeList(): void;
    applySafeList(proj: protocol.ExternalProject): NormalizedPath[];
    openExternalProject(proj: protocol.ExternalProject): void;
    hasDeferredExtension(): boolean;
    /** @internal */
    requestEnablePlugin(project: Project, pluginConfigEntry: PluginImport, searchPaths: string[], pluginConfigOverrides: Map<string, any> | undefined): void;
    /** @internal */
    hasNewPluginEnablementRequests(): boolean;
    /** @internal */
    hasPendingPluginEnablements(): boolean;
    /**
     * Waits for any ongoing plugin enablement requests to complete.
     *
     * @internal
     */
    waitForPendingPlugins(): Promise<void>;
    /**
     * Starts enabling any requested plugins without waiting for the result.
     *
     * @internal
     */
    enableRequestedPlugins(): void;
    private enableRequestedPluginsAsync;
    private enableRequestedPluginsWorker;
    private enableRequestedPluginsForProjectAsync;
    configurePlugin(args: protocol.ConfigurePluginRequestArguments): void;
    /** @internal */
    getPackageJsonsVisibleToFile(fileName: string, rootDir?: string): readonly ProjectPackageJsonInfo[];
    /** @internal */
    getNearestAncestorDirectoryWithPackageJson(fileName: string): string | undefined;
    /** @internal */
    private watchPackageJsonFile;
    /** @internal */
    private onAddPackageJson;
    /** @internal */
    includePackageJsonAutoImports(): PackageJsonAutoImportPreference;
    /** @internal */
    private invalidateProjectPackageJson;
    /** @internal */
    getIncompleteCompletionsCache(): IncompleteCompletionsCache;
}
/** @internal */
export type ScriptInfoOrConfig = ScriptInfo | TsConfigSourceFile;
/** @internal */
export declare function isConfigFile(config: ScriptInfoOrConfig): config is TsConfigSourceFile;
//# sourceMappingURL=editorServices.d.ts.map