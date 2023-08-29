import { Program } from "./types";
export interface SortingResult {
    sortedFileNames: string[];
    circularReferences: string[];
}
export declare function reorderSourceFiles(program: Program): SortingResult;
//# sourceMappingURL=sorting.d.ts.map