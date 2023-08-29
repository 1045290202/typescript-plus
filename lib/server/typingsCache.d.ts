import { ApplyCodeActionCommandResult, CompilerOptions, InstallPackageOptions, Path, SortedReadonlyArray, TypeAcquisition } from "./_namespaces/ts";
import { Project, ProjectService } from "./_namespaces/ts.server";
export interface InstallPackageOptionsWithProject extends InstallPackageOptions {
    projectName: string;
    projectRootPath: Path;
}
export interface ITypingsInstaller {
    isKnownTypesPackageName(name: string): boolean;
    installPackage(options: InstallPackageOptionsWithProject): Promise<ApplyCodeActionCommandResult>;
    enqueueInstallTypingsRequest(p: Project, typeAcquisition: TypeAcquisition, unresolvedImports: SortedReadonlyArray<string> | undefined): void;
    attach(projectService: ProjectService): void;
    onProjectClosed(p: Project): void;
    readonly globalTypingsCacheLocation: string | undefined;
}
export declare const nullTypingsInstaller: ITypingsInstaller;
/** @internal */
export declare class TypingsCache {
    private readonly installer;
    private readonly perProjectCache;
    constructor(installer: ITypingsInstaller);
    isKnownTypesPackageName(name: string): boolean;
    installPackage(options: InstallPackageOptionsWithProject): Promise<ApplyCodeActionCommandResult>;
    enqueueInstallTypingsForProject(project: Project, unresolvedImports: SortedReadonlyArray<string> | undefined, forceRefresh: boolean): void;
    updateTypingsForProject(projectName: string, compilerOptions: CompilerOptions, typeAcquisition: TypeAcquisition, unresolvedImports: SortedReadonlyArray<string>, newTypings: string[]): SortedReadonlyArray<string>;
    onProjectClosed(project: Project): void;
}
//# sourceMappingURL=typingsCache.d.ts.map