export namespace Rune {
    export interface SessionProtocol {
        sn: string;
        sid: string;
        uid: string;
        credentials: Set<string>;
    }

    export interface RequestProtocol {
        sn: string;  // Serial Numbers
        sid: string; // Session ID
        aid: string; // App ID
        cmd: string; // Cmd ID
        data: any;
    }

    export interface RequestContext {
        sn: string;
        session: SessionProtocol | null;
        request: RequestProtocol;
    }

    export interface ResponseProtocol {
        sn: string;
        code: number;
        message: string;
        data: any;
    }

    export class Exception extends Error {
        public static createByResponse(response: ResponseProtocol): Exception {
            return new Exception(response.sn, response.code, response.message);
        }

        public readonly sn: string;

        public readonly code: number;

        constructor(sn: string, code: number, message: string) {
            super(message);
            this.sn = sn;
            this.code = code;
        }

        toString(): string {
            return `[${this.code}]: ${this.sn} -> ${this.message}`;
        }

        toResponse(): ResponseProtocol {
            return {
                sn: this.sn,
                code: this.code,
                message: this.message,
                data: null,
            };
        }
    }

    export type Result<T> = [T | null, Exception | null];

    export type AsyncResult<T> = Promise<Result<T>>;

    export type Service = (context: RequestContext) => AsyncResult<any>;

    export class ServiceProvider {
        private readonly services: Map<string, Service>;
        private readonly sessionProvider: (sid: string) => AsyncResult<SessionProtocol>;

        public constructor(sessionProvider: (sid: string) => AsyncResult<SessionProtocol>, services?: Map<string, Service>) {
            this.services = services ?? new Map<string, Service>();
            this.sessionProvider = sessionProvider;
        }

        public async proceed(req: RequestProtocol): Promise<ResponseProtocol> {
            const [session, err] = await this.sessionProvider(req.sid);
            if (err !== null) {
                return err.toResponse();
            }
            const service = this.services.get(`${req.aid}/${req.cmd}`);
            if (!service) {
                return new Exception(req.sn, -1, "SystemError").toResponse();
            }
            const [serviceResult, serviceErr] = await service({
                sn: req.sn, request: req, session: session
            });
            if (serviceErr !== null) {
                return serviceErr.toResponse();
            }
            return {
                sn: req.sn,
                code: 0,
                message: "SUC",
                data: serviceResult,
            };
        }
    }

    export function getSerialNumber(uid: string): string {
        return `${uid}-${(new Date().getTime()).toString(36)}-${Math.random().toString(36).substring(2)}`;
    }
}
