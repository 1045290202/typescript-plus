import * as ts from "./_namespaces/ts";
import { ApplyCodeActionCommandResult, CachedDirectoryStructureHost, CompilerHost, CompilerOptions, ConfigFileProgramReloadLevel, Diagnostic, DirectoryStructureHost, DirectoryWatcherCallback, DocumentPositionMapper, DocumentRegistry, FileReference, FileWatcherCallback, GetCanonicalFileName, HasInvalidatedResolutions, HostCancellationToken, InstallPackageOptions, IScriptSnapshot, JsTyping, LanguageService, LanguageServiceHost, ModuleResolutionCache, ModuleResolutionHost, PackageJsonAutoImportPreference, ParsedCommandLine, Path, PerformanceEvent, PluginImport, Program, ProjectPackageJsonInfo, ProjectReference, ResolutionCache, ResolvedModuleWithFailedLookupLocations, ResolvedProjectReference, ResolvedTypeReferenceDirectiveWithFailedLookupLocations, SortedReadonlyArray, SourceFile, SourceMapper, StringLiteralLike, SymlinkCache, TypeAcquisition, WatchDirectoryFlags, WatchOptions } from "./_namespaces/ts";
import { FileStats, NormalizedPath, ProjectOptions, ProjectService, ScriptInfo, ServerHost, Session } from "./_namespaces/ts.server";
import * as protocol from "./protocol";
export declare enum ProjectKind {
    Inferred = 0,
    Configured = 1,
    External = 2,
    AutoImportProvider = 3,
    Auxiliary = 4
}
/** @internal */
export type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
/** @internal */
export declare function countEachFileTypes(infos: ScriptInfo[], includeSizes?: boolean): FileStats;
export declare function allRootFilesAreJsOrDts(project: Project): boolean;
export declare function allFilesAreJsOrDts(project: Project): boolean;
/** @internal */
export declare function hasNoTypeScriptSource(fileNames: string[]): boolean;
/** @internal */
export interface ProjectFilesWithTSDiagnostics extends protocol.ProjectFiles {
    projectErrors: readonly Diagnostic[];
}
export interface PluginCreateInfo {
    project: Project;
    languageService: LanguageService;
    languageServiceHost: LanguageServiceHost;
    serverHost: ServerHost;
    session?: Session<unknown>;
    config: any;
}
export interface PluginModule {
    create(createInfo: PluginCreateInfo): LanguageService;
    getExternalFiles?(proj: Project): string[];
    onConfigurationChanged?(config: any): void;
}
export interface PluginModuleWithName {
    name: string;
    module: PluginModule;
}
export type PluginModuleFactory = (mod: {
    typescript: typeof ts;
}) => PluginModule;
/** @internal */
export interface BeginEnablePluginResult {
    pluginConfigEntry: PluginImport;
    pluginConfigOverrides: Map<string, any> | undefined;
    resolvedModule: PluginModuleFactory | undefined;
    errorLogs: string[] | undefined;
}
/**
 * The project root can be script info - if root is present,
 * or it could be just normalized path if root wasn't present on the host(only for non inferred project)
 *
 * @internal
 */
