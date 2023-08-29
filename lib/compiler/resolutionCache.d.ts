import { CachedDirectoryStructureHost, CompilerOptions, DirectoryWatcherCallback, FileReference, FileWatcher, FileWatcherCallback, GetCanonicalFileName, HasInvalidatedResolutions, MinimalResolutionCacheHost, ModuleResolutionCache, Path, Program, ResolvedModuleWithFailedLookupLocations, ResolvedProjectReference, ResolvedTypeReferenceDirectiveWithFailedLookupLocations, SourceFile, StringLiteralLike, WatchDirectoryFlags } from "./_namespaces/ts";
/**
 * This is the cache of module/typedirectives resolution that can be retained across program
 *
 * @internal
 */
export interface ResolutionCache {
    startRecordingFilesWithChangedResolutions(): void;
    finishRecordingFilesWithChangedResolutions(): Path[] | undefined;
    resolveModuleNameLiterals(moduleLiterals: readonly StringLiteralLike[], containingFile: string, redirectedReference: ResolvedProjectReference | undefined, options: CompilerOptions, containingSourceFile: SourceFile, reusedNames: readonly StringLiteralLike[] | undefined): readonly ResolvedModuleWithFailedLookupLocations[];
    resolveTypeReferenceDirectiveReferences<T extends FileReference | string>(typeDirectiveReferences: readonly T[], containingFile: string, redirectedReference: ResolvedProjectReference | undefined, options: CompilerOptions, containingSourceFile: SourceFile | undefined, reusedNames: readonly T[] | undefined): readonly ResolvedTypeReferenceDirectiveWithFailedLookupLocations[];
    resolveSingleModuleNameWithoutWatching(moduleName: string, containingFile: string): ResolvedModuleWithFailedLookupLocations;
    invalidateResolutionsOfFailedLookupLocations(): boolean;
    invalidateResolutionOfFile(filePath: Path): void;
    removeResolutionsOfFile(filePath: Path): void;
    removeResolutionsFromProjectReferenceRedirects(filePath: Path): void;
    setFilesWithInvalidatedNonRelativeUnresolvedImports(filesWithUnresolvedImports: Map<Path, readonly string[]>): void;
    createHasInvalidatedResolutions(customHasInvalidatedResolutions: HasInvalidatedResolutions): HasInvalidatedResolutions;
    hasChangedAutomaticTypeDirectiveNames(): boolean;
    isFileWithInvalidatedNonRelativeUnresolvedImports(path: Path): boolean;
    startCachingPerDirectoryResolution(): void;
    finishCachingPerDirectoryResolution(newProgram: Program | undefined, oldProgram: Program | undefined): void;
    updateTypeRootsWatch(): void;
    closeTypeRootsWatch(): void;
    getModuleResolutionCache(): ModuleResolutionCache;
    clear(): void;
}
/** @internal */
export interface ResolutionWithFailedLookupLocations {
    failedLookupLocations?: string[];
    affectingLocations?: string[];
    isInvalidated?: boolean;
    refCount?: number;
    files?: Set<Path>;
}
/** @internal */
export interface CachedResolvedModuleWithFailedLookupLocations extends ResolvedModuleWithFailedLookupLocations, ResolutionWithFailedLookupLocations {
}
/** @internal */
export interface ResolutionCacheHost extends MinimalResolutionCacheHost {
    toPath(fileName: string): Path;
    getCanonicalFileName: GetCanonicalFileName;
    getCompilationSettings(): CompilerOptions;
    watchDirectoryOfFailedLookupLocation(directory: string, cb: DirectoryWatcherCallback, flags: WatchDirectoryFlags): FileWatcher;
    watchAffectingFileLocation(file: string, cb: FileWatcherCallback): FileWatcher;
    onInvalidatedResolution(): void;
    watchTypeRootsDirectory(directory: string, cb: DirectoryWatcherCallback, flags: WatchDirectoryFlags): FileWatcher;
    onChangedAutomaticTypeDirectiveNames(): void;
    scheduleInvalidateResolutionsOfFailedLookupLocations(): void;
    getCachedDirectoryStructureHost(): CachedDirectoryStructureHost | undefined;
    projectName?: string;
    getGlobalCache?(): string | undefined;
    globalCacheResolutionModuleName?(externalModuleName: string): string;
    writeLog(s: string): void;
    getCurrentProgram(): Program | undefined;
    fileIsOpen(filePath: Path): boolean;
    onDiscoveredSymlink?(): void;
}
/** @internal */
export declare function removeIgnoredPath(path: Path): Path | undefined;
/**
 * Filter out paths like
 * "/", "/user", "/user/username", "/user/username/folderAtRoot",
 * "c:/", "c:/users", "c:/users/username", "c:/users/username/folderAtRoot", "c:/folderAtRoot"
 * @param dirPath
 *
 * @internal
 */
export declare function canWatchDirectoryOrFile(dirPath: Path): boolean;
/** @internal */
export declare function createResolutionCache(resolutionHost: ResolutionCacheHost, rootDirForResolution: string | undefined, logChangesWhenResolvingModule: boolean): ResolutionCache;
//# sourceMappingURL=resolutionCache.d.ts.map