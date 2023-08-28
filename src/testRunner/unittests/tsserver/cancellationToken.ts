import * as ts from "../../_namespaces/ts";
import { createServerHost } from "../virtualFileSystemWithWatch";
import {
    createSession,
    TestServerCancellationToken,
    TestSessionRequest,
} from "./helpers";

describe("unittests:: tsserver:: cancellationToken", () => {
    // Disable sourcemap support for the duration of the test, as sourcemapping the errors generated during this test is slow and not something we care to test
    let oldPrepare: ts.AnyFunction;
    before(() => {
        oldPrepare = (Error as any).prepareStackTrace;
        delete (Error as any).prepareStackTrace;
    });

    after(() => {
        (Error as any).prepareStackTrace = oldPrepare;
    });

    it("is attached to request", () => {
        const f1 = {
            path: "/a/b/app.ts",
            content: "let xyz = 1;"
        };
        const host = createServerHost([f1]);
        let expectedRequestId: number;
        const cancellationToken: ts.server.ServerCancellationToken = {
            isCancellationRequested: () => false,
            setRequest: requestId => {
                if (expectedRequestId === undefined) {
                    assert.isTrue(false, "unexpected call");
                }
                assert.equal(requestId, expectedRequestId);
            },
            resetRequest: ts.noop
        };

        const session = createSession(host, { cancellationToken });

        expectedRequestId = session.getNextSeq();
        session.executeCommandSeq<ts.server.protocol.OpenRequest>({
            command: ts.server.protocol.CommandTypes.Open,
            arguments: { file: f1.path }
        });

        expectedRequestId = session.getNextSeq();
        session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
            command: ts.server.protocol.CommandTypes.Geterr,
            arguments: { files: [f1.path], delay: 0 }
        });

        expectedRequestId = session.getNextSeq();
        session.executeCommandSeq<ts.server.protocol.OccurrencesRequest>({
            command: ts.server.protocol.CommandTypes.Occurrences,
            arguments: { file: f1.path, line: 1, offset: 6 }
        });

        expectedRequestId = 2;
        host.runQueuedImmediateCallbacks();
        expectedRequestId = 2;
        host.runQueuedImmediateCallbacks();
    });

    it("Geterr is cancellable", () => {
        const f1 = {
            path: "/a/app.ts",
            content: "let x = 1"
        };
        const config = {
            path: "/a/tsconfig.json",
            content: JSON.stringify({
                compilerOptions: {}
            })
        };

        const cancellationToken = new TestServerCancellationToken();
        const host = createServerHost([f1, config]);
        const session = createSession(host, {
            canUseEvents: true,
            eventHandler: ts.noop,
            cancellationToken
        });
        {
            session.executeCommandSeq<ts.server.protocol.OpenRequest>({
                command: ts.server.protocol.CommandTypes.Open,
                arguments: { file: f1.path }
            });
            // send geterr for missing file
            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: ["/a/missing"], delay: 0 }
            });
            // Queued files
            assert.equal(host.getOutput().length, 0, "expected 0 message");
            host.checkTimeoutQueueLengthAndRun(1);
            // Completed event since file is missing
            assert.equal(host.getOutput().length, 1, "expect 1 message");
            verifyRequestCompleted(session.getSeq(), 0);
        }
        {
            const getErrId = session.getNextSeq();
            // send geterr for a valid file
            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: [f1.path], delay: 0 }
            });

            assert.equal(host.getOutput().length, 0, "expect 0 messages");

            // run new request
            session.executeCommandSeq<ts.server.protocol.ProjectInfoRequest>({
                command: ts.server.protocol.CommandTypes.ProjectInfo,
                arguments: { file: f1.path, needFileNameList: false }
            });
            session.clearMessages();

            // cancel previously issued Geterr
            cancellationToken.setRequestToCancel(getErrId);
            host.runQueuedTimeoutCallbacks();

            assert.equal(host.getOutput().length, 1, "expect 1 message");
            verifyRequestCompleted(getErrId, 0);

            cancellationToken.resetToken();
        }
        {
            const getErrId = session.getNextSeq();
            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: [f1.path], delay: 0 }
            });
            assert.equal(host.getOutput().length, 0, "expect 0 messages");

            // run first step
            host.runQueuedTimeoutCallbacks();
            assert.equal(host.getOutput().length, 1, "expect 1 message");
            const e1 = getMessage(0) as ts.server.protocol.Event;
            assert.equal(e1.event, "syntaxDiag");
            session.clearMessages();

            cancellationToken.setRequestToCancel(getErrId);
            host.runQueuedImmediateCallbacks();
            assert.equal(host.getOutput().length, 1, "expect 1 message");
            verifyRequestCompleted(getErrId, 0);

            cancellationToken.resetToken();
        }
        {
            const getErrId = session.getNextSeq();
            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: [f1.path], delay: 0 }
            });
            assert.equal(host.getOutput().length, 0, "expect 0 messages");

            // run first step
            host.runQueuedTimeoutCallbacks();
            assert.equal(host.getOutput().length, 1, "expect 1 message");
            const e1 = getMessage(0) as ts.server.protocol.Event;
            assert.equal(e1.event, "syntaxDiag");
            session.clearMessages();

            // the semanticDiag message
            host.runQueuedImmediateCallbacks();
            assert.equal(host.getOutput().length, 1);
            const e2 = getMessage(0) as ts.server.protocol.Event;
            assert.equal(e2.event, "semanticDiag");
            session.clearMessages();

            host.runQueuedImmediateCallbacks(1);
            assert.equal(host.getOutput().length, 2);
            const e3 = getMessage(0) as ts.server.protocol.Event;
            assert.equal(e3.event, "suggestionDiag");
            verifyRequestCompleted(getErrId, 1);

            cancellationToken.resetToken();
        }
        {
            const getErr1 = session.getNextSeq();
            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: [f1.path], delay: 0 }
            });
            assert.equal(host.getOutput().length, 0, "expect 0 messages");
            // run first step
            host.runQueuedTimeoutCallbacks();
            assert.equal(host.getOutput().length, 1, "expect 1 message");
            const e1 = getMessage(0) as ts.server.protocol.Event;
            assert.equal(e1.event, "syntaxDiag");
            session.clearMessages();

            session.executeCommandSeq<ts.server.protocol.GeterrRequest>({
                command: ts.server.protocol.CommandTypes.Geterr,
                arguments: { files: [f1.path], delay: 0 }
            });
            // make sure that getErr1 is completed
            verifyRequestCompleted(getErr1, 0);
        }

        function verifyRequestCompleted(expectedSeq: number, n: number) {
            const event = getMessage(n) as ts.server.protocol.RequestCompletedEvent;
            assert.equal(event.event, "requestCompleted");
            assert.equal(event.body.request_seq, expectedSeq, "expectedSeq");
            session.clearMessages();
        }

        function getMessage(n: number) {
            return JSON.parse(ts.server.extractMessage(host.getOutput()[n]));
        }
    });

    it("Lower priority tasks are cancellable", () => {
        const f1 = {
            path: "/a/app.ts",
            content: `{ let x = 1; } var foo = "foo"; var bar = "bar"; var fooBar = "fooBar";`
        };
        const config = {
            path: "/a/tsconfig.json",
            content: JSON.stringify({
                compilerOptions: {}
            })
        };
        const cancellationToken = new TestServerCancellationToken(/*cancelAfterRequest*/ 3);
        const host = createServerHost([f1, config]);
        const session = createSession(host, {
            canUseEvents: true,
            eventHandler: ts.noop,
            cancellationToken,
            throttleWaitMilliseconds: 0
        });
        {
            session.executeCommandSeq<ts.server.protocol.OpenRequest>({
                command: ts.server.protocol.CommandTypes.Open,
                arguments: { file: f1.path }
            });

            // send navbar request (normal priority)
            session.executeCommandSeq<ts.server.protocol.NavBarRequest>({
                command: ts.server.protocol.CommandTypes.NavBar,
                arguments: { file: f1.path }
            });

            // ensure the nav bar request can be canceled
            verifyExecuteCommandSeqIsCancellable<ts.server.protocol.NavBarRequest>({
                command: ts.server.protocol.CommandTypes.NavBar,
                arguments: { file: f1.path }
            });

            // send outlining spans request (normal priority)
            session.executeCommandSeq<ts.server.protocol.OutliningSpansRequestFull>({
                command: ts.server.protocol.CommandTypes.GetOutliningSpansFull,
                arguments: { file: f1.path }
            });

            // ensure the outlining spans request can be canceled
            verifyExecuteCommandSeqIsCancellable<ts.server.protocol.OutliningSpansRequestFull>({
                command: ts.server.protocol.CommandTypes.GetOutliningSpansFull,
                arguments: { file: f1.path }
            });
        }

        function verifyExecuteCommandSeqIsCancellable<T extends ts.server.protocol.Request>(request: TestSessionRequest<T>) {
            // Set the next request to be cancellable
            // The cancellation token will cancel the request the third time
            // isCancellationRequested() is called.
            cancellationToken.setRequestToCancel(session.getNextSeq());
            let operationCanceledExceptionThrown = false;

            try {
                session.executeCommandSeq(request);
            }
            catch (e) {
                assert(e instanceof ts.OperationCanceledException);
                operationCanceledExceptionThrown = true;
            }
            assert(operationCanceledExceptionThrown, "Operation Canceled Exception not thrown for request: " + JSON.stringify(request));
        }
    });
});