export interface ProjectRootFile {
    fileName: NormalizedPath;
    info?: ScriptInfo;
}
/** @internal */
export interface EmitResult {
    emitSkipped: boolean;
    diagnostics: readonly Diagnostic[];
}
export declare abstract class Project implements LanguageServiceHost, ModuleResolutionHost {
    readonly projectKind: ProjectKind;
    readonly projectService: ProjectService;
    private documentRegistry;
    private compilerOptions;
    compileOnSaveEnabled: boolean;
    protected watchOptions: WatchOptions | undefined;
    private rootFiles;
    private rootFilesMap;
    private program;
    private externalFiles;
    private missingFilesMap;
    private generatedFilesMap;
    /** @internal */
    protected readonly plugins: PluginModuleWithName[];
    /**
     * This is map from files to unresolved imports in it
     * Maop does not contain entries for files that do not have unresolved imports
     * This helps in containing the set of files to invalidate
     *
     * @internal
     */
    cachedUnresolvedImportsPerFile: Map<ts.Path, readonly string[]>;
    /** @internal */
    lastCachedUnresolvedImportsList: SortedReadonlyArray<string> | undefined;
    /** @internal */
    private hasAddedorRemovedFiles;
    /** @internal */
    private hasAddedOrRemovedSymlinks;
    /** @internal */
    lastFileExceededProgramSize: string | undefined;
    protected languageService: LanguageService;
    languageServiceEnabled: boolean;
    readonly trace?: (s: string) => void;
    readonly realpath?: (path: string) => string;
    /** @internal */
    hasInvalidatedResolutions: HasInvalidatedResolutions | undefined;
    /** @internal */
    resolutionCache: ResolutionCache;
    private builderState;
    /**
     * Set of files names that were updated since the last call to getChangesSinceVersion.
     */
    private updatedFileNames;
    /**
     * Set of files that was returned from the last call to getChangesSinceVersion.
     */
    private lastReportedFileNames;
    /**
     * Last version that was reported.
     */
    private lastReportedVersion;
    /**
     * Current project's program version. (incremented everytime new program is created that is not complete reuse from the old one)
     * This property is changed in 'updateGraph' based on the set of files in program
     */
    private projectProgramVersion;
    /**
     * Current version of the project state. It is changed when:
     * - new root file was added/removed
     * - edit happen in some file that is currently included in the project.
     * This property is different from projectStructureVersion since in most cases edits don't affect set of files in the project
     */
    private projectStateVersion;
    protected projectErrors: Diagnostic[] | undefined;
    protected isInitialLoadPending: () => boolean;
    /** @internal */
    dirty: boolean;
    /** @internal */
    typingFiles: SortedReadonlyArray<string>;
    /** @internal */
    originalConfiguredProjects: Set<NormalizedPath> | undefined;
    /** @internal */
    private packageJsonsForAutoImport;
    /** @internal */
    private noDtsResolutionProject?;
    /** @internal */
    getResolvedProjectReferenceToRedirect(_fileName: string): ResolvedProjectReference | undefined;
    /** @internal */ useSourceOfProjectReferenceRedirect?(): boolean;
    /** @internal */ getParsedCommandLine?(fileName: string): ParsedCommandLine | undefined;
    private readonly cancellationToken;
    isNonTsProject(): boolean;
    isJsOnlyProject(): boolean;
    static resolveModule(moduleName: string, initialDir: string, host: ServerHost, log: (message: string) => void, logErrors?: (message: string) => void): {} | undefined;
    /** @internal */
    static importServicePluginAsync(moduleName: string, initialDir: string, host: ServerHost, log: (message: string) => void, logErrors?: (message: string) => void): Promise<{} | undefined>;
    /** @internal */
    readonly currentDirectory: string;
    /** @internal */
    readonly projectName: string;
    /** @internal */
    directoryStructureHost: DirectoryStructureHost;
    /** @internal */
    readonly getCanonicalFileName: GetCanonicalFileName;
    /** @internal */
    private exportMapCache;
    /** @internal */
    private changedFilesForExportMapCache;
    /** @internal */
    private moduleSpecifierCache;
    /** @internal */
    private symlinks;
    /** @internal */
    autoImportProviderHost: AutoImportProviderProject | false | undefined;
    /** @internal */
    protected typeAcquisition: TypeAcquisition | undefined;
    /** @internal */
    createHash: ((data: string) => string) | undefined;
    /** @internal */
    constructor(projectName: string, projectKind: ProjectKind, projectService: ProjectService, documentRegistry: DocumentRegistry, hasExplicitListOfFiles: boolean, lastFileExceededProgramSize: string | undefined, compilerOptions: CompilerOptions, compileOnSaveEnabled: boolean, watchOptions: WatchOptions | undefined, directoryStructureHost: DirectoryStructureHost, currentDirectory: string | undefined);
    isKnownTypesPackageName(name: string): boolean;
    installPackage(options: InstallPackageOptions): Promise<ApplyCodeActionCommandResult>;
    /** @internal */
    getGlobalTypingsCacheLocation(): string | undefined;
    private get typingsCache();
    /** @internal */
    getSymlinkCache(): SymlinkCache;
    getCompilationSettings(): ts.CompilerOptions;
    getCompilerOptions(): ts.CompilerOptions;
    getNewLine(): string;
    getProjectVersion(): string;
    getProjectReferences(): readonly ProjectReference[] | undefined;
    getScriptFileNames(): string[];
    private getOrCreateScriptInfoAndAttachToProject;
    getScriptKind(fileName: string): ts.ScriptKind;
    getScriptVersion(filename: string): string;
    getScriptSnapshot(filename: string): IScriptSnapshot | undefined;
    getCancellationToken(): HostCancellationToken;
    getCurrentDirectory(): string;
    getDefaultLibFileName(): string;
    useCaseSensitiveFileNames(): boolean;
    readDirectory(path: string, extensions?: readonly string[], exclude?: readonly string[], include?: readonly string[], depth?: number): string[];
    readFile(fileName: string): string | undefined;
    writeFile(fileName: string, content: string): void;
    fileExists(file: string): boolean;
    /** @internal */
    resolveModuleNameLiterals(moduleLiterals: readonly StringLiteralLike[], containingFile: string, redirectedReference: ResolvedProjectReference | undefined, options: CompilerOptions, containingSourceFile: SourceFile, reusedNames: readonly StringLiteralLike[] | undefined): readonly ResolvedModuleWithFailedLookupLocations[];
    getModuleResolutionCache(): ModuleResolutionCache | undefined;
    /** @internal */
    resolveTypeReferenceDirectiveReferences<T extends string | FileReference>(typeDirectiveReferences: readonly T[], containingFile: string, redirectedReference: ResolvedProjectReference | undefined, options: CompilerOptions, containingSourceFile: SourceFile | undefined, reusedNames: readonly T[] | undefined): readonly ResolvedTypeReferenceDirectiveWithFailedLookupLocations[];
    directoryExists(path: string): boolean;
    getDirectories(path: string): string[];
    /** @internal */
    getCachedDirectoryStructureHost(): CachedDirectoryStructureHost;
    /** @internal */
    toPath(fileName: string): ts.Path;
    /** @internal */
    watchDirectoryOfFailedLookupLocation(directory: string, cb: DirectoryWatcherCallback, flags: WatchDirectoryFlags): ts.FileWatcher;
    /** @internal */
    watchAffectingFileLocation(file: string, cb: FileWatcherCallback): ts.FileWatcher;
    /** @internal */
    clearInvalidateResolutionOfFailedLookupTimer(): boolean;
    /** @internal */
    scheduleInvalidateResolutionsOfFailedLookupLocations(): void;
    /** @internal */
    invalidateResolutionsOfFailedLookupLocations(): void;
    /** @internal */
    onInvalidatedResolution(): void;
    /** @internal */
    watchTypeRootsDirectory(directory: string, cb: DirectoryWatcherCallback, flags: WatchDirectoryFlags): ts.FileWatcher;
    /** @internal */
    hasChangedAutomaticTypeDirectiveNames(): boolean;
    /** @internal */
    onChangedAutomaticTypeDirectiveNames(): void;
    /** @internal */
    getGlobalCache(): string | undefined;
    /** @internal */
    globalCacheResolutionModuleName: typeof JsTyping.nonRelativeModuleNameForTypingCache;
    /** @internal */
    fileIsOpen(filePath: Path): boolean;
    /** @internal */
    writeLog(s: string): void;
    log(s: string): void;
    error(s: string): void;
    private setInternalCompilerOptionsForEmittingJsFiles;
    /**
     * Get the errors that dont have any file name associated
     */
    getGlobalProjectErrors(): readonly Diagnostic[];
    /**
     * Get all the project errors
     */
    getAllProjectErrors(): readonly Diagnostic[];
    setProjectErrors(projectErrors: Diagnostic[] | undefined): void;
    getLanguageService(ensureSynchronized?: boolean): LanguageService;
    /** @internal */
    getSourceMapper(): SourceMapper;
    /** @internal */
    clearSourceMapperCache(): void;
    /** @internal */
    getDocumentPositionMapper(generatedFileName: string, sourceFileName?: string): DocumentPositionMapper | undefined;
    /** @internal */
    getSourceFileLike(fileName: string): ts.SourceFileLike | undefined;
    /** @internal */
    shouldEmitFile(scriptInfo: ScriptInfo | undefined): boolean | undefined;
    getCompileOnSaveAffectedFileList(scriptInfo: ScriptInfo): string[];
    /**
     * Returns true if emit was conducted
     */
    emitFile(scriptInfo: ScriptInfo, writeFile: (path: string, data: string, writeByteOrderMark?: boolean) => void): EmitResult;
    enableLanguageService(): void;
    disableLanguageService(lastFileExceededProgramSize?: string): void;
    getProjectName(): string;
    protected removeLocalTypingsFromTypeAcquisition(newTypeAcquisition: TypeAcquisition): TypeAcquisition;
    getExternalFiles(): SortedReadonlyArray<string>;
    getSourceFile(path: Path): ts.SourceFile | undefined;
    /** @internal */
    getSourceFileOrConfigFile(path: Path): SourceFile | undefined;
    close(): void;
    private detachScriptInfoIfNotRoot;
    isClosed(): boolean;
    hasRoots(): boolean;
    /** @internal */
    isOrphan(): boolean;
    getRootFiles(): ts.server.NormalizedPath[];
    /** @internal */
    getRootFilesMap(): Map<string, ts.server.ProjectRootFile>;
    getRootScriptInfos(): ts.server.ScriptInfo[];
    getScriptInfos(): ScriptInfo[];
    getExcludedFiles(): readonly NormalizedPath[];
    getFileNames(excludeFilesFromExternalLibraries?: boolean, excludeConfigFiles?: boolean): ts.server.NormalizedPath[];
    /** @internal */
    getFileNamesWithRedirectInfo(includeProjectReferenceRedirectInfo: boolean): ts.server.protocol.FileWithProjectReferenceRedirectInfo[];
    hasConfigFile(configFilePath: NormalizedPath): boolean;
    containsScriptInfo(info: ScriptInfo): boolean;
    containsFile(filename: NormalizedPath, requireOpen?: boolean): boolean;
    isRoot(info: ScriptInfo): boolean;
    addRoot(info: ScriptInfo, fileName?: NormalizedPath): void;
    addMissingFileRoot(fileName: NormalizedPath): void;
    removeFile(info: ScriptInfo, fileExists: boolean, detachFromProject: boolean): void;
    registerFileUpdate(fileName: string): void;
    /** @internal */
    markFileAsDirty(changedFile: Path): void;
    markAsDirty(): void;
    /** @internal */
    onAutoImportProviderSettingsChanged(): void;
    /** @internal */
    onPackageJsonChange(packageJsonPath: Path): void;
    /** @internal */
    onFileAddedOrRemoved(isSymlink: boolean | undefined): void;
    /** @internal */
    onDiscoveredSymlink(): void;
    /**
     * Updates set of files that contribute to this project
     * @returns: true if set of files in the project stays the same and false - otherwise.
     */
    updateGraph(): boolean;
    /** @internal */
    updateTypingFiles(typingFiles: SortedReadonlyArray<string>): void;
    /** @internal */
    getCurrentProgram(): Program | undefined;
    protected removeExistingTypings(include: string[]): string[];
    private updateGraphWorker;
    /** @internal */
    sendPerformanceEvent(kind: PerformanceEvent["kind"], durationMs: number): void;
    private detachScriptInfoFromProject;
    private addMissingFileWatcher;
    private isWatchedMissingFile;
    /** @internal */
    addGeneratedFileWatch(generatedFile: string, sourceFile: string): void;
    private createGeneratedFileWatcher;
    private isValidGeneratedFileWatcher;
    private clearGeneratedFileWatch;
    getScriptInfoForNormalizedPath(fileName: NormalizedPath): ScriptInfo | undefined;
    getScriptInfo(uncheckedFileName: string): ts.server.ScriptInfo | undefined;
    filesToString(writeProjectFileNames: boolean): string;
    /** @internal */
    print(writeProjectFileNames: boolean): void;
    setCompilerOptions(compilerOptions: CompilerOptions): void;
    /** @internal */
    setWatchOptions(watchOptions: WatchOptions | undefined): void;
    /** @internal */
    getWatchOptions(): WatchOptions | undefined;
    setTypeAcquisition(newTypeAcquisition: TypeAcquisition | undefined): void;
    getTypeAcquisition(): ts.TypeAcquisition;
    /** @internal */
    getChangesSinceVersion(lastKnownVersion?: number, includeProjectReferenceRedirectInfo?: boolean): ProjectFilesWithTSDiagnostics;
    protected removeRoot(info: ScriptInfo): void;
    /** @internal */
    isSourceOfProjectReferenceRedirect(fileName: string): boolean;
    /** @internal */
    protected getGlobalPluginSearchPaths(): string[];
    protected enableGlobalPlugins(options: CompilerOptions, pluginConfigOverrides: Map<string, any> | undefined): void;
    /**
     * Performs the initial steps of enabling a plugin by finding and instantiating the module for a plugin synchronously using 'require'.
     *
     * @internal
     */
    beginEnablePluginSync(pluginConfigEntry: PluginImport, searchPaths: string[], pluginConfigOverrides: Map<string, any> | undefined): BeginEnablePluginResult;
    /**
     * Performs the initial steps of enabling a plugin by finding and instantiating the module for a plugin asynchronously using dynamic `import`.
     *
     * @internal
     */
    beginEnablePluginAsync(pluginConfigEntry: PluginImport, searchPaths: string[], pluginConfigOverrides: Map<string, any> | undefined): Promise<BeginEnablePluginResult>;
    /**
     * Performs the remaining steps of enabling a plugin after its module has been instantiated.
     *
     * @internal
     */
    endEnablePlugin({ pluginConfigEntry, pluginConfigOverrides, resolvedModule, errorLogs }: BeginEnablePluginResult): void;
    protected enablePlugin(pluginConfigEntry: PluginImport, searchPaths: string[], pluginConfigOverrides: Map<string, any> | undefined): void;
    private enableProxy;
    /** @internal */
    onPluginConfigurationChanged(pluginName: string, configuration: any): void;
    /** Starts a new check for diagnostics. Call this if some file has updated that would cause diagnostics to be changed. */
    refreshDiagnostics(): void;
    /** @internal */
    getPackageJsonsVisibleToFile(fileName: string, rootDir?: string): readonly ProjectPackageJsonInfo[];
    /** @internal */
    getNearestAncestorDirectoryWithPackageJson(fileName: string): string | undefined;
    /** @internal */
    getPackageJsonsForAutoImport(rootDir?: string): readonly ProjectPackageJsonInfo[];
    /** @internal */
    getPackageJsonCache(): ts.server.PackageJsonCache;
    /** @internal */
    getCachedExportInfoMap(): ts.ExportInfoMap;
    /** @internal */
    clearCachedExportInfoMap(): void;
    /** @internal */
    getModuleSpecifierCache(): ts.ModuleSpecifierCache;
    /** @internal */
    includePackageJsonAutoImports(): PackageJsonAutoImportPreference;
    /** @internal */
    getModuleResolutionHostForAutoImportProvider(): ModuleResolutionHost;
    /** @internal */
    getPackageJsonAutoImportProvider(): Program | undefined;
    /** @internal */
    private isDefaultProjectForOpenFiles;
    /** @internal */
    watchNodeModulesForPackageJsonChanges(directoryPath: string): ts.FileWatcher;
    /** @internal */
    getIncompleteCompletionsCache(): ts.IncompleteCompletionsCache;
    /** @internal */
    getNoDtsResolutionProject(rootFileNames: readonly string[]): Project;
    /** @internal */
    private getCompilerOptionsForNoDtsResolutionProject;
}
/**
 * If a file is opened and no tsconfig (or jsconfig) is found,
 * the file and its imports/references are put into an InferredProject.
 */
