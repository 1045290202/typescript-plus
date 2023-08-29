import { IScriptSnapshot, TextChangeRange, TextSpan } from "./_namespaces/ts";
import * as protocol from "./protocol";
/** @internal */
export interface LineCollection {
    charCount(): number;
    lineCount(): number;
    isLeaf(): this is LineLeaf;
    walk(rangeStart: number, rangeLength: number, walkFns: LineIndexWalker): void;
}
/** @internal */
export interface AbsolutePositionAndLineText {
    absolutePosition: number;
    lineText: string | undefined;
}
/** @internal */
export declare const enum CharRangeSection {
    PreStart = 0,
    Start = 1,
    Entire = 2,
    Mid = 3,
    End = 4,
    PostEnd = 5
}
/** @internal */
export interface LineIndexWalker {
    goSubtree: boolean;
    done: boolean;
    leaf(relativeStart: number, relativeLength: number, lineCollection: LineLeaf): void;
    pre?(relativeStart: number, relativeLength: number, lineCollection: LineCollection, parent: LineNode, nodeType: CharRangeSection): void;
    post?(relativeStart: number, relativeLength: number, lineCollection: LineCollection, parent: LineNode, nodeType: CharRangeSection): void;
}
/** @internal */
export declare class ScriptVersionCache {
    private static readonly changeNumberThreshold;
    private static readonly changeLengthThreshold;
    private static readonly maxVersions;
    private changes;
    private readonly versions;
    private minVersion;
    private currentVersion;
    private versionToIndex;
    private currentVersionToIndex;
    edit(pos: number, deleteLen: number, insertedText?: string): void;
    getSnapshot(): IScriptSnapshot;
    private _getSnapshot;
    getSnapshotVersion(): number;
    getAbsolutePositionAndLineText(oneBasedLine: number): AbsolutePositionAndLineText;
    lineOffsetToPosition(line: number, column: number): number;
    positionToLineOffset(position: number): protocol.Location;
    lineToTextSpan(line: number): TextSpan;
    getTextChangesBetweenVersions(oldVersion: number, newVersion: number): TextChangeRange | undefined;
    getLineCount(): number;
    static fromString(script: string): ScriptVersionCache;
}
/** @internal */
export declare class LineIndex {
    root: LineNode;
    checkEdits: boolean;
    absolutePositionOfStartOfLine(oneBasedLine: number): number;
    positionToLineOffset(position: number): protocol.Location;
    private positionToColumnAndLineText;
    getLineCount(): number;
    lineNumberToInfo(oneBasedLine: number): AbsolutePositionAndLineText;
    load(lines: string[]): void;
    walk(rangeStart: number, rangeLength: number, walkFns: LineIndexWalker): void;
    getText(rangeStart: number, rangeLength: number): string;
    getLength(): number;
    every(f: (ll: LineLeaf, s: number, len: number) => boolean, rangeStart: number, rangeEnd?: number): boolean;
    edit(pos: number, deleteLength: number, newText?: string): LineIndex;
    private static buildTreeFromBottom;
    static linesFromText(text: string): {
        lines: string[];
        lineMap: number[];
    };
}
/** @internal */
export declare class LineNode implements LineCollection {
    private readonly children;
    totalChars: number;
    totalLines: number;
    constructor(children?: LineCollection[]);
    isLeaf(): boolean;
    updateCounts(): void;
    private execWalk;
    private skipChild;
    walk(rangeStart: number, rangeLength: number, walkFns: LineIndexWalker): void;
    charOffsetToLineInfo(lineNumberAccumulator: number, relativePosition: number): {
        oneBasedLine: number;
        zeroBasedColumn: number;
        lineText: string | undefined;
    };
    /**
     * Input line number is relative to the start of this node.
     * Output line number is relative to the child.
     * positionAccumulator will be an absolute position once relativeLineNumber reaches 0.
     */
    lineNumberToInfo(relativeOneBasedLine: number, positionAccumulator: number): {
        position: number;
        leaf: LineLeaf | undefined;
    };
    private splitAfter;
    remove(child: LineCollection): void;
    private findChildIndex;
    insertAt(child: LineCollection, nodes: LineCollection[]): LineNode[];
    add(collection: LineCollection): void;
    charCount(): number;
    lineCount(): number;
}
/** @internal */
export declare class LineLeaf implements LineCollection {
    text: string;
    constructor(text: string);
    isLeaf(): boolean;
    walk(rangeStart: number, rangeLength: number, walkFns: LineIndexWalker): void;
    charCount(): number;
    lineCount(): number;
}
//# sourceMappingURL=scriptVersionCache.d.ts.map