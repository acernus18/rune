namespace Rune {
    export class Exception extends Error {
        private readonly _code: number;
        private readonly _name: string;

        constructor(code: number, name: string, message: string) {
            super(message);
            this._code = code;
            this._name = name;
        }

        get code(): number {
            return this._code;
        }

        get name(): string {
            return this._name;
        }

        toString(): string {
            return `[${this._name}-${this._code}]: ${this.message}`;
        }
    }

    // export class Logger {
    //     public constructor() {
    //     }
    //
    //     public debug(message: string): void {
    //     }
    //
    //     public info(message: string): void {
    //     }
    //
    //     public warn(message: string): void {
    //     }
    //
    //     public error(message: string): void {
    //     }
    // }

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

    export class RequestContext implements RequestProtocol {
        public aid: string;
        public cmd: string;
        public data: any;
        public sid: string;
        public sn: string;

        constructor(sn: string, sid: string, aid: string, cmd: string, data: any) {
            this.aid = aid;
            this.cmd = cmd;
            this.data = data;
            this.sid = sid;
            this.sn = sn;
        }
    }

    export class ResponseContext implements ResponseProtocol {
        public code: number;
        public data: any;
        public message: string;
        public sn: string;

        constructor(sn: string, code: number, message: string, data: any) {
            this.code = code;
            this.data = data;
            this.message = message;
            this.sn = sn;
        }

        public static success(sn: string, data?: any): ResponseProtocol {
            return new Rune.ResponseContext(sn, 0, "SUC", data ?? null);
        }

        public static exception(sn: string, err: Exception): ResponseProtocol {
            return new Rune.ResponseContext(sn, err.code, err.toString(), null);
        }

        public static systemError(sn: string): ResponseProtocol {
            return new Rune.ResponseContext(sn, -1, "[SystemErr-(-1)]: system error.", null);
        }
    }

    type Result<T> = [T | null, Exception | null];
    type AsyncResult<T> = Promise<Result<T>>;
    type Service<SESSION, RESULT> = (session: SESSION, request: RequestProtocol) => AsyncResult<RESULT>;

    export class ServicesRouter<SESSION> {
        private readonly sessionProvider: (id: string) => AsyncResult<SESSION>;
        private readonly serviceProvider: Map<string, Map<string, Service<SESSION, any>>>;

        public constructor(sessionProvider: (id: string) => AsyncResult<SESSION>) {
            this.sessionProvider = sessionProvider;
            this.serviceProvider = new Map<string, Map<string, Service<SESSION, any>>>();
        }

        public addService(id: string, cmd: string, service: Service<SESSION, any>): void {
            let appServices = this.serviceProvider.get(id);
            if (!appServices) {
                appServices = new Map<string, Service<SESSION, any>>();
            }
            appServices.set(cmd, service);
            this.serviceProvider.set(id, appServices);
        }

        public async reply(req: RequestProtocol): Promise<ResponseProtocol> {
            const [session, err] = await this.sessionProvider(req.sid);
            if (err !== null) {
                return ResponseContext.exception(req.sn, err);
            }
            if (session === null) {
                return ResponseContext.systemError(req.sn);
            }
            const appServices = this.serviceProvider.get(req.aid);
            if (!appServices) {
                return ResponseContext.systemError(req.sn);
            }
            const service = appServices.get(req.cmd);
            if (!service) {
                return ResponseContext.systemError(req.sn);
            }
            const [serviceResult, serviceErr] = await service(session, req);
            if (serviceErr !== null) {
                return ResponseContext.exception(req.sn, serviceErr);
            }
            return ResponseContext.success(req.sn, serviceResult);
        }
    }
}

const handler = new Rune.ServicesRouter<number>(() => new Promise<[number, null]>(resolve => resolve([1, null])));

handler.addService("1", "1", (number, any) => {
    return new Promise(resolve => resolve([1, null]));
});

// function Handler(aid: string, cmd: string) {
//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         console.log(`[${propertyKey}] ${descriptor}`);
//     };
// }
//
// @Handler("2", "2")
// function service(session: number, req: any) {
//     return new Promise(resolve => resolve([1, null]));
// }

(async () => {
    const r = await handler.reply({
        sn: "1", cmd: "1", aid: "1", data: null, sid: "1"
    });
    console.log(r);
})();