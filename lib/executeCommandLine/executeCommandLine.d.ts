import * as ts from "./_namespaces/ts";
import { BuilderProgram, ParsedCommandLine, Program, System } from "./_namespaces/ts";
export declare enum StatisticType {
    time = 0,
    count = 1,
    memory = 2
}
export declare function isBuild(commandLineArgs: readonly string[]): boolean;
export type ExecuteCommandLineCallbacks = (program: Program | BuilderProgram | ParsedCommandLine) => void;
export declare function executeCommandLine(system: System, cb: ExecuteCommandLineCallbacks, commandLineArgs: readonly string[]): void | ts.WatchOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram> | ts.SolutionBuilder<ts.EmitAndSemanticDiagnosticsBuilderProgram>;
//# sourceMappingURL=executeCommandLine.d.ts.map