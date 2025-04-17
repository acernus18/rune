declare namespace Rune {
    export class Exception extends Error {
        private readonly _code;
        constructor(code: number, message: string);
        get code(): number;
        toString(): string;
    }
    export class Exceptions {
        static SystemError: Exception;
        static NetworkError: Exception;
        static NotLogin: Exception;
    }
    export interface RequestProtocol {
        sn: string;
        aid: string;
        cmd: string;
        sid: string;
        data: any;
    }
    export interface ResponseProtocol {
        sn: string;
        code: number;
        message: string;
        data: any;
    }
    type Result<T> = [T | null, Exception | null];
    type AsyncResult<T> = Promise<Result<T>>;
    type Service<SESSION, RESULT> = (session: SESSION, request: RequestProtocol) => AsyncResult<RESULT>;
    interface SessionHandler<S> {
        get(sid: string): AsyncResult<S>;
        set(sid: string, value: S, expire: number): AsyncResult<void>;
        del(sid: string): AsyncResult<void>;
    }
    export class ServicesRouter<SESSION> {
        private readonly sessionHandler;
        private readonly serviceProvider;
        constructor(sessionHandler: SessionHandler<SESSION>);
        addService(id: string, cmd: string, service: Service<SESSION, any>): void;
        reply(req: RequestProtocol): Promise<ResponseProtocol>;
    }
    export function request<Req, Res>(url: string, aid: string, cmd: string, data: Req): AsyncResult<Res>;
    export {};
}