export declare class InferredProject extends Project {
    private _isJsInferredProject;
    toggleJsInferredProject(isJsInferredProject: boolean): void;
    setCompilerOptions(options?: CompilerOptions): void;
    /** this is canonical project root path */
    readonly projectRootPath: string | undefined;
    /**
     * stored only if their is no projectRootPath and this isnt single inferred project
     *
     * @internal
     */
    readonly canonicalCurrentDirectory: string | undefined;
    /** @internal */
    constructor(projectService: ProjectService, documentRegistry: DocumentRegistry, compilerOptions: CompilerOptions, watchOptions: WatchOptions | undefined, projectRootPath: NormalizedPath | undefined, currentDirectory: string | undefined, pluginConfigOverrides: Map<string, any> | undefined, typeAcquisition: TypeAcquisition | undefined);
    addRoot(info: ScriptInfo): void;
    removeRoot(info: ScriptInfo): void;
    /** @internal */
    isOrphan(): boolean;
    isProjectWithSingleRoot(): boolean;
    close(): void;
    getTypeAcquisition(): TypeAcquisition;
}
export declare class AutoImportProviderProject extends Project {
    private hostProject;
    /** @internal */
    private static readonly maxDependencies;
    /** @internal */
    static getRootFileNames(dependencySelection: PackageJsonAutoImportPreference, hostProject: Project, moduleResolutionHost: ModuleResolutionHost, compilerOptions: CompilerOptions): string[];
    /** @internal */
    static readonly compilerOptionsOverrides: CompilerOptions;
    /** @internal */
    static create(dependencySelection: PackageJsonAutoImportPreference, hostProject: Project, moduleResolutionHost: ModuleResolutionHost, documentRegistry: DocumentRegistry): AutoImportProviderProject | undefined;
    private rootFileNames;
    /** @internal */
    constructor(hostProject: Project, initialRootNames: string[], documentRegistry: DocumentRegistry, compilerOptions: CompilerOptions);
    /** @internal */
    isEmpty(): boolean;
    isOrphan(): boolean;
    updateGraph(): boolean;
    /** @internal */
    scheduleInvalidateResolutionsOfFailedLookupLocations(): void;
    hasRoots(): boolean;
    markAsDirty(): void;
    getScriptFileNames(): string[];
    getLanguageService(): never;
    /** @internal */
    onAutoImportProviderSettingsChanged(): never;
    /** @internal */
    onPackageJsonChange(): never;
    getModuleResolutionHostForAutoImportProvider(): never;
    getProjectReferences(): readonly ts.ProjectReference[] | undefined;
    /** @internal */
    includePackageJsonAutoImports(): ts.PackageJsonAutoImportPreference;
    getTypeAcquisition(): TypeAcquisition;
    /** @internal */
    getSymlinkCache(): ts.SymlinkCache;
    /** @internal */
    getModuleResolutionCache(): ts.ModuleResolutionCache | undefined;
}
/**
 * If a file is opened, the server will look for a tsconfig (or jsconfig)
 * and if successful create a ConfiguredProject for it.
 * Otherwise it will create an InferredProject.
 */
