import { ApplicableRefactorInfo, Refactor, RefactorContext, RefactorEditInfo } from "./_namespaces/ts";
/**
 * @param name An unique code associated with each refactor. Does not have to be human-readable.
 *
 * @internal
 */
export declare function registerRefactor(name: string, refactor: Refactor): void;
/** @internal */
export declare function getApplicableRefactors(context: RefactorContext): ApplicableRefactorInfo[];
/** @internal */
export declare function getEditsForRefactor(context: RefactorContext, refactorName: string, actionName: string): RefactorEditInfo | undefined;
//# sourceMappingURL=refactorProvider.d.ts.map