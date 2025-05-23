export declare namespace Rune {
    interface SessionProtocol {
        sn: string;
        sid: string;
        uid: string;
        credentials: Set<string>;
    }
    interface RequestProtocol {
        sn: string;
        sid: string;
        aid: string;
        cmd: string;
        data: any;
    }
    interface RequestContext {
        sn: string;
        session: SessionProtocol;
        request: RequestProtocol;
    }
    interface ResponseProtocol {
        sn: string;
        code: number;
        message: string;
        data: any;
    }
    class Exception extends Error {
        static createByResponse(response: ResponseProtocol): Exception;
        readonly sn: string;
        readonly code: number;
        constructor(sn: string, code: number, message: string);
        toString(): string;
        toResponse(): ResponseProtocol;
    }
    type Result<T> = [T | null, Exception | null];
    type AsyncResult<T> = Promise<Result<T>>;
    type Service = (context: RequestContext) => AsyncResult<any>;
    class ServiceProvider {
        private readonly services;
        private readonly sessionProvider;
        constructor(sessionProvider: (sid: string) => AsyncResult<SessionProtocol>);
        proceed(req: RequestProtocol): Promise<ResponseProtocol>;
    }
    function getSerialNumber(uid: string): string;
}