export declare class ConfiguredProject extends Project {
    readonly canonicalConfigFilePath: NormalizedPath;
    /** @internal */
    pendingReload: ConfigFileProgramReloadLevel | undefined;
    /** @internal */
    pendingReloadReason: string | undefined;
    /** @internal */
    openFileWatchTriggered: Map<string, ts.ConfigFileProgramReloadLevel>;
    /** @internal */
    canConfigFileJsonReportNoInputFiles: boolean;
    /** Ref count to the project when opened from external project */
    private externalProjectRefCount;
    private projectReferences;
    /**
     * Potential project references before the project is actually loaded (read config file)
     *
     * @internal
     */
    potentialProjectReferences: Set<NormalizedPath> | undefined;
    /** @internal */
    projectOptions?: ProjectOptions | true;
    /** @internal */
    isInitialLoadPending: () => boolean;
    /** @internal */
    sendLoadingProjectFinish: boolean;
    /** @internal */
    private compilerHost?;
    /** @internal */
    constructor(configFileName: NormalizedPath, canonicalConfigFilePath: NormalizedPath, projectService: ProjectService, documentRegistry: DocumentRegistry, cachedDirectoryStructureHost: CachedDirectoryStructureHost);
    /** @internal */
    setCompilerHost(host: CompilerHost): void;
    /** @internal */
    getCompilerHost(): CompilerHost | undefined;
    /** @internal */
    useSourceOfProjectReferenceRedirect(): boolean;
    /** @internal */
    getParsedCommandLine(fileName: string): ts.ParsedCommandLine | undefined;
    /** @internal */
    onReleaseParsedCommandLine(fileName: string): void;
    /** @internal */
    private releaseParsedConfig;
    /**
     * If the project has reload from disk pending, it reloads (and then updates graph as part of that) instead of just updating the graph
     * @returns: true if set of files in the project stays the same and false - otherwise.
     */
    updateGraph(): boolean;
    /** @internal */
    getCachedDirectoryStructureHost(): ts.CachedDirectoryStructureHost;
    getConfigFilePath(): ts.server.NormalizedPath;
    getProjectReferences(): readonly ProjectReference[] | undefined;
    updateReferences(refs: readonly ProjectReference[] | undefined): void;
    /** @internal */
    setPotentialProjectReference(canonicalConfigPath: NormalizedPath): void;
    /** @internal */
    getResolvedProjectReferenceToRedirect(fileName: string): ResolvedProjectReference | undefined;
    /** @internal */
    forEachResolvedProjectReference<T>(cb: (resolvedProjectReference: ResolvedProjectReference) => T | undefined): T | undefined;
    /** @internal */
    enablePluginsWithOptions(options: CompilerOptions, pluginConfigOverrides: Map<string, any> | undefined): void;
    /**
     * Get the errors that dont have any file name associated
     */
    getGlobalProjectErrors(): readonly Diagnostic[];
    /**
     * Get all the project errors
     */
    getAllProjectErrors(): readonly Diagnostic[];
    setProjectErrors(projectErrors: Diagnostic[]): void;
    close(): void;
    /** @internal */
    addExternalProjectReference(): void;
    /** @internal */
    deleteExternalProjectReference(): void;
    /** @internal */
    isSolution(): boolean;
    /**
     * Find the configured project from the project references in project which contains the info directly
     *
     * @internal
     */
    getDefaultChildProjectFromProjectWithReferences(info: ScriptInfo): ts.server.ConfiguredProject | undefined;
    /**
     * Returns true if the project is needed by any of the open script info/external project
     *
     * @internal
     */
    hasOpenRef(): boolean;
    /** @internal */
    hasExternalProjectRef(): boolean;
    getEffectiveTypeRoots(): string[];
    /** @internal */
    updateErrorOnNoInputFiles(fileNames: string[]): void;
}
/**
 * Project whose configuration is handled externally, such as in a '.csproj'.
 * These are created only if a host explicitly calls `openExternalProject`.
 */
export declare class ExternalProject extends Project {
    externalProjectName: string;
    compileOnSaveEnabled: boolean;
    excludedFiles: readonly NormalizedPath[];
    /** @internal */
    constructor(externalProjectName: string, projectService: ProjectService, documentRegistry: DocumentRegistry, compilerOptions: CompilerOptions, lastFileExceededProgramSize: string | undefined, compileOnSaveEnabled: boolean, projectFilePath?: string, pluginConfigOverrides?: Map<string, any>, watchOptions?: WatchOptions);
    updateGraph(): boolean;
    getExcludedFiles(): readonly ts.server.NormalizedPath[];
}
/** @internal */
export declare function isInferredProject(project: Project): project is InferredProject;
/** @internal */
export declare function isConfiguredProject(project: Project): project is ConfiguredProject;
/** @internal */
export declare function isExternalProject(project: Project): project is ExternalProject;
//# sourceMappingURL=project.d.ts.map