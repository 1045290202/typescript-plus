import { Path, ProjectPackageJsonInfo, Ternary } from "./_namespaces/ts";
import { ProjectService } from "./_namespaces/ts.server";
/** @internal */
export interface PackageJsonCache {
    addOrUpdate(fileName: Path): void;
    forEach(action: (info: ProjectPackageJsonInfo, fileName: Path) => void): void;
    delete(fileName: Path): void;
    get(fileName: Path): ProjectPackageJsonInfo | false | undefined;
    getInDirectory(directory: Path): ProjectPackageJsonInfo | undefined;
    directoryHasPackageJson(directory: Path): Ternary;
    searchDirectoryAndAncestors(directory: Path): void;
}
/** @internal */
export declare function createPackageJsonCache(host: ProjectService): PackageJsonCache;
//# sourceMappingURL=packageJsonCache.d.ts.map