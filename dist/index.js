var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var Rune;
(function (Rune) {
    class Exception extends Error {
        constructor(code, message) {
            super(message);
            this._code = code;
        }
        get code() {
            return this._code;
        }
        toString() {
            return `[${this._code}]: ${this.message}`;
        }
    }
    Rune.Exception = Exception;
    class Exceptions {
    }
    Exceptions.SystemError = new Exception(-1, "SystemError");
    Exceptions.NetworkError = new Exception(-2, "NetworkError");
    Exceptions.NotLogin = new Exception(100000, "NotLogin");
    Rune.Exceptions = Exceptions;
    class RequestContext {
        constructor(sn, sid, aid, cmd, data) {
            this.aid = aid;
            this.cmd = cmd;
            this.data = data;
            this.sid = sid;
            this.sn = sn;
        }
    }
    class ResponseContext {
        constructor(sn, code, message, data) {
            this.code = code;
            this.data = data;
            this.message = message;
            this.sn = sn;
        }
        static success(sn, data) {
            return new ResponseContext(sn, 0, "SUC", data !== null && data !== void 0 ? data : null);
        }
        static exception(sn, err) {
            return new ResponseContext(sn, err.code, err.toString(), null);
        }
        static systemError(sn) {
            return new ResponseContext(sn, -1, "[SystemErr-(-1)]: system error.", null);
        }
    }
    class ServicesRouter {
        constructor(sessionHandler) {
            this.sessionHandler = sessionHandler;
            this.serviceProvider = new Map();
        }
        addService(id, cmd, service) {
            let appServices = this.serviceProvider.get(id);
            if (!appServices) {
                appServices = new Map();
            }
            appServices.set(cmd, service);
            this.serviceProvider.set(id, appServices);
        }
        reply(req) {
            return __awaiter(this, void 0, void 0, function* () {
                const [session, err] = yield this.sessionHandler.get(req.sid);
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
                const [serviceResult, serviceErr] = yield service(session, req);
                if (serviceErr !== null) {
                    return ResponseContext.exception(req.sn, serviceErr);
                }
                return ResponseContext.success(req.sn, serviceResult);
            });
        }
    }
    Rune.ServicesRouter = ServicesRouter;
    function request(url, aid, cmd, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const sn = "id" + "-" + (new Date().getTime()).toString(36) + "-" + Math.random().toString(36).substring(2);
            const sid = sessionStorage.getItem("_rune_session_id");
            if (sid === null) {
                return [null, Exceptions.NotLogin];
            }
            const context = new RequestContext(sn, sid, aid, cmd, data);
            try {
                const response = yield fetch(url, { method: "POST", body: JSON.stringify(context) });
                if (!response.ok) {
                    return [null, Exceptions.NetworkError];
                }
                const result = (yield response.json());
                if (result.sn !== sn) {
                    return [null, Exceptions.SystemError];
                }
                if (result.code !== 0) {
                    return [null, new Exception(result.code, result.message)];
                }
                return [result.data, null];
            }
            catch (e) {
                return [null, Exceptions.SystemError];
            }
        });
    }
    Rune.request = request;
})(Rune || (Rune = {}));
// const handler = new Rune.ServicesRouter<number>(() => new Promise<[number, null]>(resolve => resolve([1, null])));
//
// handler.addService("1", "1", (number, any) => {
//     return new Promise(resolve => resolve([1, null]));
// });
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
// (async () => {
//     const r = await handler.reply({
//         sn: "1", cmd: "1", aid: "1", data: null, sid: "1"
//     });
//     console.log(r);
// })();
