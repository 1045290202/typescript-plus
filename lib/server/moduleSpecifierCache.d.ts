import { FileWatcher, ModuleSpecifierCache } from "./_namespaces/ts";
/** @internal */
export interface ModuleSpecifierResolutionCacheHost {
    watchNodeModulesForPackageJsonChanges(directoryPath: string): FileWatcher;
}
/** @internal */
export declare function createModuleSpecifierCache(host: ModuleSpecifierResolutionCacheHost): ModuleSpecifierCache;
//# sourceMappingURL=moduleSpecifierCache.d.ts.map